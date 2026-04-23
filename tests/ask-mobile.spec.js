import { test, expect } from '@playwright/test';

// iPhone 14 viewport
const MOBILE_VIEWPORT = { width: 393, height: 852 };

test.describe('Ask page - Mobile UI', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    await page.goto('/ask');
    await page.waitForTimeout(1500);
  });

  test('hero title renders with gradient Hello and follow-up', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Hello.');
    await expect(page.locator('h1')).toContainText('Ask anything about Mahesh');
  });

  test('back button visible top-left with Solar System label', async ({ page }) => {
    const backBtn = page.locator('button[aria-label="Back to Solar System"]');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toContainText('Solar System');
    const box = await backBtn.boundingBox();
    expect(box.x).toBeLessThan(30);
    expect(box.y).toBeLessThan(30);
    // Touch-friendly size
    expect(box.height).toBeGreaterThanOrEqual(36);
    expect(box.width).toBeGreaterThanOrEqual(100);
  });

  test('all 4 suggestion chips are visible and tappable', async ({ page }) => {
    const suggestions = [
      'What does he build at Emirates NBD?',
      'Has he led a team or is he IC only?',
      'How did he go from clubs to running half marathons?',
      'Book a 30-min call with Mahesh',
    ];
    for (const text of suggestions) {
      const chip = page.locator(`button:has-text("${text}")`);
      await expect(chip).toBeVisible();
      const box = await chip.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(32);
    }
  });

  test('input field is visible on mobile', async ({ page }) => {
    const inputBar = page.locator('input[placeholder*="Ask anything about"]').locator('..');
    await expect(inputBar).toBeVisible();
    const box = await inputBar.boundingBox();
    expect(box.width).toBeGreaterThan(200);
  });

  test('send button is visible and disabled when empty', async ({ page }) => {
    const sendBtn = page.locator('button[aria-label="Send"]');
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toBeDisabled();
  });

  test('send button enables when user types', async ({ page }) => {
    const input = page.locator('input[placeholder*="Ask anything about"]');
    const sendBtn = page.locator('button[aria-label="Send"]');
    await input.fill('hi');
    await expect(sendBtn).toBeEnabled();
  });

  test('disclaimer text is readable (not too small)', async ({ page }) => {
    const disclaimer = page.locator('p:has-text("Answers based on")');
    await expect(disclaimer).toBeVisible();
    const fontSize = await disclaimer.evaluate(el =>
      parseFloat(getComputedStyle(el).fontSize)
    );
    expect(fontSize).toBeGreaterThanOrEqual(10);
  });

  test('share link button is visible in empty state', async ({ page }) => {
    const shareBtn = page.locator('button:has-text("Share link")');
    await expect(shareBtn).toBeVisible();
  });

  test('MessageForm is hidden on mobile', async ({ page }) => {
    const form = page.locator('input[placeholder="Your name"]');
    await expect(form).toBeHidden();
  });

  test('keyboard open simulation does not hide input', async ({ page }) => {
    const input = page.locator('input[placeholder*="Ask anything about"]');
    await input.click();
    await page.waitForTimeout(300);
    // Simulate iOS keyboard pushing viewport up
    await page.setViewportSize({ width: 393, height: 500 });
    await page.waitForTimeout(300);
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box.y).toBeLessThan(500);
  });

  test('hero title does not overflow viewport width', async ({ page }) => {
    const hero = page.locator('h1').first();
    const box = await hero.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
  });

  test('suggestion chips do not overflow horizontally', async ({ page }) => {
    const chips = page.locator('[class*="chip"]');
    const count = await chips.count();
    for (let i = 0; i < count; i++) {
      const box = await chips.nth(i).boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 1);
      }
    }
  });

  test('page has no horizontal scroll', async ({ page }) => {
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 1);
  });

  test('typing and clicking send triggers user message in DOM', async ({ page }) => {
    // Mock /api/chat to avoid real API call
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: `data: ${JSON.stringify({ token: 'Hi there!' })}\n\ndata: [DONE]\n\n`,
      });
    });
    const input = page.locator('input[placeholder*="Ask anything about"]');
    await input.fill('Who is Mahesh?');
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForTimeout(1000);
    // User's own message should be visible
    await expect(page.locator('text=Who is Mahesh?')).toBeVisible();
  });
});

test.describe('Ask page - Desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
    await page.goto('/ask');
    await page.waitForTimeout(1500);
  });

  test('MessageForm is no longer on /ask (Moore handles messaging via leave_message tool)', async ({ page }) => {
    await expect(page.locator('input[placeholder="Your name"]')).toHaveCount(0);
    await expect(page.locator('input[placeholder="Your email"]')).toHaveCount(0);
    await expect(page.locator('textarea[placeholder="Your message"]')).toHaveCount(0);
  });

  test('back button shows Solar System text on desktop', async ({ page }) => {
    const backBtn = page.locator('button[aria-label="Back to Solar System"]');
    await expect(backBtn).toContainText('Solar System');
  });
});
