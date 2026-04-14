import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('hub desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(8000);
    await expect(page).toHaveScreenshot('hub-desktop.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('canvas')],
    });
  });

  test('hub mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForTimeout(8000);
    await expect(page).toHaveScreenshot('hub-mobile.png', {
      maxDiffPixelRatio: 0.1,
      mask: [page.locator('canvas')],
    });
  });

  test('work desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/work');
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('work-desktop.png', {
      maxDiffPixelRatio: 0.1,
    });
  });

  test('work mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/work');
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot('work-mobile.png', {
      maxDiffPixelRatio: 0.1,
    });
  });
});
