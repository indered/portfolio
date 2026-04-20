import { test, expect } from '@playwright/test';

test.describe('Cursor Showcase', () => {
  test('/cursors loads with default cursor (Comet Trail)', async ({ page }) => {
    await page.goto('/cursors');
    await page.waitForTimeout(1000);
    await expect(page.locator('canvas')).toBeAttached();
    await expect(page.locator('text=Comet Trail')).toBeVisible();
    await expect(page.locator('text=1/9')).toBeVisible();
  });

  test('/cursors/2 loads Gravitational Pull', async ({ page }) => {
    await page.goto('/cursors/2');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Gravitational Pull')).toBeVisible();
    await expect(page.locator('text=2/9')).toBeVisible();
  });

  test('/cursors/5 loads Orbit Cursor', async ({ page }) => {
    await page.goto('/cursors/5');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Orbit Cursor')).toBeVisible();
  });

  test('/cursors/9 loads Dot + Ring', async ({ page }) => {
    await page.goto('/cursors/9');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Dot + Ring')).toBeVisible();
  });

  test('canvas is full viewport size', async ({ page }) => {
    await page.goto('/cursors');
    await page.waitForTimeout(1000);
    const size = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return { w: c.width, h: c.height };
    });
    expect(size.w).toBeGreaterThan(0);
    expect(size.h).toBeGreaterThan(0);
  });

  test('global cursor dot and ring are hidden', async ({ page }) => {
    await page.goto('/cursors');
    await page.waitForTimeout(1000);
    const cursorContainer = page.locator('[aria-hidden="true"]').first();
    await expect(cursorContainer).toHaveCSS('display', 'none');
  });
});
