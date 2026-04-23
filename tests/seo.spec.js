import { test, expect } from '@playwright/test';

test.describe('SEO Meta Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // No need to wait for animations — meta tags are in the static HTML
    await page.waitForTimeout(1000);
  });

  test('page title contains "Mahesh Inder"', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('Mahesh Inder');
  });

  test('meta description exists and has content', async ({ page }) => {
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(50);
    expect(description).toContain('Mahesh Inder');
  });

  test('canonical URL points to maheshinder.in', async ({ page }) => {
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toContain('maheshinder.in');
  });

  test('Open Graph tags are present', async ({ page }) => {
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    const ogDesc = await page.getAttribute('meta[property="og:description"]', 'content');
    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
    const ogUrl = await page.getAttribute('meta[property="og:url"]', 'content');
    const ogType = await page.getAttribute('meta[property="og:type"]', 'content');

    expect(ogTitle).toBeTruthy();
    expect(ogTitle).toContain('Mahesh Inder');
    expect(ogDesc).toBeTruthy();
    expect(ogImage).toBeTruthy();
    expect(ogUrl).toContain('maheshinder.in');
    expect(ogType).toBe('website');
  });

  test('Twitter card tags are present', async ({ page }) => {
    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
    const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content');

    expect(twitterCard).toBe('summary_large_image');
    expect(twitterTitle).toContain('Mahesh Inder');
  });

  test('favicon link exists', async ({ page }) => {
    // Multiple favicons (svg + png) so grab the first
    const favicon = page.locator('link[rel="icon"]').first();
    await expect(favicon).toHaveAttribute('href', /favicon/);
  });

  test('structured data (JSON-LD) is present', async ({ page }) => {
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Parse first script to verify it is valid JSON with Person schema
    const firstScript = await scripts.first().textContent();
    const data = JSON.parse(firstScript);
    expect(data['@context']).toBe('https://schema.org');
    expect(data.name).toBe('Mahesh Inder');
  });
});
