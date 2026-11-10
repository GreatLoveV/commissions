import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests always run against a separate database so they can wipe tables.
// The default matches docker-compose.yml.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/commissions_test";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      // uploaded test files go to a temp folder, not the project
      LOCAL_UPLOADS_DIR: path.join(tmpdir(), "commissions-test-uploads"),
    },
    globalSetup: "./tests/global-setup.ts",
    // the test files share one database, so they run one after another
    fileParallelism: false,
  },
});
