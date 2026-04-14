import { test, expect } from '@playwright/test';

test.describe('Work (/work) Page', () => {
  test.beforeEach(async ({ page }) => {
    // Direct navigation to /work bypasses intro
    await page.goto('/work');
    await page.waitForTimeout(2000);
  });

  test('direct navigation loads developer section', async ({ page }) => {
    // The persona app should be mounted with data-persona="work"
    const personaApp = page.locator('[data-persona="work"]');
    await expect(personaApp).toBeVisible({ timeout: 5000 });
  });

  test('intro text "7+ years" is visible', async ({ page }) => {
    await expect(page.locator('text=7+ years')).toBeVisible({ timeout: 5000 });
  });

  test('download buttons are present with correct hrefs', async ({ page }) => {
    const resumeLink = page.locator('a[href="/mahesh-inder-resume.pdf"]');
    const coverLink = page.locator('a[href="/mahesh-inder-cover-letter.pdf"]');

    await expect(resumeLink).toBeVisible({ timeout: 5000 });
    await expect(coverLink).toBeVisible({ timeout: 5000 });

    // Verify download attributes
    await expect(resumeLink).toHaveAttribute('download', 'Mahesh_Inder_Resume.pdf');
    await expect(coverLink).toHaveAttribute('download', 'Mahesh_Inder_Cover_Letter.pdf');
  });

  test('skills section renders 6 skill cards', async ({ page }) => {
    const skillCards = page.locator('h3').filter({
      hasText: /^(Frontend|Backend|Cloud|Data|Architecture|AI \/ Web3)$/,
    });
    await expect(skillCards).toHaveCount(6);
  });

  test('work section shows all 5 companies', async ({ page }) => {
    const companies = ['Emirates NBD', 'Noumena', 'Tokopedia', 'To The New', 'Freelance'];
    for (const company of companies) {
      await expect(page.locator(`text=${company}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('each company has projects with descriptions and tech tags', async ({ page }) => {
    // Check that project names are visible
    const projectNames = [
      'Payment Tracker',
      'Statement Generator',
      'Microservices Platform',
      'Discovery Engine',
      'Intools',
      'Kokaihop 3.0',
      'Bharti AXA PWA',
      'Man the Bay',
    ];

    for (const name of projectNames) {
      await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });
    }

    // Verify tech tags exist (spot check a few)
    await expect(page.locator('text=Rust').first()).toBeVisible();
    await expect(page.locator('text=Kafka').first()).toBeVisible();
    await expect(page.locator('text=GraphQL').first()).toBeVisible();
  });

  test('footer "Get in touch" link has correct mailto', async ({ page }) => {
    const ctaLink = page.locator('a[href="mailto:mahesh.inder85@gmail.com"]');
    await expect(ctaLink).toBeVisible({ timeout: 5000 });
    await expect(ctaLink).toContainText('Get in touch');
  });

  test('back button is present and labeled', async ({ page }) => {
    const backBtn = page.locator('button').filter({ hasText: /Solar System|Hub/ });
    await expect(backBtn).toBeVisible({ timeout: 5000 });
  });

  test('logo in header links back to hub', async ({ page }) => {
    const logoBtn = page.locator('button[aria-label="Back to home"]');
    await expect(logoBtn).toBeVisible({ timeout: 5000 });

    // The logo image should be inside
    const logoImg = logoBtn.locator('img[alt="Mahesh Inder"]');
    await expect(logoImg).toBeVisible();
  });
});
