import express from "express";
import apiRoutes from "../../../src/routes/router";
import cookieParser from "cookie-parser";
import { AppError } from "../../../src/utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";

export function createTestApp() {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    app.use("/api", apiRoutes);

    app.set('json replacer', (_key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value
    );

    // Error handler — must match app.ts
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const status = err instanceof AppError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
        const message = err.message || "Internal server error";
        res.status(status).json({ status: 'error', message });
    });
    
    return app;
}