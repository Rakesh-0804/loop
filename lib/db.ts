import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl() {
  if (process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const rootDbPath = path.join(process.cwd(), 'dev.db');
        if (fs.existsSync(rootDbPath)) {
          fs.copyFileSync(rootDbPath, tmpDbPath);
        }
      }
      return `file:${tmpDbPath}`;
    } catch (e) {
      console.error('Failed to prepare Vercel tmp database:', e);
    }
  }
  return process.env.DATABASE_URL || 'file:dev.db';
}

const dbUrl = getDatabaseUrl();
const adapter = new PrismaBetterSqlite3({ url: dbUrl });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;