// playwright.config.js
// Configuration for Playwright End-to-End tests

export default {
  testDir: './test/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8000',
    headless: true
  },
  webServer: {
    command: 'node test/e2e/server.js',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI
  }
};
