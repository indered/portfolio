# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: persona-nav.spec.js >> Persona Navigation >> escape key triggers back navigation
- Location: tests/persona-nav.spec.js:42:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
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
      - main [ref=e26]:
        - generic [ref=e27]:
          - paragraph [ref=e28]: 7+ years of full stack development across India, Indonesia and UAE.
          - paragraph [ref=e29]: Worked in finance, e-commerce, social platforms and AI.
        - generic [ref=e30]:
          - link "Resume" [ref=e31]:
            - /url: /mahesh-inder-resume.pdf
            - img [ref=e32]
            - text: Resume
          - link "Cover Letter" [ref=e35]:
            - /url: /mahesh-inder-cover-letter.pdf
            - img [ref=e36]
            - text: Cover Letter
        - generic [ref=e39]:
          - heading "Skills" [level=2] [ref=e40]
          - generic [ref=e41]:
            - generic [ref=e42]:
              - heading "Frontend" [level=3] [ref=e43]
              - paragraph [ref=e44]: React · Next.js · Redux · TypeScript
            - generic [ref=e45]:
              - heading "Backend" [level=3] [ref=e46]
              - paragraph [ref=e47]: Node.js · Rust · GraphQL · REST
            - generic [ref=e48]:
              - heading "Cloud" [level=3] [ref=e49]
              - paragraph [ref=e50]: AWS · Lambda · ECS · Docker
            - generic [ref=e51]:
              - heading "Data" [level=3] [ref=e52]
              - paragraph [ref=e53]: Kafka · MongoDB · PostgreSQL · ElasticSearch
            - generic [ref=e54]:
              - heading "Architecture" [level=3] [ref=e55]
              - paragraph [ref=e56]: Microservices · DDD · Event-Driven · Federation
            - generic [ref=e57]:
              - heading "AI / Web3" [level=3] [ref=e58]
              - paragraph [ref=e59]: LangChain · Solidity · Ethereum
        - generic [ref=e60]:
          - heading "The Work" [level=2] [ref=e61]
          - generic [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]:
                - heading "Emirates NBD" [level=3] [ref=e65]
                - text: Senior Full Stack / Backend Engineer
              - generic [ref=e66]: 2024 — Present
            - generic [ref=e67]:
              - heading "Payment Tracker" [level=4] [ref=e68]
              - paragraph [ref=e69]: Real-time payment tracking for every dirham in the UAE, sub-millisecond on Kafka, Lambda and Rust.
              - generic [ref=e70]:
                - generic [ref=e71]: Rust
                - generic [ref=e72]: Kafka
                - generic [ref=e73]: AWS Lambda
                - generic [ref=e74]: Node.js
            - generic [ref=e75]:
              - heading "Statement Generator" [level=4] [ref=e76]
              - paragraph [ref=e77]: Rust-powered document engine that generates bank statements for accounts, FDs and credit cards 10x faster than the legacy system.
              - generic [ref=e78]:
                - generic [ref=e79]: Rust
                - generic [ref=e80]: Document Engine
                - generic [ref=e81]: Node.js
                - generic [ref=e82]: AWS
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e85]:
                - heading "Noumena" [level=3] [ref=e86]
                - text: Backend Developer
              - generic [ref=e87]: 2021 — 2023
            - generic [ref=e88]:
              - heading "Microservices Platform" [level=4] [ref=e89]
              - paragraph [ref=e90]: Twelve microservices, Apollo Federation gateway, in-app token economy, zero dropped messages at 50ms latency.
              - generic [ref=e91]:
                - generic [ref=e92]: Apollo Federation
                - generic [ref=e93]: GraphQL
                - generic [ref=e94]: AWS SNS/SQS
                - generic [ref=e95]: Docker
                - generic [ref=e96]: PostgreSQL
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e99]:
                - heading "Tokopedia 2× Google I/O" [level=3] [ref=e100]:
                  - text: Tokopedia
                  - generic [ref=e101]: 2× Google I/O
                - text: Full Stack Developer
              - generic [ref=e102]: 2020 — 2021
            - generic [ref=e103]:
              - heading "Discovery Engine" [level=4] [ref=e104]
              - paragraph [ref=e105]: Product discovery APIs so fast Google featured them at I/O twice. TTFB at 87ms.
              - generic [ref=e106]:
                - generic [ref=e107]: React
                - generic [ref=e108]: Node.js
                - generic [ref=e109]: GraphQL
                - generic [ref=e110]: Go
            - generic [ref=e111]:
              - heading "Intools" [level=4] [ref=e112]
              - paragraph [ref=e113]: Admin tool for Discovery sale pages that moved millions in GMV through content pipelines and live previews.
              - generic [ref=e114]:
                - generic [ref=e115]: React
                - generic [ref=e116]: Ant Design
                - generic [ref=e117]: Kubernetes
          - generic [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e120]:
                - heading "To The New" [level=3] [ref=e121]
                - text: Full Stack Developer
              - generic [ref=e122]: 2019 — 2020
            - generic [ref=e123]:
              - heading "Kokaihop 3.0" [level=4] [ref=e124]
              - paragraph [ref=e125]: Full API rebuild handling 2,000 concurrent users with ElasticSearch (20ms search), RabbitMQ and Node cluster mode.
              - generic [ref=e126]:
                - generic [ref=e127]: Apollo Server
                - generic [ref=e128]: GraphQL
                - generic [ref=e129]: MongoDB
                - generic [ref=e130]: ElasticSearch
                - generic [ref=e131]: RabbitMQ
            - generic [ref=e132]:
              - heading "Bharti AXA PWA" [level=4] [ref=e133]
              - paragraph [ref=e134]: Offline-first insurance PWA with multilevel form wizard and Redux state management.
              - generic [ref=e135]:
                - generic [ref=e136]: React
                - generic [ref=e137]: Redux
                - generic [ref=e138]: Apollo Client
                - generic [ref=e139]: PWA
          - generic [ref=e140]:
            - generic [ref=e141]:
              - generic [ref=e142]:
                - heading "Freelance" [level=3] [ref=e143]
                - text: Full Stack Developer
              - generic [ref=e144]: 2021 — 2022
            - generic [ref=e145]:
              - heading "Man the Bay" [level=4] [ref=e146]
              - paragraph [ref=e147]: Solo MERN build for Urban-Ed Academy's 4-year fellowship program in the Bay Area.
              - generic [ref=e148]:
                - generic [ref=e149]: React
                - generic [ref=e150]: Node.js
                - generic [ref=e151]: Express
                - generic [ref=e152]: MongoDB
        - generic [ref=e153]:
          - link "Get in touch →" [ref=e154]:
            - /url: mailto:mahesh.inder85@gmail.com
          - generic [ref=e155]:
            - link "LinkedIn" [ref=e156]:
              - /url: https://www.linkedin.com/in/mahesh-inder/
            - link "GitHub" [ref=e157]:
              - /url: https://github.com/indered
            - link "Instagram" [ref=e158]:
              - /url: https://www.instagram.com/mahesh.inder_/
      - button "esc escape to cosmos" [ref=e160] [cursor=pointer]:
        - generic [ref=e161]: esc
        - generic [ref=e162]: escape to cosmos
      - contentinfo [ref=e163]: was building a cv, ended up building a solar system
  - generic [ref=e165]:
    - generic [ref=e166]:
      - button "Navigate to The Architect" [disabled]:
        - generic: 💻
    - button "Navigate to The Long Run" [ref=e169] [cursor=pointer]:
      - generic: 🏃
    - button "Navigate to Ventures" [ref=e172] [cursor=pointer]:
      - generic: 🚀
    - button "Navigate to The Network Node" [ref=e175] [cursor=pointer]:
      - generic: 🌐
    - button "Navigate to The Thinker" [ref=e178] [cursor=pointer]:
      - generic: 📖
    - button "Navigate to Personal" [ref=e181] [cursor=pointer]:
      - generic: 💘
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Persona Navigation', () => {
  4  |   test('/architect route shows correct URL', async ({ page }) => {
  5  |     await page.goto('/architect');
  6  |     await page.waitForTimeout(2000);
  7  |     expect(page.url()).toContain('/architect');
  8  |   });
  9  | 
  10 |   test('position dots are visible on persona page', async ({ page }) => {
  11 |     await page.goto('/architect');
  12 |     await page.waitForTimeout(2000);
  13 | 
  14 |     const positionNav = page.locator('nav[aria-label="Section navigation"]');
  15 |     await expect(positionNav).toBeVisible({ timeout: 5000 });
  16 | 
  17 |     // Should have 6 position dots (one per persona)
  18 |     const dots = positionNav.locator('button');
  19 |     await expect(dots).toHaveCount(6);
  20 |   });
  21 | 
  22 |   test('arrow key navigation works between planets', async ({ page }) => {
  23 |     await page.goto('/architect');
  24 |     await page.waitForTimeout(2000);
  25 | 
  26 |     // Developer is first in PERSONA_IDS, pressing ArrowRight should go to runner
  27 |     await page.keyboard.press('ArrowRight');
  28 |     await page.waitForTimeout(1000);
  29 | 
  30 |     // After navigating right from developer, we should be on runner
  31 |     const runnerSection = page.locator('[data-persona="runner"]');
  32 |     await expect(runnerSection).toBeVisible({ timeout: 5000 });
  33 | 
  34 |     // Press ArrowLeft to go back to developer
  35 |     await page.keyboard.press('ArrowLeft');
  36 |     await page.waitForTimeout(1000);
  37 | 
  38 |     const developerSection = page.locator('[data-persona="developer"]');
  39 |     await expect(developerSection).toBeVisible({ timeout: 5000 });
  40 |   });
  41 | 
  42 |   test('escape key triggers back navigation', async ({ page }) => {
  43 |     await page.goto('/architect');
  44 |     await page.waitForTimeout(2000);
  45 | 
  46 |     await page.keyboard.press('Escape');
> 47 |     await page.waitForTimeout(1500);
     |                ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  48 | 
  49 |     // Should navigate to hub — URL goes to /
  50 |     expect(page.url()).toMatch(/\/$/);
  51 |   });
  52 | 
  53 |   test('attribution footer text is present', async ({ page }) => {
  54 |     await page.goto('/architect');
  55 |     await page.waitForTimeout(2000);
  56 | 
  57 |     const attribution = page.locator('text=was building a');
  58 |     await expect(attribution).toBeVisible({ timeout: 5000 });
  59 | 
  60 |     // Check for the full phrase via the footer element
  61 |     const footer = page.locator('footer').filter({ hasText: 'ended up building a' });
  62 |     await expect(footer).toBeVisible();
  63 |   });
  64 | });
  65 | 
```