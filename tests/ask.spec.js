import { test, expect } from '@playwright/test';

test.describe('Ask (/ask) Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ask');
    await page.waitForTimeout(2000);
  });

  test('page loads with heading and subtitle', async ({ page }) => {
    await expect(page.locator('text=Ask me anything')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=AI that actually knows me')).toBeVisible();
  });

  test('persona app is mounted with data-persona ask', async ({ page }) => {
    const personaApp = page.locator('[data-persona="ask"]');
    await expect(personaApp).toBeVisible({ timeout: 5000 });
  });

  test('suggestion buttons are visible', async ({ page }) => {
    await expect(page.locator('text=What does Mahesh do?')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Tell me about his projects')).toBeVisible();
    await expect(page.locator('text=What tech stack does he use?')).toBeVisible();
  });

  test('chat input is visible and focusable', async ({ page }) => {
    const input = page.locator('input[placeholder="Type your question..."]');
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('Hello');
    await expect(input).toHaveValue('Hello');
  });

  test('send button is present', async ({ page }) => {
    const sendBtn = page.locator('button svg');
    await expect(sendBtn.last()).toBeVisible({ timeout: 5000 });
  });

  test('back button is present', async ({ page }) => {
    const backBtn = page.locator('button').filter({ hasText: /Solar System/ });
    await expect(backBtn).toBeVisible({ timeout: 5000 });
  });
});
