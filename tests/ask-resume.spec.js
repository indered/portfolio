import { test, expect } from '@playwright/test';

// When someone asks for the resume, Moore must NOT dump a bio. It must surface
// a button that takes them to the work page (resume + full project breakdown).
test.describe('Ask (/ask) resume redirect', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    // Skip the Multiverse auto-intro so the empty state + input are ready.
    await page.route('**/api/chat/intro', (route) => route.abort());
  });

  test('typed resume request renders a button that links to /work', async ({ page }) => {
    // Mock the chat stream: a show_resume tool output + a short in-voice line.
    await page.route('**/api/chat', (route) => {
      const body = [
        'data: {"toolOutput":{"tool":"show_resume","result":{"ok":true,"type":"resume_link","url":"/work"}}}',
        '',
        'data: {"token":"His resume and full work breakdown are right there."}',
        '',
        'data: [DONE]',
        '',
      ].join('\n');
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body,
      });
    });

    await page.goto('/ask');
    await page.waitForTimeout(1000);

    const input = page.locator('input[placeholder*="Ask anything about"]');
    await input.fill('Can I get his resume?');
    await page.locator('button[aria-label="Send"]').click();

    // The redirect button shows and points at the work page.
    const workBtn = page.locator('a:has-text("View resume + work")');
    await expect(workBtn).toBeVisible({ timeout: 8000 });
    await expect(workBtn).toHaveAttribute('href', /\/work$/);

    // And Moore did not paste a bio dump in the bubble.
    await expect(page.locator('body')).not.toContainText('Emirates NBD now');
  });

  test('clicking the redirect button navigates to /work', async ({ page }) => {
    await page.route('**/api/chat', (route) => {
      const body = [
        'data: {"toolOutput":{"tool":"show_resume","result":{"ok":true,"type":"resume_link","url":"/work"}}}',
        '',
        'data: {"token":"On the work page."}',
        '',
        'data: [DONE]',
        '',
      ].join('\n');
      route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body });
    });

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder*="Ask anything about"]').fill('resume please');
    await page.locator('button[aria-label="Send"]').click();

    const workBtn = page.locator('a:has-text("View resume + work")');
    await expect(workBtn).toBeVisible({ timeout: 8000 });
    await workBtn.click();
    await expect(page).toHaveURL(/\/work$/);
  });
});
