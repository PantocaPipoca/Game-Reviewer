import "dotenv/config";
import {PrismaPg} from '@prisma/adapter-pg'
import {PrismaClient} from './generated/prisma/client'

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error("Database connection string not found");
}

const adapter: PrismaPg     = new PrismaPg({ connectionString })
const prisma: PrismaClient  = new PrismaClient({ adapter })

export {prisma}