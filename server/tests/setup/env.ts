import dotenv from "dotenv";

// This is used in jest.unit.config.mjs and jest.integration.config.mjs

const path: string = ".env.test";

// Load environment variables from .env.test
dotenv.config({
    path: path,
});

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not found in" + path);
}

if (!process.env.JWT_SECRET) {
  throw new Error(`JWT_SECRET not found in ${path}`);
}

process.env['RATE_LIMIT_MAX'] = '10000';