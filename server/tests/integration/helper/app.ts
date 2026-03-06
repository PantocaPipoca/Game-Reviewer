import express from "express";
import apiRoutes from "../../../src/routes/router";

// Used in all integration tests

// Creates an express app for testing

export function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use("/api", apiRoutes);
    app.set('json replacer', (_key: string, value: any) =>
        typeof value === 'bigint' ? value.toString() : value
    );
    return app;
}