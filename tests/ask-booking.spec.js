import { test, expect } from '@playwright/test';

// Mocks the /api/chat SSE endpoint so tests are deterministic and don't
// burn Groq tokens or hit Google Calendar.
//
// The server emits a stream of `data: { token | toolOutput }` events. We
// replicate that shape from fixture data keyed on the request body.

const SLOT_FIXTURES = [
  {
    startUtc: '2026-04-23T07:30:00.000Z',
    hostDisplay: 'Thu 23 Apr, 1:00 PM',
    hostTimezone: 'Asia/Kolkata',
    bookerDisplay: 'Thu 23 Apr, 1:00 PM',
    bookerTimezone: 'Asia/Kolkata',
    sameZone: true,
    offsetNote: null,
    combinedLabel: 'Thu 23 Apr, 1:00 PM IST',
  },
  {
    startUtc: '2026-04-23T09:30:00.000Z',
    hostDisplay: 'Thu 23 Apr, 3:00 PM',
    hostTimezone: 'Asia/Kolkata',
    bookerDisplay: 'Thu 23 Apr, 3:00 PM',
    bookerTimezone: 'Asia/Kolkata',
    sameZone: true,
    offsetNote: null,
    combinedLabel: 'Thu 23 Apr, 3:00 PM IST',
  },
  {
    startUtc: '2026-04-23T11:30:00.000Z',
    hostDisplay: 'Thu 23 Apr, 5:00 PM',
    hostTimezone: 'Asia/Kolkata',
    bookerDisplay: 'Thu 23 Apr, 5:00 PM',
    bookerTimezone: 'Asia/Kolkata',
    sameZone: true,
    offsetNote: null,
    combinedLabel: 'Thu 23 Apr, 5:00 PM IST',
  },
];

function sseBody(events) {
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join('') + 'data: [DONE]\n\n';
}

function streamTokens(text) {
  const chunks = text.match(/.{1,15}/g) || [text];
  return chunks.map((t) => ({ token: t }));
}

async function mockChatRoute(page, router) {
  await page.route('**/api/chat', async (route, request) => {
    if (request.method() !== 'POST') return route.continue();
    const body = JSON.parse(request.postData() || '{}');
    const response = await router(body);
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
      body: sseBody(response),
    });
  });
}

// The "Book a 30-min call" chip hits GET /api/booking/slots directly,
// bypassing Groq. Tests that click the chip need this mock too.
async function mockSlotsRoute(page, slots = SLOT_FIXTURES) {
  await page.route('**/api/booking/slots*', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        type: 'suggested_slots',
        slots,
        message: `Found ${slots.length} available slots.`,
      }),
    });
  });
}

