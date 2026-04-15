import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Exclude stale Claude-worktree copies so they don't shadow the live
    // source files during test runs.
    exclude: ["node_modules", "dist", ".next", ".claude/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
