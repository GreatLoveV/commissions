import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Only files in src/lib may talk to the database directly.
    // Pages, actions and components go through tenantDb() or a lib function,
    // so a query without an artist id cannot be written by accident.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/db", "**/lib/db", "@/generated/prisma/client"],
              message:
                "Use tenantDb() from @/lib/tenant or a function in src/lib instead of the raw database client.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
]);

export default eslintConfig;
