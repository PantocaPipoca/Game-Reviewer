import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const CONNECTION_STRING = process.env["DATABASE_URL"];

if (!CONNECTION_STRING) {
    throw new Error("Database connection string not found");
}

const ADAPTER: PrismaPg = new PrismaPg({ connectionString: CONNECTION_STRING });
const PRISMA: PrismaClient = new PrismaClient({ adapter: ADAPTER });

export { PRISMA };
