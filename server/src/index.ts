import { createApp } from "./App.js";
import { Express } from "express";
import logger from "./utils/Logger.js";

const app: Express = createApp();
const PORT = process.env["PORT"] || 3000;

process.on("uncaughtException", (err) => {
    logger.fatal(err, "Uncaught exception");
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled promise rejection");
    process.exit(1);
});

app.listen(PORT, () => {
    logger.info({ port: PORT }, `Server running on http://localhost:${PORT}`);
});
