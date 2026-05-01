import { test, expect } from '@playwright/test';

function sseBody(events) {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') + 'data: [DONE]\n\n';
}

function streamTokens(text) {
  const chunks = text.match(/.{1,15}/g) || [text];
  return chunks.map((t) => ({ token: t }));
}

test.describe('Reverse interview triggers', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    // Skip auto-intro so we control the flow tightly
    await page.route('**/api/chat/intro', (route) => route.abort());
  });

  test('Path B: idle timer fires /interject after a short Moore reply', async ({ page }) => {
    await page.route('**/api/chat', async (route, request) => {
      if (request.method() !== 'POST') return route.continue();
      const body = sseBody(streamTokens('yo. ask me.'));
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body });
    });

    let interjectCalled = false;
    await page.route('**/api/chat/interject', async (route) => {
      interjectCalled = true;
      const body = sseBody(streamTokens('huh, why are you here, bored or job hunting?'));
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body });
    });

    await page.goto('/ask');
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder*="Ask anything"]');
    await input.fill('what does he do');
    await page.locator('button[aria-label="Send"]').click();

    await expect(page.locator('text=yo. ask me.')).toBeVisible({ timeout: 5000 });

    // computeIdleDelay for "yo. ask me." (3 words) → 2000ms. Wait 3.5s.
    await page.waitForTimeout(3500);

    expect(interjectCalled).toBe(true);
    await expect(page.locator('text=why are you here')).toBeVisible({ timeout: 2000 });
  });

  test('Path B: typing in input cancels the idle timer', async ({ page }) => {
    await page.route('**/api/chat', async (route, request) => {
      if (request.method() !== 'POST') return route.continue();
      const body = sseBody(streamTokens('yo. ask me.'));
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body });
    });

    let interjectCalled = false;
    await page.route('**/api/chat/interject', async (route) => {
      interjectCalled = true;
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: sseBody(streamTokens('huh.')) });
    });

    await page.goto('/ask');
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder*="Ask anything"]');
    await input.fill('what does he do');
    await page.locator('button[aria-label="Send"]').click();
    await expect(page.locator('text=yo. ask me.')).toBeVisible({ timeout: 5000 });

    // Type before the 2s timer fires
    await page.waitForTimeout(500);
    await input.fill('a');
    await page.waitForTimeout(3000);

    expect(interjectCalled).toBe(false);
  });

  test('Path B sends trustedDevice flag when localStorage is set', async ({ page }) => {
    // Mark this browser as trusted (matches /inbox login behavior). The
    // server uses this flag to skip the once-per-session DB lock — without
    // it, trusted-device users always 409 because no Conversation document
    // is ever persisted for them.
    await page.addInitScript(() => localStorage.setItem('_inbox_trusted', '1'));

    await page.route('**/api/chat', async (route, request) => {
      if (request.method() !== 'POST') return route.continue();
      const body = sseBody(streamTokens('yo. ask me.'));
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body });
    });

    let interjectBody = null;
    await page.route('**/api/chat/interject', async (route, request) => {
      interjectBody = JSON.parse(request.postData() || '{}');
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: sseBody(streamTokens('huh, why are you here?')),
      });
    });

    await page.goto('/ask');
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder*="Ask anything"]');
    await input.fill('what does he do');
    await page.locator('button[aria-label="Send"]').click();
    await expect(page.locator('text=yo. ask me.')).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(3500);

    expect(interjectBody?.trustedDevice).toBe(true);
  });

  test('Path A: 2nd user message triggers triggerInterview flag in /api/chat body', async ({ page }) => {
    let secondCallBody = null;
    let callCount = 0;
    await page.route('**/api/chat', async (route, request) => {
      if (request.method() !== 'POST') return route.continue();
      callCount += 1;
      const body = JSON.parse(request.postData() || '{}');
      if (callCount === 2) secondCallBody = body;
      const reply = sseBody(streamTokens(`reply ${callCount}.`));
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: reply });
    });
    await page.route('**/api/chat/interject', (route) => route.abort());

    await page.goto('/ask');
    await page.waitForTimeout(500);

    const input = page.locator('input[placeholder*="Ask anything"]');
    await input.fill('first question');
    await page.locator('button[aria-label="Send"]').click();
    await expect(page.locator('text=reply 1.')).toBeVisible({ timeout: 5000 });

    await input.fill('second question');
    await page.locator('button[aria-label="Send"]').click();
    await expect(page.locator('text=reply 2.')).toBeVisible({ timeout: 5000 });

    expect(secondCallBody?.triggerInterview).toBe(true);
  });
});
