import { defineConfig, devices } from "@playwright/test";
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
      name: "webkit-iphone",
      testMatch: "**/mobile.spec.js",
      use: {
        ...devices["iPhone 13 Pro Max"],
        browserName: "webkit",
        viewport: { width: 440, height: 956 },
      },
    },
    {
      name: "webkit-ipad",
      testMatch: "**/mobile.spec.js",
      use: {
        ...devices["iPad Pro 11"],
        browserName: "webkit",
        viewport: { width: 820, height: 1180 },
      },
    },
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
