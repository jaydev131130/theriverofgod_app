import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for The River of God App
 *
 * This configuration is for testing the Expo web version of the app.
 * Run `npx expo start --web` before running tests.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.test.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // Base URL for Expo web server
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Optionally start the Expo web server before tests
  // webServer: {
  //   command: 'npx expo start --web --port 8081',
  //   url: 'http://localhost:8081',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
