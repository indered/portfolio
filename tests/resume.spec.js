import { test, expect } from '@playwright/test';

test.describe('Resume routes', () => {
  test('underlying resume PDF exists', async ({ request }) => {
    const response = await request.get('/mahesh-inder-resume.pdf');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/pdf');
  });

  test('work page has separate resume view and download links', async ({ page }) => {
    await page.addInitScript(() => {
      try { sessionStorage.setItem('introSeen', '1'); } catch {}
    });
    await page.goto('/work');

    await expect(page.getByRole('link', { name: 'Resume view' })).toHaveAttribute('href', '/resume');
    await expect(page.getByRole('link', { name: 'Download' }).first()).toHaveAttribute('href', '/resume/download');
  });
});
