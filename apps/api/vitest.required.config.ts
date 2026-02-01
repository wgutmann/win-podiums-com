import { defineConfig } from "vitest/config";
import path from "path";

/** Vitest config for required tests only. Used in CI so required run before optional. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["test/required/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
