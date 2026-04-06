# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hub.spec.js >> Solar System Hub >> page loads and hub view is active after intro
- Location: tests/hub.spec.js:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: /explore/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button').filter({ hasText: /explore/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - button "0" [ref=e4] [cursor=pointer]:
    - img [ref=e5]
    - generic [ref=e8]: "0"
  - generic [ref=e10]:
    - generic [ref=e11]: d
    - generic [ref=e12]: u
    - generic [ref=e13]: b
    - generic [ref=e14]: a
    - generic [ref=e15]: i
    - generic [ref=e16]: .
    - generic [ref=e18]: "2"
    - generic [ref=e19]: "8"
    - generic [ref=e21]: d
    - generic [ref=e22]: e
    - generic [ref=e23]: g
    - generic [ref=e24]: r
    - generic [ref=e25]: e
    - generic [ref=e26]: e
    - generic [ref=e27]: s
    - generic [ref=e28]: .
    - generic [ref=e30]: "5"
    - generic [ref=e31]: a
    - generic [ref=e32]: m
    - generic [ref=e33]: .
    - generic [ref=e35]: s
    - generic [ref=e36]: i
    - generic [ref=e37]: "n"
    - generic [ref=e38]: g
    - generic [ref=e39]: l
    - generic [ref=e40]: e
    - generic [ref=e41]: .
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Solar System Hub', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.waitForTimeout(9000);
  7  |   });
  8  | 
  9  |   test('page loads and hub view is active after intro', async ({ page }) => {
  10 |     const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
> 11 |     await expect(exploreBtn).toBeVisible({ timeout: 10000 });
     |                              ^ Error: expect(locator).toBeVisible() failed
  12 |   });
  13 | 
  14 |   test('MAHESH INDER masthead text appears', async ({ page }) => {
  15 |     const logo = page.locator('img[alt="Mahesh Inder"]').first();
  16 |     await expect(logo).toBeVisible({ timeout: 10000 });
  17 |   });
  18 | 
  19 |   test('logo appears after masthead animation', async ({ page }) => {
  20 |     const logo = page.locator('img[alt="Mahesh Inder"]').first();
  21 |     await expect(logo).toBeVisible({ timeout: 10000 });
  22 |   });
  23 | 
  24 |   test('explore button is visible and clickable', async ({ page }) => {
  25 |     const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
  26 |     await expect(exploreBtn).toBeVisible({ timeout: 10000 });
  27 |     await expect(exploreBtn).toBeEnabled();
  28 |   });
  29 | });
  30 | 
  31 | test.describe('Hub - Desktop specific', () => {
  32 |   test('paperwork button visible on desktop', async ({ page }) => {
  33 |     await page.setViewportSize({ width: 1440, height: 900 });
  34 |     await page.goto('/');
  35 |     await page.waitForTimeout(9000);
  36 |     const paperwork = page.locator('button').filter({ hasText: /Paperwork/i });
  37 |     await expect(paperwork).toBeVisible({ timeout: 5000 });
  38 |   });
  39 | });
  40 | 
  41 | test.describe('Hub - Mobile specific', () => {
  42 |   test('paperwork button is hidden on mobile', async ({ page }) => {
  43 |     await page.setViewportSize({ width: 393, height: 852 });
  44 |     await page.goto('/');
  45 |     await page.waitForTimeout(9000);
  46 |     const paperwork = page.locator('button').filter({ hasText: /Paperwork/i });
  47 |     const count = await paperwork.count();
  48 |     if (count > 0) {
  49 |       await expect(paperwork).not.toBeVisible();
  50 |     }
  51 |   });
  52 | 
  53 |   test('explore button is centered on mobile', async ({ page }) => {
  54 |     await page.setViewportSize({ width: 393, height: 852 });
  55 |     await page.goto('/');
  56 |     await page.waitForTimeout(9000);
  57 |     const exploreBtn = page.locator('button').filter({ hasText: /explore/i });
  58 |     await expect(exploreBtn).toBeVisible({ timeout: 10000 });
  59 |     const box = await exploreBtn.boundingBox();
  60 |     if (box) {
  61 |       const btnCenter = box.x + box.width / 2;
  62 |       expect(Math.abs(btnCenter - 393 / 2)).toBeLessThan(60);
  63 |     }
  64 |   });
  65 | });
  66 | 
```