import { CreateApp } from './app.js';
import { Express } from 'express';

const app: Express = CreateApp();
const PORT = process.env['PORT'] || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));