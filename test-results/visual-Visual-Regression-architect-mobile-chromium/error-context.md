# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.js >> Visual Regression >> architect mobile
- Location: tests/visual.spec.js:33:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

Timeout: 5000ms
  Timeout 5000ms exceeded.

  Snapshot: architect-mobile.png

Call log:
  - Expect "toHaveScreenshot(architect-mobile.png)" with timeout 5000ms
    - generating new stable screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - Timeout 5000ms exceeded.

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Visual Regression', () => {
  4  |   test('hub desktop', async ({ page }) => {
  5  |     await page.setViewportSize({ width: 1440, height: 900 });
  6  |     await page.goto('/');
  7  |     await page.waitForTimeout(8000);
  8  |     await expect(page).toHaveScreenshot('hub-desktop.png', {
  9  |       maxDiffPixelRatio: 0.1,
  10 |       mask: [page.locator('canvas')],
  11 |     });
  12 |   });
  13 | 
  14 |   test('hub mobile', async ({ page }) => {
  15 |     await page.setViewportSize({ width: 393, height: 852 });
  16 |     await page.goto('/');
  17 |     await page.waitForTimeout(8000);
  18 |     await expect(page).toHaveScreenshot('hub-mobile.png', {
  19 |       maxDiffPixelRatio: 0.1,
  20 |       mask: [page.locator('canvas')],
  21 |     });
  22 |   });
  23 | 
  24 |   test('architect desktop', async ({ page }) => {
  25 |     await page.setViewportSize({ width: 1440, height: 900 });
  26 |     await page.goto('/architect');
  27 |     await page.waitForTimeout(3000);
  28 |     await expect(page).toHaveScreenshot('architect-desktop.png', {
  29 |       maxDiffPixelRatio: 0.1,
  30 |     });
  31 |   });
  32 | 
  33 |   test('architect mobile', async ({ page }) => {
  34 |     await page.setViewportSize({ width: 393, height: 852 });
  35 |     await page.goto('/architect');
  36 |     await page.waitForTimeout(3000);
> 37 |     await expect(page).toHaveScreenshot('architect-mobile.png', {
     |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  38 |       maxDiffPixelRatio: 0.1,
  39 |     });
  40 |   });
  41 | });
  42 | 
```