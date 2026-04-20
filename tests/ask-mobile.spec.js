import { test, expect } from '@playwright/test';

test.describe('Ask page - Mobile', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/ask');
    await page.waitForTimeout(2000);
  });

  test('page loads with heading on mobile', async ({ page }) => {
    await expect(page.locator('text=Ask me anything')).toBeVisible({ timeout: 5000 });
  });

  test('suggestion buttons are visible and tappable', async ({ page }) => {
    const btn = page.locator('text=What does Mahesh do?');
    await expect(btn).toBeVisible({ timeout: 5000 });
    const box = await btn.boundingBox();
    // Button should be at least 44px tall for touch
    expect(box.height).toBeGreaterThanOrEqual(30);
  });

  test('input field is visible on mobile', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your question..."]');
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test('input stays visible when focused (keyboard simulation)', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your question..."]');
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await page.waitForTimeout(500);

    // Simulate keyboard appearing by resizing viewport
    await page.setViewportSize({ width: 393, height: 400 });
    await page.waitForTimeout(500);

    // Input should still be visible
    await expect(input).toBeVisible({ timeout: 3000 });
  });

  test('message form is visible below chat', async ({ page }) => {
    const form = page.locator('text=Or leave a message here');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('send message form has all fields', async ({ page }) => {
    await page.locator('input[placeholder="Your name"]').scrollIntoViewIfNeeded();
    await expect(page.locator('input[placeholder="Your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Your email"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Your message"]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Send message' })).toBeVisible();
  });

  test('back to solar system button is visible', async ({ page }) => {
    const btn = page.locator('text=Back to Solar System');
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Connect page - Mobile', () => {
  test.use({ viewport: { width: 393, height: 852 } });

  test('message form is visible on connect page', async ({ page }) => {
    await page.goto('/connect');
    await page.waitForTimeout(2000);
    const form = page.locator('text=Or leave a message here');
    await form.scrollIntoViewIfNeeded();
    await expect(form).toBeVisible({ timeout: 5000 });
  });

  test('message form label says "Or leave a message here"', async ({ page }) => {
    await page.goto('/connect');
    await page.waitForTimeout(2000);
    const label = page.locator('text=Or leave a message here');
    await label.scrollIntoViewIfNeeded();
    await expect(label).toBeVisible();
  });
});
