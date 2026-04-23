import { test, expect } from '@playwright/test';

// Wait until the lazy-loaded DeveloperSection has actually hydrated.
// We key off the "Frontend" skill h3 because that's rendered inside the
// <Suspense> boundary — if it's visible, the whole section is mounted.
async function waitForDeveloperSection(page) {
  await expect(page.locator('[data-persona="work"]')).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('heading', { level: 3, name: 'Frontend' })).toBeVisible({ timeout: 20000 });
}

test.describe('Work (/work) Page', () => {
  test.beforeEach(async ({ page }) => {
    // Skip the intro animation so /work goes straight to the persona view.
    await page.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
    await page.goto('/work');
    await waitForDeveloperSection(page);
  });

  test('direct navigation loads developer section', async ({ page }) => {
    const personaApp = page.locator('[data-persona="work"]');
    await expect(personaApp).toBeVisible({ timeout: 6000 });
  });

  test('intro text "7+ years" is visible', async ({ page }) => {
    await expect(page.getByText(/7\+ years of full stack/i)).toBeVisible({ timeout: 6000 });
  });

  test('availability badges render', async ({ page }) => {
    await expect(page.getByText(/available.*1 week notice/i)).toBeVisible({ timeout: 6000 });
    await expect(page.getByText(/dubai, uae/i).first()).toBeVisible();
  });

  test('download buttons have correct hrefs', async ({ page }) => {
    const resumeLink = page.locator('a[href="/mahesh-inder-resume.pdf"]').first();
    const coverLink = page.locator('a[href="/mahesh-inder-cover-letter.pdf"]').first();

    await expect(resumeLink).toBeVisible({ timeout: 6000 });
    await expect(coverLink).toBeVisible({ timeout: 6000 });
    await expect(resumeLink).toHaveAttribute('download', 'Mahesh_Inder_Resume.pdf');
    await expect(coverLink).toHaveAttribute('download', 'Mahesh_Inder_Cover_Letter.pdf');
  });

  test('skills section renders 6 skill cards', async ({ page }) => {
    const skillNames = ['Frontend', 'Backend', 'Cloud', 'Data', 'Architecture', 'AI / Web3'];
    for (const name of skillNames) {
      await expect(page.getByRole('heading', { level: 3, name })).toBeVisible({ timeout: 6000 });
    }
  });

  test('work section shows all 5 companies', async ({ page }) => {
    const companies = ['Emirates NBD', 'Noumena', 'Tokopedia', 'To The New', 'Freelance'];
    for (const company of companies) {
      await expect(page.getByText(company, { exact: false }).first()).toBeVisible({ timeout: 6000 });
    }
  });

  test('project names are visible', async ({ page }) => {
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
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible({ timeout: 6000 });
    }
  });

  test('tech tags exist (spot check)', async ({ page }) => {
    await expect(page.getByText('Rust', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Kafka', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('GraphQL', { exact: true }).first()).toBeVisible();
  });

  test('footer "Get in touch" link has correct mailto', async ({ page }) => {
    const ctaLink = page.locator('a[href="mailto:mahesh.inder85@gmail.com"]').first();
    await expect(ctaLink).toBeVisible({ timeout: 6000 });
    await expect(ctaLink).toContainText(/get in touch/i);
  });

  test('back button is present and labeled', async ({ page }) => {
    const backBtn = page.locator('button').filter({ hasText: /Solar System|Hub/ }).first();
    await expect(backBtn).toBeVisible({ timeout: 6000 });
  });

  test('logo in header links back to hub', async ({ page }) => {
    const logoBtn = page.locator('button[aria-label="Back to home"]').first();
    await expect(logoBtn).toBeVisible({ timeout: 6000 });
    const logoImg = logoBtn.locator('img[alt="Mahesh Inder"]');
    await expect(logoImg).toBeVisible();
  });
});
