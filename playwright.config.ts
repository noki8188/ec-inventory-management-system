import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 90_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://host.docker.internal:5173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off"
  }
});
