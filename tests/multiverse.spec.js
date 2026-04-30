import { test, expect } from '@playwright/test';

// Helper: serve a deterministic SSE intro for the given personality so the
// test isn't dependent on network or random selection.
function mockIntroRoute(page, { personalityId = 'pirate', personalityName = 'Pirate', text = 'Ahoy. Test intro stream.' } = {}) {
  return page.route('**/api/chat/intro', async (route) => {
    const chunks = [
      `data: ${JSON.stringify({ personality: { id: personalityId, name: personalityName } })}\n\n`,
      `data: ${JSON.stringify({ token: text })}\n\n`,
      `data: [DONE]\n\n`,
    ].join('');
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: chunks,
    });
  });
}

test.describe('Multiverse intro on /ask', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
  });

  test('streams the intro and renders the Multiverse badge', async ({ page }) => {
    await mockIntroRoute(page, { personalityId: 'pirate', personalityName: 'Pirate', text: 'Ahoy. Test intro stream.' });
    await page.goto('/ask');

    // Badge appears next to the MOORE label
    await expect(page.locator('text=Multiverse · Pirate')).toBeVisible({ timeout: 5000 });

    // Intro text lands as a Moore message
    await expect(page.locator('text=Ahoy. Test intro stream.')).toBeVisible({ timeout: 5000 });
  });

  test('persists personality across page reload (same tab)', async ({ page }) => {
    await mockIntroRoute(page, { personalityId: 'cowboy', personalityName: 'Cowboy', text: 'Howdy partner.' });
    await page.goto('/ask');
    await expect(page.locator('text=Multiverse · Cowboy')).toBeVisible({ timeout: 5000 });

    // Reload — intro should NOT fire again (already in messages), but badge stays
    await page.reload();
    await expect(page.locator('text=Multiverse · Cowboy')).toBeVisible({ timeout: 5000 });
  });
});
