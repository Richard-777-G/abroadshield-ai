import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    alias: {
      "bun:test": path.resolve(import.meta.dirname, "./src/lib/test-bridge.ts"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
