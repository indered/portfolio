# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

This is a new portfolio project. Documentation will be updated as the project develops.

## Writing Preferences

- Write in full, natural sentences. Not short fragments. Not long academic paragraphs.
- Sound like a normal, down to earth person talking to a friend over coffee.
- No long dashes (— or –). No emojis. No semicolons.
- Add light humor where it fits. Don't force it.
- No fancy English. No "which", "whom", "whilst", "upon" type words.
- Don't sound like a writer, a poet, or a LinkedIn post.
- Read it out loud. If it sounds weird saying it to a friend, rewrite it.

## Things that have broken before

Append one line per bug fix as they happen. Format: `- [symptom] → [root cause] → [the rule that prevents recurrence]`. This log is the highest-value section over time — no LLM training data replicates it.

- `leave_message` failed with "next is not a function" → Mongoose 7+ removed callback-style `pre('validate', fn(next))` hooks → write hooks as `pre('validate', function() { throw ... })` or as `async`, never with a `next` parameter
- Moore dumped a bio paragraph when asked for the resume instead of linking out → no resume tool/rule existed, so the LLM improvised text → resume asks now route through the `show_resume` tool with a button to /resume, the resume suggestion chip is deterministic, and the system prompt forbids pasting resume contents as text
- `/ask` rendered as a blank black page after adding the resume footer link → `trackResumeDownload` was used without being imported → any new analytics helper used in JSX must be imported and smoke-tested in the browser
- `/video-stats` looked awkward on mobile landscape with shrunken cards and wasted gray space → the metric grid used auto-fit instead of viewport-specific column counts → every new dashboard surface must be screenshot-checked in mobile portrait and landscape before shipping
- `/waterlily-video` looked absurdly wide on desktop → the player container max-width was set too large for a single-video page → standalone media pages should cap content width closer to the site reading width, not full dashboard width
- `/waterlily-video` drifted into a copied mock instead of the site itself → the page invented a full shell and off-pattern links instead of reusing portfolio cues → for one-off routes, borrow the site's actual navigation, labels, and surface density before adding anything new
- `/resume` worked in production but failed in local dev → only the Express production server knew how to serve the PDF routes, while the client router had no matching view → any server-owned friendly URL that must also work under Vite needs a client-side route or direct static-file fallback
- `/ask` drifted into a white standalone app instead of the portfolio → styling optimized for a Gemini clone rather than the existing site language → high-traffic routes should be visually checked against the main site before shipping, not only against their own internal consistency
- `/waterlily-video` duplicated quick links on mobile and crowded the page below the player → the desktop quick-link row was kept unchanged at small breakpoints → mobile-only secondary actions should collapse into the top `More` menu when the video is the main focus
- `/waterlily-video` showed heavy black side bands around the embedded player → the iframe was sized to fit instead of being zoomed and cropped for the page layout → media embeds on showcase pages should be tuned per breakpoint, not left at default iframe framing
- `/waterlily-video` let the questions panel push the video off screen on desktop → the sidebar used normal page flow instead of a bounded internal scroll region → long desktop side panels beside pinned media should get their own max-height and overflow handling
- `/video-stats` still counted Mahesh's own visits after launch → ingress excluded self IPs, but the reporting query did not defensively filter stored self-traffic → private analytics views should reuse the self-IP exclusion rule at read time too
- `/waterlily-video` worked on localhost but showed a blank player in production → the Express `helmet` CSP blocked YouTube's iframe/API while the Vite dev server had no such restriction → any third-party embed that works locally must be checked against production CSP before shipping
- `/waterlily-video` first painted at one height and then snapped smaller when YouTube loaded → the embed API replaced the sized host node, so the placeholder box and final iframe were not using the same layout shell → third-party media players should mount inside a permanent wrapper that owns sizing before and after hydration
- `/video-stats` kept showing Mahesh's own mobile and desktop test sessions → IP exclusions alone missed rotating network addresses and device-level repeats → self-traffic filters should support both stable fingerprints and known IPs, and old rows should be purged once the exclusion list is updated
- `/waterlily-video` got visually oversized on desktop after refactoring the player shell → the stable wrapper fixed the loading jump but kept an overly tall desktop aspect ratio → after stabilizing embeds, re-check the final steady-state proportions against the approved screenshot before shipping
- `/video-stats` tracked likes in analytics but showed no like reporting → the backend and UI only summarized views and plays → whenever a new interaction event is recorded, add its reporting path and dashboard surface in the same change
- the booking confirmation on `/ask` looked unreadable in the dark theme → the success-state gradient overwrote the shared card background and kept dark text colors → confirmation states on dark surfaces need their own explicit background and contrast-safe text tokens
- `/ask` said a booking was on the way when Google OAuth was broken → hard calendar auth failures were downgraded into `pending` bookings and the retry worker could keep stale jobs alive → only queue truly retryable booking errors, and atomically claim pending jobs before processing them

## Skills to actively use here

Skills at `~/.Codex/skills/` are auto-loaded. Most relevant for this project:
- `self-review` — before claiming any non-trivial task done
- `visual-test` — for any UI feature work
- `design-review` — after generating new screens
- `marketing-voice` — for user-facing copy
- `persona-panel` — before naming, copy, pricing, or feature priority decisions
- `prod-cost-floor` — at deploy review
- `stack-pick` — if reconsidering the stack

Add or remove from this list as the project's needs become clearer.
