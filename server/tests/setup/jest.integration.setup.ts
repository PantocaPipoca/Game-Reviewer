import { prisma } from "../../src/prisma";

// This is used in jest.integration.config.mjs

// Before each test reset database
beforeEach(async () => {
  const rows = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `);

  if (rows.length === 0) return;

  const tables = rows.map(r => `"${r.tablename.replace(/"/g, '""')}"`).join(", ");

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
});

// After all tests disconnect from database
afterAll(async () => {
  await prisma.$disconnect();
});