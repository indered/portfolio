import { test, expect } from '@playwright/test';

test.describe('Persona Navigation', () => {
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
    await page.goto('/work');
    await page.waitForTimeout(2000);

    // Developer is first in PERSONA_IDS, pressing ArrowRight should go to runner
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    // After navigating right from developer, we should be on runner
    const runnerSection = page.locator('[data-persona="runner"]');
    await expect(runnerSection).toBeVisible({ timeout: 5000 });

    // Press ArrowLeft to go back to developer
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(1000);

    const developerSection = page.locator('[data-persona="work"]');
    await expect(developerSection).toBeVisible({ timeout: 5000 });
  });

  test('escape key triggers back navigation', async ({ page }) => {
    await page.goto('/work');
    await page.waitForTimeout(2000);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);

    // Should navigate to hub — URL goes to /
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
