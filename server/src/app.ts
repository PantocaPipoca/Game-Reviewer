import express from 'express'
import router from './routes/router.js'
import cors from 'cors'
import { AppError } from './utils/ErrorHandler';
import { StatusCodes } from 'http-status-codes';
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Big int to string
app.set('json replacer', (_key: string, value: any) =>
    typeof value === 'bigint' ? value.toString() : value
);

// Health check
app.get('/api/health', (_, res) => res.json({status: 'ok', message: "Game Reviewer API"}));

// Swagger docs
app.get('/api/docs.json', (_, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// App routes
app.use('/api', router);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err instanceof AppError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || "Internal server error";

    res.status(status).json({ status: 'error', message });
});

export default app;
