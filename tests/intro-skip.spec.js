import { test, expect } from '@playwright/test';

test.describe('Skip-to-solar-system button', () => {
  test.beforeEach(async ({ context }) => {
    // Clear introSeen so the PaperBurnIntro always plays on fresh page loads
    await context.addInitScript(() => {
      try { sessionStorage.removeItem('introSeen'); } catch {}
    });
  });

  test('renders during intro with the correct label', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('button', { hasText: /skip to solar system/i });
    await expect(skip).toBeVisible({ timeout: 4000 });
  });

  test('clicking skip jumps straight to hub', async ({ page }) => {
    await page.goto('/');
    const skip = page.locator('button', { hasText: /skip to solar system/i });
    await expect(skip).toBeVisible({ timeout: 4000 });
    await skip.click();

    // Hub's "explore" prompt should appear once we're in hub state
    const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
    await expect(exploreBtn).toBeVisible({ timeout: 6000 });

    // Skip button should be gone
    await expect(skip).toBeHidden();
  });

  test('intro is not replayed on subsequent hub visits (sessionStorage guard)', async ({ browser }) => {
    // Fresh context with no init-script interference so the session-storage guard
    // actually persists between visits.
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/');
    const skip = page.locator('button', { hasText: /skip to solar system/i });
    await expect(skip).toBeVisible({ timeout: 4000 });
    await skip.click();
    await expect(page.locator('button').filter({ hasText: /explore/i })).toBeVisible({ timeout: 6000 });

    // Second visit within the same session — intro should be skipped, no skip button
    await page.goto('/');
    await expect(skip).toBeHidden();
    await ctx.close();
  });
});
