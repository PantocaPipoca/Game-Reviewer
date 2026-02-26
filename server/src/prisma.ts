import "dotenv/config";
import {PrismaPg} from '@prisma/adapter-pg'
import {PrismaClient} from './generated/prisma/client'

const isTest = process.env['NODE_ENV'] === "test";

const connectionString = isTest
  ? process.env['TEST_DATABASE_URL']
  : process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error("Database connection string not found");
}

const adapter: PrismaPg     = new PrismaPg({ connectionString })
const prisma: PrismaClient  = new PrismaClient({ adapter })

export {prisma}