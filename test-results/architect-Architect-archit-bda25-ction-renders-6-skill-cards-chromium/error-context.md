# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: architect.spec.js >> Architect (/architect) Page >> skills section renders 6 skill cards
- Location: tests/architect.spec.js:32:7

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('h3').filter({ hasText: /^(Frontend|Backend|Cloud|Data|Architecture|AI \/ Web3)$/ })
Expected: 6
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('h3').filter({ hasText: /^(Frontend|Backend|Cloud|Data|Architecture|AI \/ Web3)$/ })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - button "Back to home" [ref=e6] [cursor=pointer]:
          - img "Mahesh Inder" [ref=e7]
        - button "Solar System" [ref=e8] [cursor=pointer]:
          - img [ref=e9]
          - text: Solar System
      - generic [ref=e11]:
        - generic [ref=e12]: 💻
        - text: The Architect
        - generic [ref=e13]: ·Earth
      - button "🏃 →" [ref=e15] [cursor=pointer]:
        - generic [ref=e16]: 🏃
        - generic [ref=e17]: →
    - navigation "Section navigation" [ref=e18]:
      - button "The Architect" [disabled] [ref=e19]
      - button "The Long Run" [ref=e20] [cursor=pointer]
      - button "Ventures" [ref=e21] [cursor=pointer]
      - button "The Network Node" [ref=e22] [cursor=pointer]
      - button "The Thinker" [ref=e23] [cursor=pointer]
      - button "Personal" [ref=e24] [cursor=pointer]
    - generic [ref=e25]:
      - button "esc escape to cosmos" [ref=e27] [cursor=pointer]:
        - generic [ref=e28]: esc
        - generic [ref=e29]: escape to cosmos
      - contentinfo [ref=e30]: was building a cv, ended up building a solar system
  - generic [ref=e32]:
    - generic [ref=e33]:
      - button "Navigate to The Architect" [disabled]:
        - generic: 💻
    - button "Navigate to The Long Run" [ref=e36] [cursor=pointer]:
      - generic: 🏃
    - button "Navigate to Ventures" [ref=e39] [cursor=pointer]:
      - generic: 🚀
    - button "Navigate to The Network Node" [ref=e42] [cursor=pointer]:
      - generic: 🌐
    - button "Navigate to The Thinker" [ref=e45] [cursor=pointer]:
      - generic: 📖
    - button "Navigate to Personal" [ref=e48] [cursor=pointer]:
      - generic: 💘
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Architect (/architect) Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Direct navigation to /architect bypasses intro
  6  |     await page.goto('/architect');
  7  |     await page.waitForTimeout(2000);
  8  |   });
  9  | 
  10 |   test('direct navigation loads developer section', async ({ page }) => {
  11 |     // The persona app should be mounted with data-persona="developer"
  12 |     const personaApp = page.locator('[data-persona="developer"]');
  13 |     await expect(personaApp).toBeVisible({ timeout: 5000 });
  14 |   });
  15 | 
  16 |   test('intro text "7+ years" is visible', async ({ page }) => {
  17 |     await expect(page.locator('text=7+ years')).toBeVisible({ timeout: 5000 });
  18 |   });
  19 | 
  20 |   test('download buttons are present with correct hrefs', async ({ page }) => {
  21 |     const resumeLink = page.locator('a[href="/mahesh-inder-resume.pdf"]');
  22 |     const coverLink = page.locator('a[href="/mahesh-inder-cover-letter.pdf"]');
  23 | 
  24 |     await expect(resumeLink).toBeVisible({ timeout: 5000 });
  25 |     await expect(coverLink).toBeVisible({ timeout: 5000 });
  26 | 
  27 |     // Verify download attributes
  28 |     await expect(resumeLink).toHaveAttribute('download', 'Mahesh_Inder_Resume.pdf');
  29 |     await expect(coverLink).toHaveAttribute('download', 'Mahesh_Inder_Cover_Letter.pdf');
  30 |   });
  31 | 
  32 |   test('skills section renders 6 skill cards', async ({ page }) => {
  33 |     const skillCards = page.locator('h3').filter({
  34 |       hasText: /^(Frontend|Backend|Cloud|Data|Architecture|AI \/ Web3)$/,
  35 |     });
> 36 |     await expect(skillCards).toHaveCount(6);
     |                              ^ Error: expect(locator).toHaveCount(expected) failed
  37 |   });
  38 | 
  39 |   test('work section shows all 5 companies', async ({ page }) => {
  40 |     const companies = ['Emirates NBD', 'Noumena', 'Tokopedia', 'To The New', 'Freelance'];
  41 |     for (const company of companies) {
  42 |       await expect(page.locator(`text=${company}`).first()).toBeVisible({ timeout: 5000 });
  43 |     }
  44 |   });
  45 | 
  46 |   test('each company has projects with descriptions and tech tags', async ({ page }) => {
  47 |     // Check that project names are visible
  48 |     const projectNames = [
  49 |       'Payment Tracker',
  50 |       'Statement Generator',
  51 |       'Microservices Platform',
  52 |       'Discovery Engine',
  53 |       'Intools',
  54 |       'Kokaihop 3.0',
  55 |       'Bharti AXA PWA',
  56 |       'Man the Bay',
  57 |     ];
  58 | 
  59 |     for (const name of projectNames) {
  60 |       await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5000 });
  61 |     }
  62 | 
  63 |     // Verify tech tags exist (spot check a few)
  64 |     await expect(page.locator('text=Rust').first()).toBeVisible();
  65 |     await expect(page.locator('text=Kafka').first()).toBeVisible();
  66 |     await expect(page.locator('text=GraphQL').first()).toBeVisible();
  67 |   });
  68 | 
  69 |   test('footer "Get in touch" link has correct mailto', async ({ page }) => {
  70 |     const ctaLink = page.locator('a[href="mailto:mahesh.inder85@gmail.com"]');
  71 |     await expect(ctaLink).toBeVisible({ timeout: 5000 });
  72 |     await expect(ctaLink).toContainText('Get in touch');
  73 |   });
  74 | 
  75 |   test('back button is present and labeled', async ({ page }) => {
  76 |     const backBtn = page.locator('button').filter({ hasText: /Solar System|Hub/ });
  77 |     await expect(backBtn).toBeVisible({ timeout: 5000 });
  78 |   });
  79 | 
  80 |   test('logo in header links back to hub', async ({ page }) => {
  81 |     const logoBtn = page.locator('button[aria-label="Back to home"]');
  82 |     await expect(logoBtn).toBeVisible({ timeout: 5000 });
  83 | 
  84 |     // The logo image should be inside
  85 |     const logoImg = logoBtn.locator('img[alt="Mahesh Inder"]');
  86 |     await expect(logoImg).toBeVisible();
  87 |   });
  88 | });
  89 | 
```