test.describe('Ask page - Booking flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.clear());
  });

  test('booking suggestion chip renders slot bubbles', async ({ page }) => {
    await mockSlotsRoute(page);
    await mockChatRoute(page, () => streamTokens("I'm Moore, the AI version of Inder."));

    await page.goto('/ask');
    await page.waitForTimeout(1000);

    // Click the book suggestion chip (hits /api/booking/slots directly, no LLM)
    await page.locator('button:has-text("Book a 30-min call with Mahesh")').click();
    await page.waitForTimeout(500);

    // BookingCard renders with 3 slots
    await expect(page.locator('text=Thu 23 Apr, 1:00 PM IST')).toBeVisible();
    await expect(page.locator('text=Thu 23 Apr, 3:00 PM IST')).toBeVisible();
    await expect(page.locator('text=Thu 23 Apr, 5:00 PM IST')).toBeVisible();

    // And the canned follow-up line
    await expect(page.locator('text=Pick one and share')).toBeVisible();
  });

  test('clicking a slot shows a selection chip (no input auto-fill)', async ({ page }) => {
    await mockSlotsRoute(page);
    await mockChatRoute(page, () => streamTokens('ok'));

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Book a 30-min call with Mahesh")').click();
    await page.waitForTimeout(500);

    // Click the second slot
    await page.locator('button:has-text("Thu 23 Apr, 3:00 PM IST")').click();

    // Input should stay empty — no auto-fill
    const input = page.locator('input[placeholder*="name and email"], input[placeholder*="Ask anything"]');
    await expect(input).toHaveValue('');

    // Placeholder should switch to prompt for name + email
    await expect(page.locator('input[placeholder*="name and email"]')).toBeVisible();

    // And a selected-slot chip should appear above the input with the picked time
    await expect(page.locator(':text("Thu 23 Apr, 3:00 PM IST"):below(input)')).toHaveCount(0); // chip is above input — just verify chip presence:
    const chipMatches = await page.getByText(/Thu 23 Apr, 3:00 PM IST/i).count();
    expect(chipMatches).toBeGreaterThanOrEqual(1);
  });

  test('booking_confirmed renders green Booked card with Meet link', async ({ page }) => {
    await mockSlotsRoute(page);
    await mockChatRoute(page, () => {
      // user replied with slot + name + email → booked confirmation
      return [
        {
          toolOutput: {
            tool: 'book_meeting',
            result: {
              ok: true,
              type: 'booking_confirmed',
              booking: {
                id: 'abc123',
                name: 'Vikram',
                email: 'vikram@example.io',
                slot: SLOT_FIXTURES[1],
                meetLink: 'https://meet.google.com/abc-defg-hij',
              },
            },
          },
        },
        ...streamTokens('Booked. Invite sent to vikram@example.io.'),
      ];
    });

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Book a 30-min call with Mahesh")').click();
    await page.waitForTimeout(500);

    // Simulate user typing full booking info
    const input = page.locator('input[placeholder*="Ask anything"]');
    await input.fill('Thu 3pm, Vikram, vikram@example.io');
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForTimeout(800);

    // Confirmation card
    await expect(page.getByText('Booked', { exact: true })).toBeVisible();
    await expect(page.getByText('Invite sent to vikram@example.io', { exact: true })).toBeVisible();

    // Meet link button
    const meetBtn = page.locator('a:has-text("Join Google Meet")');
    await expect(meetBtn).toBeVisible();
    await expect(meetBtn).toHaveAttribute('href', 'https://meet.google.com/abc-defg-hij');
  });

  test('booking_pending renders Noted card without Meet link', async ({ page }) => {
    await mockChatRoute(page, () => [
      {
        toolOutput: {
          tool: 'book_meeting',
          result: {
            ok: true,
            type: 'booking_pending',
            booking: {
              id: 'p1',
              name: 'Priya',
              email: 'priya@x.in',
              slot: SLOT_FIXTURES[0],
            },
          },
        },
      },
      ...streamTokens('Noted. Invite will land in priya@x.in shortly.'),
    ]);

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder*="Ask anything"]').fill('book me thu 1pm, priya, priya@x.in');
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForTimeout(800);

    await expect(page.getByText('Noted', { exact: true })).toBeVisible();
    await expect(page.getByText(/Invite will land in priya@x\.in shortly/).first()).toBeVisible();
    // No Meet link in pending state
    await expect(page.locator('a:has-text("Join Google Meet")')).toHaveCount(0);
  });

  test('validation error (past time) renders error card', async ({ page }) => {
    await mockChatRoute(page, () => [
      {
        toolOutput: {
          tool: 'check_availability',
          result: { ok: false, error: 'That time is in the past.' },
        },
      },
      ...streamTokens("That time has passed. Want me to show upcoming slots?"),
    ]);

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder*="Ask anything"]').fill('book me yesterday 2pm');
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=That time is in the past')).toBeVisible();
  });

  test('leave_message shows message_saved card', async ({ page }) => {
    await mockChatRoute(page, () => [
      {
        toolOutput: {
          tool: 'leave_message',
          result: {
            ok: true,
            type: 'message_saved',
            id: 'msg1',
            message: 'Saved. Mahesh will see it.',
          },
        },
      },
      ...streamTokens("Saved. Mahesh will see it next time he checks."),
    ]);

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder*="Ask anything"]').fill('tell him I loved his google io story, ravi@x.in');
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=Message saved')).toBeVisible();
  });

  test('slot bubbles only render on the latest assistant message', async ({ page }) => {
    await mockSlotsRoute(page);
    await mockChatRoute(page, () => streamTokens("What's your email?"));

    await page.goto('/ask');
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Book a 30-min call with Mahesh")').click();
    await page.waitForTimeout(500);

    // After a second turn with no slot tool output, old bubbles should be gone
    await page.locator('input[placeholder*="Ask anything"]').fill('Vikram');
    await page.locator('button[aria-label="Send"]').click();
    await page.waitForTimeout(800);

    // Old slot bubbles should not still be visible on the stale message
    const slotButtons = await page.locator('button:has-text("Thu 23 Apr, 1:00 PM IST")').count();
    expect(slotButtons).toBe(0);
  });

  test('resume download link is present and downloadable', async ({ page }) => {
    await mockChatRoute(page, () => streamTokens('hello'));
    await page.goto('/ask');
    await page.waitForTimeout(1000);
    const resumeLink = page.locator('a:has-text("Resume")');
    await expect(resumeLink).toBeVisible();
    await expect(resumeLink).toHaveAttribute('href', /resume\.pdf$/);
    await expect(resumeLink).toHaveAttribute('download', '');
  });
});
