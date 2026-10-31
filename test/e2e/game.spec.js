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

    // Verify initial clean state with progressive disclosure
    await expect(page.locator('#layer0-currency')).toHaveText(/10/);
    await expect(page.locator('#layer1-panel')).toBeHidden();
    const gen1Card = page.locator('#layer0-generators .card').first();
    const gen2Card = page.locator('#layer0-generators .card').nth(1);
    await expect(gen1Card).toBeVisible();
    await expect(gen2Card).toBeHidden();
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 0');

    // Buy 1 Generator I
    const buy1Btn = gen1Card.locator('.btn-buy-1');
    await expect(buy1Btn).toBeEnabled();
    await buy1Btn.click();

    // Verify owned becomes 1 and reveals Generator II
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 1');
    await expect(gen1Card.locator('.output-meta')).toContainText('/tick');
    await expect(gen2Card).toBeVisible();
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
    await expect(page.locator('#offline-summary')).toContainText('gained');
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

    // Verify telemetry cycle frequency increased from 1.00 /s to 1.10 /s
    await expect(page.locator('#telemetry-cycle-freq')).toHaveText('1.10 /s');
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
    await expect(prestigeBtn).toContainText('(+');

    // Execute Prestige Reset
    await prestigeBtn.click();

    // Verify Layer 1 gained Cores and passive multiplier is > 1.00x
    await expect(page.locator('#layer1-currency')).not.toHaveText('0');
    await expect(page.locator('#layer1-passive-mult')).not.toHaveText('1.00x');

    // Verify Layer 0 was reset back to 0 owned generators and initial currency
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 0');
    await expect(page.locator('#layer0-currency')).toHaveText(/10/);
  });

  test('Stage 6: Metagenerator cascade spawns lower-tier units and Upgrade Tree handles DAG branching', async ({ page }) => {
    await page.locator('#btn-hard-reset').click();
    await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();

    // Skip 1 hour to easily unlock and buy Generator II (Metagenerator)
    await page.locator('button[data-jump-ms="3600000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Buy 1 Generator II (which produces Generator I)
    const gen2Card = page.locator('#layer0-generators .card').nth(1);
    await gen2Card.locator('.btn-buy-1').click();
    await expect(gen2Card.locator('.owned-badge')).toHaveText('Owned: 1');

    // Note Gen 1 owned before metageneration
    const gen1Card = page.locator('#layer0-generators .card').first();
    const gen1OwnedBefore = await gen1Card.locator('.owned-badge').textContent();

    // Skip 15 minutes: Generator II produces 0.1 Gen 1 per tick
    // In 900 ticks, Gen 2 produces ~90 Generator I units!
    await page.locator('button[data-jump-ms="900000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // Generator 1 owned count must have increased significantly
    await expect(gen1Card.locator('.owned-badge')).not.toHaveText(gen1OwnedBefore);

    // Verify Progressive Disclosure in Layer 1: Branch A and Branch B are hidden before Root is unlocked
    const l1BranchACard = page.locator('#layer1-upgrades .card').nth(1);
    const l1BranchBCard = page.locator('#layer1-upgrades .card').nth(2);
    await expect(l1BranchACard).toBeHidden();
    await expect(l1BranchBCard).toBeHidden();
  });

  test('Stage 7: Game Switcher dynamically switches games, presentation palettes, lore, and isolated saves', async ({ page }) => {
    await page.locator('#btn-hard-reset').click();

    // Verify initial game is Dyson Swarm
    await expect(page.locator('#game-title')).toContainText('Dyson Swarm');
    await expect(page.locator('#character-name')).toHaveText('AURORA-7');
    await expect(page.locator('#character-portrait img')).toBeVisible();
    await expect(page.locator('#layer0-generators .card').first().locator('.main-view .card-icon')).toBeVisible();

    // Switch to Aetherforge (Fantasy)
    await page.locator('#game-select').selectOption('aetherforge');

    // Header, lore, character, and currency symbols update
    await expect(page.locator('#game-title')).toContainText('Aetherforge');
    await expect(page.locator('#character-name')).toHaveText('Archmage Vaelen');
    await expect(page.locator('#layer0-sub-label')).toContainText('Mana');
    const gen1Card = page.locator('#layer0-generators .card').first();
    await expect(gen1Card.locator('.main-view h3')).toHaveText('Runic Familiar');

    // Buy 1 Runic Familiar
    await gen1Card.locator('.btn-buy-1').click();
    await expect(gen1Card.locator('.owned-badge')).toHaveText('Owned: 1');

    // Switch to The Sunken Observatory (Cosmic Horror)
    await page.locator('#game-select').selectOption('sunken-observatory');
    await expect(page.locator('#game-title')).toContainText('Sunken Observatory');
    await expect(page.locator('#character-name')).toHaveText('Curator Ambrose');
    await expect(page.locator('#layer0-sub-label')).toContainText('Insight');
    const horrorGen1 = page.locator('#layer0-generators .card').first();
    await expect(horrorGen1.locator('.main-view h3')).toHaveText('Cult Acolyte');
    // Fresh save isolation: Cult Acolyte should be 0 owned
    await expect(horrorGen1.locator('.owned-badge')).toHaveText('Owned: 0');

    // Switch back to Aetherforge and verify its save was preserved
    await page.locator('#game-select').selectOption('aetherforge');
    await expect(page.locator('#character-name')).toHaveText('Archmage Vaelen');
    await expect(page.locator('#layer0-generators .card').first().locator('.owned-badge')).toHaveText('Owned: 1');
  });

  test('Stage 8: Clicking character, generator, or upgrade image opens Lore Card modal with large image and backstory', async ({ page }) => {
    await page.locator('#btn-hard-reset').click();

    // 1. Click character portrait image
    const charPortrait = page.locator('#character-portrait');
    await charPortrait.click();

    // Modal is visible with character details
    const modal = page.locator('#character-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#dossier-name')).toHaveText('AURORA-7');
    await expect(page.locator('#dossier-backstory')).toContainText('Manufactured by the Sol Engineering Collective');
    await expect(page.locator('#dossier-portrait img')).toBeVisible();

    // Close modal via close button
    await page.locator('#btn-close-character-modal').click();
    await expect(modal).toBeHidden();

    // 2. Click generator icon image
    const genIcon = page.locator('#layer0-generators .card').first().locator('.main-view .card-icon');
    await genIcon.click();
    await expect(modal).toBeVisible();
    await expect(page.locator('#dossier-name')).toHaveText('Solar Drone');
    await expect(page.locator('#dossier-backstory')).toContainText('carbon aerogels');
    await page.locator('#btn-close-character-modal').click();
    await expect(modal).toBeHidden();

    // 3. Buy generator and time skip to reveal upgrades
    await page.locator('#layer0-generators .card').first().locator('.btn-buy-1').click();
    await page.locator('button[data-jump-ms="900000"]').click();
    await page.locator('#btn-close-offline-modal').click();

    // 4. Click an upgrade image
    const upgThumb = page.locator('#layer0-upgrades .card .card-thumb-art').first();
    await expect(upgThumb).toBeVisible();
    await upgThumb.click();

    // Modal opens with upgrade lore details
    await expect(modal).toBeVisible();
    await expect(page.locator('#dossier-name')).toHaveText('Telemetry Overclock');
    await expect(page.locator('#dossier-backstory')).toContainText('1.4 million kilometers');
    await expect(page.locator('#dossier-effect-container')).toBeVisible();
    await expect(page.locator('#dossier-effect')).toContainText('10%');
    await expect(page.locator('#dossier-portrait img')).toBeVisible();

    // 5. Click the image in the lore card modal to open full-screen lightbox
    const dossierImg = page.locator('#dossier-portrait img');
    await dossierImg.click();

    // Full-screen lightbox is visible with full-screen artwork
    const lightboxModal = page.locator('#image-lightbox-modal');
    await expect(lightboxModal).toBeVisible();
    const lightboxImg = page.locator('#lightbox-img');
    await expect(lightboxImg).toBeVisible();
    await expect(lightboxImg).toHaveAttribute('src', './assets/upg-telemetry.jpg');
    await expect(page.locator('#lightbox-caption')).toHaveText('Telemetry Overclock');

    // Close lightbox via close button
    await page.locator('#btn-close-lightbox').click();
    await expect(lightboxModal).toBeHidden();

    // Close lore modal via escape key
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });
});
