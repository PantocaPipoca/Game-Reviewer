import express from 'express'
import router from './routes/router.js'

const app = express()

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', router);

// Big int to string
app.set('json replacer', (_key: string, value: any) =>
    typeof value === 'bigint' ? value.toString() : value
);

// Health check
app.get('/api/health', (_, res) => res.json({status: 'ok', message: "Game Reviewer API"}));

export default app;
