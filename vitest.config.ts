/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true, // describe/it/expect without imports
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/e2e/**"], // Playwright lives in /e2e
    coverage: {
      reporter: ["text", "html"],
      exclude: [
        "**/*.config.*",
        "**/*.d.ts",
        "src/sanity/**", // schema is config, not logic
        "src/app/**/layout.tsx",
        "src/app/**/page.tsx", // pages tested via E2E, not units
        "e2e/**",
      ],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
