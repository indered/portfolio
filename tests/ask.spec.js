import { test, expect } from '@playwright/test';

test.describe('Ask (/ask) Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    // Disable the Multiverse auto-intro so the empty-state hero + chips remain
    // for these baseline assertions. The intro itself is covered separately.
    await page.route('**/api/chat/intro', (route) => route.abort());
    await page.goto('/ask');
    await page.waitForTimeout(1500);
  });

  test('hero title renders with gradient Hello and follow-up', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText('Hello.');
    await expect(h1).toContainText('Ask anything about Mahesh');
  });

  test('suggestion chips are visible', async ({ page }) => {
    await expect(page.locator('button[class*="chip"]')).toHaveCount(7);
    await expect(page.getByRole('button', { name: 'Book a 30-min call with Mahesh' })).toBeVisible({ timeout: 4000 });
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
    const resumeLink = page.getByRole('link', { name: 'Download resume' });
    await expect(resumeLink).toBeVisible();
    await expect(resumeLink).toHaveAttribute('href', '/resume/download');
    await expect(resumeLink).toHaveAttribute('download', 'Mahesh_Inder_Full_Stack_AI.pdf');
  });
});
