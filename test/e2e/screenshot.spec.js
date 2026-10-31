// test/e2e/screenshot.spec.js
import { test, expect } from '@playwright/test';

test('take desktop and mobile screenshots of all 3 games with animations & scenery', async ({ page }) => {
  // Desktop 1280x900
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');

  // Dyson Swarm Desktop
  await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
  await page.locator('button[data-jump-ms="900000"]').click();
  await page.locator('#btn-close-offline-modal').click();
  await page.screenshot({ path: 'test-results/desktop-dyson-swarm.png', fullPage: true });

  // Aetherforge Desktop
  await page.locator('#game-select').selectOption('aetherforge');
  await page.waitForTimeout(200);
  await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
  await page.locator('button[data-jump-ms="900000"]').click();
  await page.locator('#btn-close-offline-modal').click();
  await page.screenshot({ path: 'test-results/desktop-aetherforge.png', fullPage: true });

  // Sunken Observatory Desktop
  await page.locator('#game-select').selectOption('sunken-observatory');
  await page.waitForTimeout(200);
  await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
  await page.locator('button[data-jump-ms="900000"]').click();
  await page.locator('#btn-close-offline-modal').click();
  await page.screenshot({ path: 'test-results/desktop-sunken-observatory.png', fullPage: true });

  // Mobile 390x844 (iPhone 13/14 viewport)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/mobile-sunken-observatory.png', fullPage: true });

  // Android Pixel 7 (412x915) vertical
  await page.setViewportSize({ width: 412, height: 915 });
  await page.locator('#game-select').selectOption('dyson-swarm');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/android-pixel7-viewport.png' });
  await page.screenshot({ path: 'test-results/android-pixel7-full.png', fullPage: true });

  // Android Galaxy S20/S22 (360x800) vertical
  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/android-galaxy-viewport.png' });
  await page.screenshot({ path: 'test-results/android-galaxy-full.png', fullPage: true });

  // Android Sunken Observatory with Diffusion Upgrade Art
  await page.setViewportSize({ width: 412, height: 915 });
  await page.locator('#game-select').selectOption('sunken-observatory');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/android-sunken-upgrades.png' });

  // Character Lore Dossier Modal
  await page.locator('#character-portrait').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/android-character-dossier.png' });
  await page.locator('#btn-close-character-modal').click();
  await page.waitForTimeout(100);

  // Upgrade Lore Card Modal
  await page.locator('#layer0-upgrades .card .card-thumb-art').first().click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/android-upgrade-lore-card.png' });
  await page.locator('#btn-close-character-modal').click();
  await page.waitForTimeout(100);

  // Android Aetherforge with Arcane Diffusion Upgrade Art
  await page.locator('#game-select').selectOption('aetherforge');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/android-aetherforge-upgrades.png' });
});
