import pino from "pino";

const isDev = process.env["NODE_ENV"] !== "production";

const transport = pino.transport({
    targets: isDev
        ? [
              {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      translateTime: "SYS:HH:MM:ss",
                      ignore: "pid,hostname",
                  },
              },
          ]
        : [
              {
                  target: "pino/file",
                  options: { destination: 1 }, // 1 = stdout
              },
          ],
});

const logger = pino(
    {
        level: process.env["PINO_LOG_LEVEL"] ?? "info",
        formatters: {
            level: (label) => ({ level: label.toUpperCase() }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        // These will show as [Redacted] if accidentally logged
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
    transport
);

export default logger;
