import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Exclude stale Claude-worktree copies so they don't shadow the live
    // source files during test runs.
    // e2e/ holds Playwright specs (*.spec.ts) run by `playwright test`, not
    // vitest — exclude them so vitest doesn't try to collect the Playwright
    // `test` fixture and fail.
    exclude: ["node_modules", "dist", ".next", ".claude/**", "e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
