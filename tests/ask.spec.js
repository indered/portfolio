import { test, expect } from '@playwright/test';

test.describe('Ask (/ask) Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    await page.goto('/ask');
    await page.waitForTimeout(1500);
  });

  test('hero title renders with gradient Hello and follow-up', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText('Hello.');
    await expect(h1).toContainText('Ask anything about Mahesh');
  });

  test('suggestion chips are visible', async ({ page }) => {
    const suggestions = [
      'What does he build at Emirates NBD?',
      'Has he led a team or is he IC only?',
      'How did he go from clubs to running half marathons?',
      'Book a 30-min call with Mahesh',
    ];
    for (const text of suggestions) {
      await expect(page.locator(`button:has-text("${text}")`)).toBeVisible({ timeout: 4000 });
    }
  });

  test('chat input is visible, focusable and accepts text', async ({ page }) => {
    const input = page.locator('input[placeholder*="Ask anything about"]');
    await expect(input).toBeVisible({ timeout: 6000 });
    await input.fill('Hello');
    await expect(input).toHaveValue('Hello');
  });

  test('send button is present and disabled on empty input', async ({ page }) => {
    const sendBtn = page.locator('button[aria-label="Send"]');
    await expect(sendBtn).toBeVisible({ timeout: 6000 });
    await expect(sendBtn).toBeDisabled();
  });

  test('back button returns to Solar System', async ({ page }) => {
    const backBtn = page.locator('button[aria-label="Back to Solar System"]');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toContainText('Solar System');
  });

  test('resume download link exists in footer', async ({ page }) => {
    const resumeLink = page.locator('a:has-text("Resume")');
    await expect(resumeLink).toBeVisible();
    await expect(resumeLink).toHaveAttribute('href', /resume\.pdf$/);
  });
});
