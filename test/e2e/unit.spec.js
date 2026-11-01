// test/e2e/unit.spec.js
// Unified Playwright test runner executing all unit test suites in browser environment

import { test, expect } from '@playwright/test';

test.describe('Unit Test Suites via Playwright', () => {
  test('all 6 unit test seams execute cleanly with 0 failures in browser', async ({ page }) => {
    // Navigate to test.html served by local server
    await page.goto('/test.html');

    // Wait until test runner completes
    await page.waitForFunction(() => window.__TEST_RESULTS__ && window.__TEST_RESULTS__.done === true, {
      timeout: 30000
    });

    const results = await page.evaluate(() => window.__TEST_RESULTS__);
    
    expect(results).toBeDefined();
    expect(results.total).toBeGreaterThanOrEqual(43);
    expect(results.failed).toBe(0);
    expect(results.passed).toBe(results.total);

    // Verify DOM summary banner indicates all passed
    const header = page.locator('.header');
    await expect(header).toHaveClass(/all-passed/);
    await expect(page.locator('.summary-badge .failed')).toHaveText('Failed: 0');
  });
});
