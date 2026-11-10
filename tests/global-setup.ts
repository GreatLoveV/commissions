import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import type { TestProject } from "vitest/node";

// Runs once before all tests: brings the test database up to date.
export default function setup(project: TestProject) {
  // the url is set in vitest.config.mts
  const url = String(project.config.env.DATABASE_URL ?? "");
  assertTestDatabase(url);

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });

  // runs after all tests: remove the files they uploaded
  return () => {
    const uploads = project.config.env.LOCAL_UPLOADS_DIR;
    if (uploads) rmSync(String(uploads), { recursive: true, force: true });
  };
}

// Tests delete every row. Refuse to run against anything that is not
// clearly a test database.
export function assertTestDatabase(url: string) {
  const name = url ? new URL(url).pathname.slice(1) : "";
  if (!name.endsWith("_test")) {
    throw new Error(
      `Refusing to run tests against "${name}". The database name must end with _test.`,
    );
  }
}
