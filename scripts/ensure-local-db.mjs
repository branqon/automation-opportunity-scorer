import "dotenv/config";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

if (!databaseUrl.startsWith("file:")) {
  console.log(
    `[db:ensure] Skipping bootstrap for non-SQLite datasource: ${databaseUrl}`,
  );
  process.exit(0);
}

const relativePath = databaseUrl.slice("file:".length);
const absolutePath = resolve(process.cwd(), relativePath);

if (existsSync(absolutePath)) {
  console.log(`[db:ensure] Using existing local database at ${relativePath}.`);
  process.exit(0);
}

mkdirSync(dirname(absolutePath), { recursive: true });

console.log(`[db:ensure] Creating seeded local database at ${relativePath}.`);
execSync("npx prisma db push", { stdio: "inherit" });
execSync("npx prisma db seed", { stdio: "inherit" });
