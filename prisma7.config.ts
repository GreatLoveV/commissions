import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// The Prisma CLI does not read .env by itself. Node can load it without
// an extra package. On the host (Vercel) there is no .env file and the
// variables come from the environment instead.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Hosted Postgres (Neon) gives two urls. The app uses the pooled one.
    // Migrations need the direct one, so DIRECT_URL wins when it is set.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
