// test/e2e/game.spec.js
// End-to-End browser test suite for inc-engine using Playwright

import { test, expect } from '@playwright/test';

test.describe('inc-engine End-to-End User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Handle any window.confirm / window.alert / window.prompt dialogs
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.goto('/');
    // Wait for the app to initialize and mount cards
    await expect(page.locator('#layer0-generators .card').first()).toBeVisible();
  });

  test('Stage 1 & 2: Hard reset to initial state, verify 10 Energy, and buy first generator', async ({ page }) => {
    // Hard reset to ensure fresh state
    await page.locator('#btn-hard-reset').click();

    // Verify initial state
    await expect(page.locator('#layer0-currency')).toHaveText(/10/);
    const gen1Card = page.locator('#layer0-generators .card').first();
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 0');

    // Buy 1 Generator I
    const buy1Btn = gen1Card.locator('.btn-buy-1');
    await expect(buy1Btn).toBeEnabled();
    await buy1Btn.click();

    // Verify owned becomes 1
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 1');
    await expect(gen1Card.locator('.output-meta')).toContainText('1 E/tick');
  });

  test('Stage 3: Time skipping via dev sandbox unlocks secondary generators', async ({ page }) => {
    // Reset and buy generator 1
    await page.locator('#btn-hard-reset').click();
    const gen1Card = page.locator('#layer0-generators .card').first();
    await gen1Card.locator('.btn-buy-1').click();
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 1');

    // Time skip +15 Min
    await page.locator('button[data-jump-ms="900000"]').click();

    // Offline progress modal should appear
    const modal = page.locator('#offline-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#offline-summary')).toContainText('Energy gained');
    await page.locator('#btn-close-offline-modal').click();
    await expect(modal).toBeHidden();

    // Generator II should now be unlocked (requires 200 total Energy)
    const gen2Card = page.locator('#layer0-generators .card').nth(1);
    await expect(gen2Card.locator('.lock-view')).toBeHidden();
    await expect(gen2Card.locator('.main-view')).toBeVisible();
    await expect(gen2Card.locator('.btn-buy-1')).toBeEnabled();
  });

  test('Stage 4: Purchasing secondary generators and upgrades boosts telemetry', async ({ page }) => {
    await page.locator('#btn-hard-reset').click();
    await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();

    // Skip 1 hour to have ample energy
    await page.locator('button[data-jump-ms="3600000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Buy Generator II
    const gen2Card = page.locator('#layer0-generators .card').nth(1);
    await gen2Card.locator('.btn-buy-1').click();
    await expect(gen2Card.locator('.owned-badge')).toHaveText('Owned: 1');

    // Buy Cycle Accelerator upgrade
    const cycleUpg = page.locator('#layer0-upgrades .card').first();
    await cycleUpg.locator('.btn-upgrade').click();
    await expect(cycleUpg.locator('.lvl-badge')).toContainText('Lvl 1');

    // Verify telemetry cycle frequency increased from 1.00 /s to 1.15 /s
    await expect(page.locator('#telemetry-cycle-freq')).toHaveText('1.15 /s');
  });

  test('Stage 5: Full Prestige cycle resets Layer 0 and awards Layer 1 Prestige Cores', async ({ page }) => {
    await page.locator('#btn-hard-reset').click();
    await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();

    // Skip 24 Hours multiple times to comfortably exceed 1,000,000 Energy
    await page.locator('button[data-jump-ms="86400000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Buy more generators and skip again to reach 1e6
    const gen1Card = page.locator('#layer0-generators .card').first();
    await gen1Card.locator('.btn-buy-max').click();
    const gen2Card = page.locator('#layer0-generators .card').nth(1);
    await gen2Card.locator('.btn-buy-max').click();

    await page.locator('button[data-jump-ms="86400000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Verify Prestige button is enabled with danger styling
    const prestigeBtn = page.locator('#btn-prestige');
    await expect(prestigeBtn).toBeEnabled();
    await expect(prestigeBtn).toHaveClass(/danger/);
    await expect(prestigeBtn).toContainText('Prestige for +');

    // Execute Prestige Reset
    await prestigeBtn.click();

    // Verify Layer 1 gained Cores and passive multiplier is > 1.00x
    await expect(page.locator('#layer1-currency')).not.toHaveText('0');
    await expect(page.locator('#layer1-passive-mult')).not.toHaveText('1.00x');

    // Verify Layer 0 was reset back to 0 owned generators and initial currency
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 0');
    await expect(page.locator('#layer0-currency')).toHaveText(/10/);
  });
});
