import { PRISMA } from "../../src/Prisma";
import { afterAll } from "@jest/globals";

// This is used in jest.unit.config.mjs

// afterAll tests disconnect from database
afterAll(async () => {
    await PRISMA.$disconnect();
});
