import { test, expect } from '@playwright/test';

test.describe('Work page — availability + width', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
  });

  test('shows "Available · 1 week notice" badge', async ({ page }) => {
    await page.goto('/work');
    const badge = page.getByText(/available.*1 week notice/i);
    await expect(badge).toBeVisible({ timeout: 6000 });
  });

  test('shows "Dubai, UAE" badge next to availability', async ({ page }) => {
    await page.goto('/work');
    const dubai = page.getByText(/dubai, uae/i).first();
    await expect(dubai).toBeVisible({ timeout: 6000 });
  });

  test('page column is wider than the old 960px cap but still a readable column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/work');
    await page.waitForTimeout(500);
    const badge = page.getByText(/available.*1 week notice/i);
    await expect(badge).toBeVisible({ timeout: 6000 });
    const pageEl = page.locator('main, [role="main"]').first();
    const box = await pageEl.boundingBox();
    const w = box?.width || 0;
    // Now capped at 1100px — wider than the old 960, not edge-to-edge
    expect(w).toBeGreaterThan(960);
    expect(w).toBeLessThanOrEqual(1120);
  });
});

test.describe('About page — full-width layout', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
  });

  test('intro paragraph sits in a widened but still readable column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    const intro = page.getByText(/from a small town called ayodhya/i);
    await expect(intro).toBeVisible({ timeout: 6000 });
    const box = await intro.boundingBox();
    const w = box?.width || 0;
    // Wider than the old 560 cap, capped around 680 for readability
    expect(w).toBeGreaterThan(580);
    expect(w).toBeLessThanOrEqual(700);
  });

  test('no portrait image rendered on /about', async ({ page }) => {
    await page.goto('/about');
    const portrait = page.locator('img[alt="Mahesh Inder"]').filter({ hasNot: page.locator('[class*="logo"]') });
    // The logo in the hub masthead uses the same alt, but hub isn't rendered on /about.
    // So no image with that alt should appear.
    const any = page.locator('img[src*="mahesh-inder-photo"]');
    await expect(any).toHaveCount(0);
  });
});

test.describe('Ask page — no duplicate photo avatar', () => {
  test('MOORE label does not ship with a photo avatar', async ({ page }) => {
    await page.goto('/ask');
    const photoUse = page.locator('[style*="mahesh-inder-photo"], img[src*="mahesh-inder-photo"]');
    await expect(photoUse).toHaveCount(0);
  });
});

test.describe('Hub — no duplicate Book-a-call button', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
  });

  test('only the top-left Ask button leads to /ask, no extra Book button', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(5000);
    const bookBtn = page.locator('button', { hasText: /book a call/i });
    await expect(bookBtn).toHaveCount(0);
  });
});

test.describe('Hub — identity line next to logo', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
  });

  test('shows "Full Stack AI Engineer · Dubai" next to the logo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(5000);
    const line = page.getByText(/full stack ai engineer/i);
    await expect(line).toBeVisible({ timeout: 6000 });
    await expect(line).toContainText(/dubai/i);
  });

  test('identity line sits in the top-right cluster (not colliding with Ask button)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(5000);
    const line = page.getByText(/full stack ai engineer/i);
    const askBtn = page.locator('button', { hasText: /ask/i }).first();
    await expect(line).toBeVisible({ timeout: 4000 });
    await expect(askBtn).toBeVisible({ timeout: 4000 });
    const lineBox = await line.boundingBox();
    const askBox = await askBtn.boundingBox();
    // Identity line must sit to the right of the Ask button, no overlap
    expect(lineBox.x).toBeGreaterThan(askBox.x + askBox.width);
  });

  test('identity line stays visible on mobile (375px) without overlapping anything', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(5000);
    const line = page.getByText(/full stack ai engineer/i);
    await expect(line).toBeVisible({ timeout: 4000 });
    const box = await line.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  });
});
