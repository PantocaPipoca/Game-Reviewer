import dotenv from "dotenv";

// This is used in jest.unit.config.mjs and jest.integration.config.mjs

const path: string = ".env.test";

// Load environment variables from .env.test
dotenv.config({
    path: path,
    override: true,
});

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not found in" + path);
}