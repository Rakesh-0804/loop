import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || process.env["POSTGRES_URL"] || "postgresql://neondb_owner:npg_JLVuyth5XSk3@ep-nameless-pond-azsr3y63-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  },
});