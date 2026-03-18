import express from 'express'
import router from './routes/router.js'
import cors from 'cors'
import { AppError } from './utils/ErrorHandler';
import { StatusCodes } from 'http-status-codes';
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(helmet());

// limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '100'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        res.status(429).json({ status: 'error', message: 'Too many requests' });
    }
})
app.use(limiter)

// Big int to string
app.set('json replacer', (_key: string, value: any) =>
    typeof value === 'bigint' ? value.toString() : value
);

// Health check
app.get('/api/health', (_, res) => res.json({status: 'ok', message: "Game Reviewer API"}));

// Swagger docs
if (process.env['NODE_ENV'] !== 'production') {
  app.get('/api/docs.json', (_, res) => res.json(swaggerSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// App routes
app.use('/api', router);

// 404 catch-all
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof AppError)
        return res.status(err.statusCode).json({ status: 'error', message: err.message });

    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        { status: 'error', message: 'Internal server error' });
});

export default app;
