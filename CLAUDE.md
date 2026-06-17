# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- Moore dumped a bio paragraph when asked for the resume instead of linking out → no resume tool/rule existed, so the LLM improvised text → resume asks now route through the `show_resume` tool (card + button to /resume), the resume suggestion chip is a deterministic LLM-free fast path, and the system prompt forbids pasting resume contents as text
- `/ask` rendered as a blank black page after adding the resume footer link → `trackResumeDownload` was used without being imported → any new analytics helper used in JSX must be imported and smoke-tested in the browser
- `/stats` and `/live` showed only "Stats unavailable" in local dev → a stale listener kept port 5001 from reaching the portfolio API, and the client treated any response as success → kill conflicting listeners before restarting the stack, and fail fast on non-OK analytics responses.
- `/stats` ignored `?src=` tags entirely → the page never mounted the analytics hook, so the source param was never sent with page views → every attributable route needs to call `useAnalytics`.
- `/live` showed private source, area, and visitor history panels on a public page → it reused the private stats shell instead of a public-only layout → public live pages should stay summary-only and leave drill-down data to `/stats`.
- `/stats` lost its route breakdown → the dashboard kept only source and area bars after cleanup → private analytics pages should keep route, source, and area aggregates together.

## Skills to actively use here

Skills at `~/.claude/skills/` are auto-loaded. Most relevant for this project:
- `self-review` — before claiming any non-trivial task done
- `visual-test` — for any UI feature work
- `design-review` — after generating new screens
- `marketing-voice` — for user-facing copy
- `persona-panel` — before naming, copy, pricing, or feature priority decisions
- `prod-cost-floor` — at deploy review
- `stack-pick` — if reconsidering the stack

Add or remove from this list as the project's needs become clearer.
