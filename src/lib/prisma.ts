import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const url = process.env["DATABASE_URL"] ?? "file:./prisma/dev.db";
  return new PrismaClient({
    adapter: new PrismaBetterSQLite3({ url }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
