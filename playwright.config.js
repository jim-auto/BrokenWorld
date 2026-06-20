const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx serve . -l 8765',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: true,
    timeout: 15000,
  },
});
