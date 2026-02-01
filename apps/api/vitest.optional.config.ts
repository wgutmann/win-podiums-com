import { defineConfig } from "vitest/config";
import path from "path";

/** Vitest config for optional tests only. Used in CI after required tests pass. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/optional/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
