import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Test files stub Supabase clients, fetch, and DOM APIs with loose
    // shapes; typing every mock is cost without benefit. App code keeps the
    // rule at error.
    files: ["src/__tests__/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  {
    // These two rules describe what the React Compiler needs in order to
    // memoize a component, not runtime bugs; the codebase does not enable the
    // compiler (no `reactCompiler` in next.config.ts). Kept as warnings so
    // the sites stay visible for a future adoption without failing lint.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
