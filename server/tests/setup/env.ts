import dotenv from "dotenv";

dotenv.config({
    path: ".env.test",
    override: true,
});

const requiredVars = ["DATABASE_URL", "JWT_SECRET", "CSRF_SECRET", "RATE_LIMIT_MAX"];

for (const key of requiredVars) {
    if (!process.env[key])
        throw new Error(`${key} not found in .env.test`);
}