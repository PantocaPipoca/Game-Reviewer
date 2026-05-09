import pino from "pino";
import fs from "fs";

const isProd = process.env["NODE_ENV"] === "production";

const streams: pino.StreamEntry[] = [
    { stream: process.stdout },
    ...(isProd ? [{ stream: fs.createWriteStream("/app/logs/app.log", { flags: "a" }) }] : []),
];

const logger = pino(
    {
        level: process.env["PINO_LOG_LEVEL"] ?? "info",
        formatters: {
            level: (label) => ({ level: label.toUpperCase() }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        redact: {
            paths: [
                "password",
                "passwordHash",
                "token",
                "authorization",
                "email",
                "*.password",
                "*.passwordHash",
                "*.token",
                "*.email",
                "req.headers.authorization",
                "req.headers.cookie",
                "csrf-token",
            ],
            censor: "[Redacted]",
        },
    },
    pino.multistream(streams)
);

export default logger;
