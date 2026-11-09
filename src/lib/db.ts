import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// This is the only place the Prisma client is created.
// App code should not import it directly: use tenantDb() from lib/tenant.ts
// so every query is scoped to the logged in artist.

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

// In dev, Next.js reloads modules on every change. Without this we would
// open a new connection pool on each reload and run out of connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
