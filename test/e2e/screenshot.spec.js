// test/e2e/screenshot.spec.js
import { test } from '@playwright/test';

test('take screenshots of all 3 games', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  // Dyson Swarm: buy gen1, jump 15m to reveal metagenerator, upgrade, and prestige
  await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
  await page.locator('button[data-jump-ms="900000"]').click();
  await page.locator('#btn-close-offline-modal').click();
  await page.screenshot({ path: 'test-results/screenshot-dyson-swarm.png', fullPage: true });

  // Aetherforge
  await page.locator('#game-select').selectOption('aetherforge');
  await page.waitForTimeout(200);
  await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
  await page.locator('button[data-jump-ms="900000"]').click();
  await page.locator('#btn-close-offline-modal').click();
  await page.screenshot({ path: 'test-results/screenshot-aetherforge.png', fullPage: true });

  // Sunken Observatory
  await page.locator('#game-select').selectOption('sunken-observatory');
  await page.waitForTimeout(200);
  await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
  await page.locator('button[data-jump-ms="900000"]').click();
  await page.locator('#btn-close-offline-modal').click();
  await page.screenshot({ path: 'test-results/screenshot-sunken-observatory.png', fullPage: true });
});
