import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './visual-verify',
  timeout: 30000,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npm run dev:server',
      cwd: '..',
      url: 'http://localhost:3000/api/settings',
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm run dev:client',
      cwd: '..',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
