import { createApp } from "./App.js";
import { Express } from "express";

const app: Express = createApp();
const PORT = process.env["PORT"] || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
