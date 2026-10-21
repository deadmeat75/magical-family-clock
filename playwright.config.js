import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1400, height: 950 },
  },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        launchOptions: process.env.MFC_CHROMIUM
          ? { executablePath: process.env.MFC_CHROMIUM }
          : {},
      },
    },
  ],
});
