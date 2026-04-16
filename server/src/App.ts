import express, { Express } from "express";
import router from "./routes/Router.js";
import cors from "cors";
import { AppError } from "./utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import SWAGGER_SPEC from "./utils/Swagger.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { doubleCsrf } from "csrf-csrf";
import { middleware as openAPIValidator } from "express-openapi-validator";
import pinoHttp from "pino-http";
import logger from "./utils/Logger.js";
import { register, httpRequestDuration, httpRequestsTotal } from "./utils/Metrics.js";
import { randomUUID } from "crypto";

export function createApp(): Express {
    const app: Express = express();

    app.use(
        pinoHttp({
            logger,
            genReqId: (req) => (req.headers["x-request-id"] as string) || randomUUID(),
            autoLogging: {
                ignore: (req) => req.url === "/api/health" || req.url === "/api/metrics",
            },
        })
    );

    // Metrics
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path ?? req.path;
            const labels = { method: req.method, route, status_code: res.statusCode };
            httpRequestDuration.observe(labels, duration);
            httpRequestsTotal.inc(labels);
        });
        next();
    });

    app.use(
        cors({
            origin: "http://localhost:5173",
            credentials: true,
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(helmet());

    // limiter
    const limiter = rateLimit({
        windowMs: 60 * 1000,
        max: parseInt(process.env["RATE_LIMIT_MAX"] ?? "200"),
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
            logger.warn({ ip: _req.ip, path: _req.path }, "Rate limit exceeded");
            res.status(429).json({ status: "error", message: "Too many requests" });
        },
    });
    app.use(limiter);

    const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
        getSecret: () => process.env["CSRF_SECRET"]!,
        getSessionIdentifier: (req) => req.cookies["token"] ?? "",
        cookieName: "csrf-token",
        cookieOptions: {
            sameSite: "strict",
            secure: process.env["NODE_ENV"] === "production",
            httpOnly: true,
        },
        ignoredMethods: ["GET", "HEAD", "OPTIONS"],

        getCsrfTokenFromRequest: (req) => {
            const headerToken = req.headers["x-csrf-token"];
            return typeof headerToken === "string" ? headerToken : "";
        },
    });

    if (process.env["NODE_ENV"] !== "test") {
        app.get("/api/csrf-token", (req, res) => {
            const csrfToken = generateCsrfToken(req, res);
            res.json({
                status: "success",
                data: { csrfToken },
            });
        });

        app.use(doubleCsrfProtection);
    }

    // Big int to string
    app.set("json replacer", (_key: string, value: any) => (typeof value === "bigint" ? value.toString() : value));

    app.get("/api/health", (_, res) => res.json({ status: "ok", message: "Game Reviewer API" }));

    app.get("/api/metrics", async (_req, res) => {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    });

    // Swagger docs
    if (process.env["NODE_ENV"] !== "production") {
        app.get("/api/docs.json", (_, res) => res.json(SWAGGER_SPEC));
        app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(SWAGGER_SPEC));
    }

    // Contract validator
    app.use(
        openAPIValidator({
            apiSpec: SWAGGER_SPEC as any,
            validateRequests: true,
            validateResponses: true,
            validateSecurity: false,
            ignorePaths: /\/users\/(me\/avatar|id\/.*\/avatar)/, // ignore /users/me/avatar and /users/id/{id}/avatar
        })
    );

    // App routes
    app.use("/api", router);

    // 404 catch-all
    app.use((_req: express.Request, res: express.Response) => {
        res.status(404).json({ status: "error", message: "Route not found" });
    });

    // Error handler
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const isProd = process.env["NODE_ENV"] === "production";

        if (err?.code === "EBADCSRFTOKEN") {
            return res.status(StatusCodes.FORBIDDEN).json({
                status: "error",
                message: "Invalid CSRF token",
            });
        }

        if (err instanceof AppError) {
            return res.status(err.status).json({
                status: "error",
                message: err.message,
            });
        }

        if (typeof err?.status === "number") {
            return res.status(err.status).json({
                status: "error",
                message: isProd ? safeMessage(err.status) : (err.message ?? "Request failed"),
            });
        }

        logger.error(err, "Unhandled server error");

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Internal server error",
        });
    });

    return app;
}

function safeMessage(status: number): string {
    switch (status) {
        case 400:
            return "Bad request";
        case 401:
            return "Unauthorized";
        case 403:
            return "Forbidden";
        case 404:
            return "Not found";
        case 405:
            return "Method not allowed";
        case 409:
            return "Conflict";
        case 429:
            return "Too many requests";
        default:
            return "Request failed";
    }
}
