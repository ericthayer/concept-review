import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: [['list']],
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'node scripts/serve.ts',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env['CI'],
    env: { PORT: '4321' },
  },
});
