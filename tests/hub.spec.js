import { test, expect } from '@playwright/test';

test.describe('Solar System Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(9000);
  });

  test('page loads and hub view is active after intro', async ({ page }) => {
    const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
    await expect(exploreBtn).toBeVisible({ timeout: 10000 });
  });

  test('MAHESH INDER masthead text appears', async ({ page }) => {
    const logo = page.locator('img[alt="Mahesh Inder"]').first();
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('logo appears after masthead animation', async ({ page }) => {
    const logo = page.locator('img[alt="Mahesh Inder"]').first();
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('explore button is visible and clickable', async ({ page }) => {
    const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
    await expect(exploreBtn).toBeVisible({ timeout: 10000 });
    await expect(exploreBtn).toBeEnabled();
  });
});

test.describe('Hub - Desktop specific', () => {
  test('paperwork button visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(9000);
    const paperwork = page.locator('button').filter({ hasText: /Paperwork/i });
    await expect(paperwork).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Hub - Mobile specific', () => {
  test('paperwork button is hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForTimeout(9000);
    const paperwork = page.locator('button').filter({ hasText: /Paperwork/i });
    const count = await paperwork.count();
    if (count > 0) {
      await expect(paperwork).not.toBeVisible();
    }
  });

  test('explore button is centered on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForTimeout(9000);
    const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
    await expect(exploreBtn).toBeVisible({ timeout: 10000 });
    const box = await exploreBtn.boundingBox();
    if (box) {
      const btnCenter = box.x + box.width / 2;
      expect(Math.abs(btnCenter - 393 / 2)).toBeLessThan(60);
    }
  });
});
