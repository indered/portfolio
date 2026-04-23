import { test, expect } from '@playwright/test';

test.describe('Persona Navigation', () => {
  test.beforeEach(async ({ context }) => {
    // Skip the intro animation so /work loads straight into persona view.
    await context.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
  });

  test('/work route shows correct URL', async ({ page }) => {
    await page.goto('/work');
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/work');
  });

  test('position dots are visible on persona page', async ({ page }) => {
    await page.goto('/work');
    await page.waitForTimeout(2000);

    const positionNav = page.locator('nav[aria-label="Section navigation"]');
    await expect(positionNav).toBeVisible({ timeout: 5000 });

    // Should have 6 position dots (one per persona)
    const dots = positionNav.locator('button');
    await expect(dots).toHaveCount(6);
  });

  test('arrow key navigation works between planets', async ({ page }) => {
    // PERSONA_IDS order: about, work, connect, runner, ventures, thoughts
    await page.goto('/work');
    await expect(page.locator('[data-persona="work"]')).toBeVisible({ timeout: 15000 });

    // Right from work → connect
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-persona="connect"]')).toBeVisible({ timeout: 8000 });

    // Left from connect → work
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-persona="work"]')).toBeVisible({ timeout: 8000 });
  });

  test('escape key triggers back navigation', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('[data-persona="work"]')).toBeVisible({ timeout: 15000 });

    await page.keyboard.press('Escape');

    // Wait for URL to drop the /work segment (handleBack calls navigate('/'))
    await page.waitForFunction(() => !window.location.pathname.startsWith('/work'), null, { timeout: 10000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test('attribution footer text is present', async ({ page }) => {
    await page.goto('/work');
    await page.waitForTimeout(2000);

    const attribution = page.locator('text=was building a');
    await expect(attribution).toBeVisible({ timeout: 5000 });

    // Check for the full phrase via the footer element
    const footer = page.locator('footer').filter({ hasText: 'ended up building a' });
    await expect(footer).toBeVisible();
  });
});
