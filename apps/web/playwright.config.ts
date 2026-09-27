import { defineConfig, devices } from '@playwright/test';

// The E2E test runs the real API and web app against their own database, so it never touches
// your development data. globalSetup migrates and seeds that database before every run.
const DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? 'postgresql://clinicq:clinicq@localhost:5432/clinicq_e2e';
const API_PORT = 3100;
const WEB_PORT = 5174;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optional: point at an already-installed Chromium instead of Playwright's download.
        launchOptions: process.env.CHROMIUM_PATH
          ? { executablePath: process.env.CHROMIUM_PATH }
          : {},
      },
    },
  ],
  webServer: [
    {
      command: 'npx tsx src/server.ts',
      cwd: '../api',
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      env: {
        NODE_ENV: 'test',
        PORT: String(API_PORT),
        DATABASE_URL,
        JWT_SECRET: 'e2e-secret-that-is-at-least-32-characters-long',
        CORS_ORIGIN: `http://localhost:${WEB_PORT}`,
        LOG_LEVEL: 'warn',
      },
    },
    {
      command: 'npx vite',
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      env: {
        WEB_PORT: String(WEB_PORT),
        API_PROXY_TARGET: `http://localhost:${API_PORT}`,
      },
    },
  ],
});
