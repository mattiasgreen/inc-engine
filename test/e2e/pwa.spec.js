// test/e2e/pwa.spec.js
// Verification of PWA capabilities, manifest, icons, panel assets, and service worker registration

import { test, expect } from '@playwright/test';

test.describe('PWA & Themed Assets Verification', () => {
  test('manifest.webmanifest is valid and accessible', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe('Incremental Engine: Multi-World Idle');
    expect(manifest.short_name).toBe('IncEngine');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./index.html');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const icon192 = manifest.icons.find(i => i.sizes === '192x192');
    const icon512 = manifest.icons.find(i => i.sizes === '512x512');
    expect(Boolean(icon192)).toBe(true);
    expect(Boolean(icon512)).toBe(true);
  });

  test('PWA icons and themed panel assets load successfully', async ({ request }) => {
    const assets = [
      '/assets/icon-192.png',
      '/assets/icon-512.png',
      '/assets/panel-dyson-swarm.jpg',
      '/assets/panel-aetherforge.jpg',
      '/assets/panel-sunken-observatory.jpg',
      '/sw.js'
    ];

    for (const asset of assets) {
      const res = await request.get(asset);
      expect(res.status(), `Asset ${asset} should return 200 OK`).toBe(200);
    }
  });

  test('HTML head contains standard PWA meta tags and manifest link', async ({ page }) => {
    await page.goto('/');

    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBe('./manifest.webmanifest');

    const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect(appleIcon).toBe('./assets/icon-192.png');

    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#060a12');
  });

  test('Panels have themed styling and background overlays applied across game switches', async ({ page }) => {
    await page.goto('/');

    const l0Panel = page.locator('#layer0-panel');
    await expect(l0Panel).toBeVisible();

    // Check Dyson Swarm panel background property
    const dysonBg = await l0Panel.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--panel-bg');
    });
    expect(dysonBg).toContain('panel-dyson-swarm.jpg');

    // Switch to Aetherforge
    await page.locator('#game-select').selectOption('aetherforge');
    const aetherBg = await l0Panel.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--panel-bg');
    });
    expect(aetherBg).toContain('panel-aetherforge.jpg');

    // Switch to Sunken Observatory
    await page.locator('#game-select').selectOption('sunken-observatory');
    const sunkenBg = await l0Panel.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--panel-bg');
    });
    expect(sunkenBg).toContain('panel-sunken-observatory.jpg');

    // Capture visual screenshot
    await page.screenshot({ path: 'test-results/pwa-themed-sunken.png', fullPage: true });
  });
});
