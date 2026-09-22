import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL },
    },
  ],
  webServer: [
    {
      command: 'node tests/server.cjs',
      url: 'http://127.0.0.1:4100/tasks',
      timeout: 30000,
      reuseExistingServer: false,
    },
    {
      command: 'node node_modules/next/dist/bin/next start -p 3100 -H 127.0.0.1',
      url: 'http://127.0.0.1:3100',
      timeout: 60000,
      reuseExistingServer: false,
      env: { NEXT_PUBLIC_BACKEND_API_URL: 'http://127.0.0.1:4100', NEXT_DIST_DIR: '.next-test' },
    },
  ],
});
