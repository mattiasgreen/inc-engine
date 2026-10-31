// test/e2e/mobile-spa.spec.js
// Comprehensive test suite for mobile SPA mode: button responsiveness, scrolling, tabs, and gameplay loop

import { test, expect } from '@playwright/test';

test.describe('Mobile SPA Gameplay & Button Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Mobile iPhone SE / small screen viewport
    await page.setViewportSize({ width: 375, height: 667 });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Clear saves for clean test run
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('Stage 1: Initial state on mobile has visible, clickable Buy buttons', async ({ page }) => {
    // Check currency display starts with 10
    const currency = page.locator('#layer0-currency');
    await expect(currency).toHaveText(/10/);

    // Buy 1 Solar Drone button must be fully visible and enabled
    const buy1Btn = page.locator('#layer0-generators .card').first().locator('.btn-buy-1');
    await expect(buy1Btn).toBeVisible();
    await expect(buy1Btn).toBeEnabled();

    // Click Buy 1 Solar Drone
    await buy1Btn.click();

    // Verify owned badge updates to 1 and currency updates
    const ownedBadge = page.locator('#layer0-generators .card').first().locator('.owned-badge');
    await expect(ownedBadge).toHaveText('Owned: 1');
    await expect(currency).toBeVisible();
  });

  test('Stage 2: Mobile tabs navigation allows time skipping in Sandbox and returning to Operations', async ({ page }) => {
    // First buy 1 Solar Drone so production runs
    const buy1Btn = page.locator('#layer0-generators .card').first().locator('.btn-buy-1');
    await buy1Btn.click();

    // Switch to Sandbox tab
    const sandboxTab = page.locator('button[data-tab="sandbox-panel"]');
    await expect(sandboxTab).toBeVisible();
    await sandboxTab.click();

    // Verify sandbox panel is visible and operations is hidden
    await expect(page.locator('#sandbox-panel')).toBeVisible();
    await expect(page.locator('#layer0-panel')).toBeHidden();

    // Click +15 Min jump
    const jumpBtn = page.locator('button[data-jump-ms="900000"]');
    await expect(jumpBtn).toBeVisible();
    await jumpBtn.click();

    // Close offline modal
    const closeBtn = page.locator('#btn-close-offline-modal');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Switch back to Operations tab
    const opsTab = page.locator('button[data-tab="layer0-panel"]');
    await opsTab.click();

    await expect(page.locator('#layer0-panel')).toBeVisible();
    await expect(page.locator('#sandbox-panel')).toBeHidden();

    // Verify accumulated currency and click Buy Max
    const currency = page.locator('#layer0-currency');
    await expect(currency).not.toHaveText('0');

    const buyMaxBtn = page.locator('#layer0-generators .card').first().locator('.btn-buy-max');
    await expect(buyMaxBtn).toBeEnabled();
    await buyMaxBtn.click();

    // Verify owned count increased significantly
    const ownedBadge = page.locator('#layer0-generators .card').first().locator('.owned-badge');
    await expect(ownedBadge).not.toHaveText('Owned: 0');
    await expect(ownedBadge).not.toHaveText('Owned: 1');
  });

  test('Stage 3: Progressive reveal dynamically unlocks Ascension tab on mobile and permits prestige', async ({ page }) => {
    // Buy 1 generator
    await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();

    // Jump 24 hours via Sandbox tab
    const sandboxTab = page.locator('button[data-tab="sandbox-panel"]');
    await sandboxTab.click();
    await page.locator('button[data-jump-ms="86400000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Switch to Operations, buy max, jump again to comfortably pass 1e6 threshold
    await page.locator('button[data-tab="layer0-panel"]').click();
    await page.locator('#layer0-generators .card').first().locator('.btn-buy-max').click();

    await sandboxTab.click();
    await page.locator('button[data-jump-ms="86400000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Verify Ascension tab has unlocked and is visible
    const ascensionTab = page.locator('#mobile-tab-l1');
    await expect(ascensionTab).toBeVisible();

    // Click Ascension tab
    await ascensionTab.click();
    await expect(page.locator('#layer1-panel')).toBeVisible();
    await expect(page.locator('#prestige-art-card')).toBeVisible();

    // Prestige button is ready and clickable
    const prestigeBtn = page.locator('#btn-prestige');
    await expect(prestigeBtn).toBeEnabled();
    await expect(prestigeBtn).toHaveClass(/danger/);
    await prestigeBtn.click();

    // Verify prestige currency received
    await expect(page.locator('#layer1-currency')).not.toHaveText('0');
  });

  test('Stage 4: Game Switcher works on mobile and preserves full button interactivity', async ({ page }) => {
    // Switch to Aetherforge
    await page.locator('#game-select').selectOption('aetherforge');
    await expect(page.locator('#game-title')).toContainText('Aetherforge');
    await expect(page.locator('#character-name')).toHaveText('Archmage Vaelen');

    // Click Buy 1 Runic Familiar
    const aetherBuy1 = page.locator('#layer0-generators .card').first().locator('.btn-buy-1');
    await expect(aetherBuy1).toBeVisible();
    await aetherBuy1.click();
    await expect(page.locator('#layer0-generators .card').first().locator('.owned-badge')).toHaveText('Owned: 1');

    // Switch to Sunken Observatory
    await page.locator('#game-select').selectOption('sunken-observatory');
    await expect(page.locator('#game-title')).toContainText('Sunken Observatory');
    await expect(page.locator('#character-name')).toHaveText('Curator Ambrose');

    // Click Buy 1 Cult Acolyte
    const sunkenBuy1 = page.locator('#layer0-generators .card').first().locator('.btn-buy-1');
    await expect(sunkenBuy1).toBeVisible();
    await sunkenBuy1.click();
    await expect(page.locator('#layer0-generators .card').first().locator('.owned-badge')).toHaveText('Owned: 1');
  });

  test('Stage 5: Mobile app backgrounding and resume advances Offline Progress and shows OfflineReport modal', async ({ page }) => {
    // Buy 1 generator so production occurs
    const buy1Btn = page.locator('#layer0-generators .card').first().locator('.btn-buy-1');
    await buy1Btn.click();
    await expect(page.locator('#layer0-generators .card').first().locator('.owned-badge')).toHaveText('Owned: 1');

    // Simulate switching away to another Android app: set active timestamp 60 seconds in the past
    await page.evaluate(() => {
      const activeGame = localStorage.getItem('inc_engine_active_game') || 'dyson-swarm';
      const storageKey = `inc_engine_save_${activeGame}`;
      const activeTimeKey = `${storageKey}_active_time`;

      const sixtySecondsAgo = Date.now() - 60000;
      localStorage.setItem(activeTimeKey, String(sixtySecondsAgo));

      // Also simulate in save JSON
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        data.savedAtMs = sixtySecondsAgo;
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    });

    // Simulate returning to the app via window focus & visibilitychange
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Offline Progress modal must appear
    const modal = page.locator('#offline-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#offline-summary')).toContainText('You were offline for');

    // Click Collect & Continue
    await page.locator('#btn-close-offline-modal').click();
    await expect(modal).toBeHidden();

    // Verify currency earned offline is reflected
    const currency = page.locator('#layer0-currency');
    await expect(currency).not.toHaveText('0');
  });
});
