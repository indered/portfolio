# Mahesh Inder — Design System

This is the design system for **Mahesh Inder's personal portfolio** — a cosmic, editorial-magazine web experience rebuilt as "The Mahesh Multiverse." The portfolio treats each facet of Mahesh's life as a planet in a 3D solar system you can navigate by scroll, keyboard or drift.

Live site: `https://maheshinder.in/` (not connected here, context only)

## Source

- **Repo**: `indered/portfolio` (GitHub) — React + Vite + SCSS Modules + Three.js (react-three-fiber) + Framer Motion + react-router
- Key files this system was distilled from:
  - `client/src/styles/_variables.scss` → all design tokens
  - `client/src/styles/_mixins.scss` → layout, glass, card, neon-glow patterns
  - `client/src/styles/_persona-themes.scss` → persona-scoped dark warm base
  - `client/src/lib/constants.js` → persona + planet config (the "content bible")
  - `client/public/{logo, logo-dark, logo-horizontal, favicon}.svg` → brand marks
  - `client/src/components/shell/HubMasthead.jsx` → magazine reveal interaction
  - `client/src/components/shell/PlanetDock.jsx` → macOS-style planet dock
  - `client/src/components/layout/OrbitalNav.jsx` → orbital navigation

## The Multiverse concept

Mahesh Inder is a **Full Stack Developer based in Dubai, UAE** (Emirates NBD, formerly Tokopedia and Noumena). The portfolio frames him as a person who contains multitudes, each represented as a **planet**:

| Persona | Planet | Tagline vibe |
|---|---|---|
| **Work** | Earth (blue) | Systems built to last. Architecture that doesn't apologise. |
| **The Long Run** | Mars (rust) | Running as mind-over-body. Dubai marathons. |
| **Ventures** | sage planet | Side projects: hydration brand, a programming language, Arc Protocol. |
| **Strings & Frequencies** | Venus (gold) | Guitar, DJ decks. |
| **Personal** | Aphrodite (rose) | Schrödinger's boyfriend. Light self-mythology. |
| **The Network Node** | Jupiter (ochre) | Social + contact links. |
| **The Thinker** | Pluto (stone) | Editorial serif essay-space. Guru Nanak + Hawking. |

It is a portfolio that takes itself seriously as an *experience* — intro has a paper-burn / black-hole reveal, there's a guestbook called Quantum Signatures, a token wallet gamification system, a "current cause" donation surface, and live Strava stats on a separate `/live` route.

## Index

| File | What it is |
|---|---|
| `README.md` | This file |
| `SKILL.md` | Agent-Skill wrapper for Claude Code use |
| `colors_and_type.css` | All design tokens + semantic type classes |
| `assets/` | Logos + favicon |
| `preview/` | Design System tab cards (small HTML previews) |
| `ui_kits/portfolio/` | Recreated core components + click-thru demo of the multiverse hub |

---

## Content Fundamentals

The writing is the most opinionated part of the brand. From `CLAUDE.md` in the repo, Mahesh's explicit writing rules:

- **Write in full, natural sentences.** Not fragments, not academic paragraphs.
- **Sound like a normal, down-to-earth person talking to a friend over coffee.**
- **No long dashes (— or –). No emojis. No semicolons.**
- **Add light humor where it fits. Don't force it.**
- **No fancy English.** Avoid "which", "whom", "whilst", "upon".
- **Don't sound like a writer, a poet, or a LinkedIn post.**
- **Read it out loud.** If it sounds weird to a friend, rewrite it.

### But the product copy also has a second mode

Inside the multiverse (persona taglines, project descriptions), the tone goes **cosmic, playful, mildly irreverent** — mixing physics metaphors with dry self-deprecation. Emojis DO appear here as persona icons (💻 🏃 🚀 🎵 💘 🌐 📖) — these are the planet identifiers, not decorative.

Specific patterns:
- **Self-mythologising with a wink**: "Schrödinger's Boyfriend: simultaneously perfect and a red flag until observed."
- **Tech-as-physics metaphors**: "Amazon SNS firing synaptic messages between services", "RabbitMQ is basically a quantum message broker", "microservices constellation".
- **Bragging gently, then undercutting it**: "Featured twice at Google I/O. Yes, twice. Google noticed."
- **Measurement porn**: exact latencies, concurrent user counts, distance in km.
- **Full sentences, never fragments in lists**: each highlight bullet is a complete thought.

Casing:
- Display / masthead: **UPPERCASE with wide tracking** (0.08em–0.38em)
- Body: sentence case
- Eyebrows and UI labels: **UPPERCASE mono, extreme tracking** (0.14em–0.38em)
- Buttons: uppercase mono, tracked (`Paperwork`, `Live`)

Voice checklist when generating copy:
- Would a friend at coffee say it this way?
- Is there a small unexpected comparison or metaphor?
- Are specific numbers in place of vague adjectives?
- No em-dashes, no "whilst", no semicolons.

---

## Visual Foundations

### The system at a glance

Three connected visual modes live in one site:

1. **Intro (Paper Burn / Black Hole)** — light cream `#faf8f5` background, ink serif text being consumed by a black void. Short.
2. **Hub (Solar System)** — deep dark cyberpunk `#09090b`. Real Three.js planets orbit around a sun. Magazine masthead reveals as MAHESH / INDER in screen-blend mode so planets bleed through the letterforms.
3. **Persona (inside a planet)** — unified warm dark base `#141210` (not pure black — a film-like warm black). Each persona injects ONE color via `--persona-color`, the planet's mesh color. No other accent is introduced. No purple, no cream, continuous with space.

### Colors

- **Base dark**: `#09090b` (hub) / `#141210` (persona). Warm enough to feel cinematic.
- **Base light**: `#faf8f5` (intro only) — paper cream, not clinical white.
- **Persona palette**: 7 named colors mapped to planets. Only one is visible per persona — it acts as `--color-accent-1` for that view.
- **Signature blue**: `#4a9eff` — the brand's blue accent, used in the `inder` half of the logo and Live buttons.
- **Selection**: always `--color-accent-1` with white/black contrasting text.
- **Card borders in dark**: `rgba(255, 255, 255, 0.07–0.10)` — barely perceptible.
- **Glass**: always `rgba(0,0,0,0.40)` with `backdrop-filter: blur(20px)` and 1px white-alpha border.

### Type

- **Display**: Plus Jakarta Sans (primary), falling back to Inter. Used for masthead, headings, buttons.
- **Body**: Inter, 400–700. Line-height 1.6.
- **Mono**: IBM Plex Mono — extremely prominent. Used for ALL small UI labels, buttons, eyebrows, metadata, stats. Always tracked (0.1em–0.38em) and often uppercase.
- **Serif**: Newsreader — used as a poetic accent (italic pull-quotes, the centre "M" in the orbital nav, selective flourishes).
- **Editorial serif**: Cormorant Garamond — swapped in ONLY on the Thinker persona (`[data-persona='thoughts']`) as the display family, because the Thinker's content is essay-length.

Size range (rem, base 16):
- Biggest: `clamp(12vw, 17vw, 240px)` — the MAHESH / INDER masthead. Viewport-driven.
- Large display: 48–40px.
- Body: 16–18px.
- Mono UI: 7–11px with heavy tracking.

### Backgrounds

- **Starfield** and **Distant Galaxies** as the hub background — Three.js particle systems, subtle but always moving.
- **CRT scanline overlay** on the hub — `styles.retroOverlay` — intentionally adds subtle retro texture.
- Inside personas, solid warm dark with a single "bleed orb" (radial gradient in persona color at ~10–15% opacity in one corner).
- **No repeating patterns or textures** anywhere else.
- **No image backgrounds** except for photography within sections.

### Animation

- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out — is the house easing. Used on almost every entry.
- **Theme transitions**: 600ms cubic-bezier(0.4, 0, 0.2, 1).
- **Character-by-character reveals**: name masthead letters lift in from below with 0.04s stagger.
- **Orbit animation**: planets rotate on `--orbit-duration` linear infinite; each has a counter-rotation on the planet itself so it stays upright.
- **Floating**: 3s ease-in-out infinite, 10px travel.
- **Hover**: cards translateY(-4px) with shadow growth (light) or border glow (dark). Never scale.
- **Press**: no shrink — transitions handle it.
- Supports **prefers-reduced-motion** — everything collapses to 0.01ms.

### Cursor

- **Custom cursor** via `CursorEffect` — default cursor hidden on `body`. Takes `--cursor-color` from the active persona.
- Touch devices restore the default cursor.

### Shadows

Light theme: `0 4px 24px rgba(0,0,0,0.06)` on cards, grows to `0 8px 32px` on hover.
Dark theme: **no ambient shadow**. Instead, an inset glow on hover: `0 0 15px rgba(0,255,204,0.1), inset 0 0 15px rgba(0,255,204,0.05)`.
On glowing elements (dock spheres): `0 0 Xpx Ypx <persona>cc, inset 0 0 10px rgba(0,0,0,0.25)`.
Text glow (dark only): `0 0 7px <color>, 0 0 20px rgba(<color>, 0.5)`.

### Borders

- 1px — everywhere. No 2px, no heavy borders.
- Dashed: only on orbit paths.
- Color: `rgba(255,255,255,0.07–0.10)` in dark, `rgba(0,0,0,0.08)` in light.
- Glass elements always add `inset 0 1px 0 rgba(255,255,255,0.06)` for a top highlight.

### Corner radii

- 4 / 8 / 10 / 12 / 16 / 24 / 44 / full.
- Menus: 10px. Cards: 12–16px. Glass pills: 44px or full. Buttons: 8px.
- No "organic" radii, no asymmetric corners.

### Layout

- `--max-width: 1200px`, centred with `padding-inline: var(--space-lg)`.
- Nav height 56px.
- Hub masthead is **fixed inset 0** — lives above the 3D scene.
- Compact logo: fixed `top: 20px; right: 24px;` — always top-right after the reveal.
- Dock: fixed `bottom: 20px`, centered, `width: fit-content`.

### Transparency / blur

Used sparingly but memorably:
- **Glass pill** on the dock — `rgba(0,0,0,0.40)` + `blur(20px)`.
- **Dropdown menus** — `rgba(8,6,18,0.88)` + `blur(20px) saturate(1.4)`.
- **Mix-blend-mode: screen** on the masthead so planets bleed through letters — *this is the signature visual moment of the site*.

### Imagery vibe

The site has **very little raster imagery**. The planets ARE the imagery (3D). When photography is used (Dubai skyline, runner persona), it's **warm, filmic, slightly desaturated**. No cool/blue casts. No illustrations. No icon sets of stock vector art.

---

## Iconography

The portfolio takes a **very mixed approach**:

1. **Emoji as primary persona marker**: 💻 🏃 🚀 🎵 💘 🌐 📖. Each persona has one. They appear in the dock spheres, mobile nav, and warp overlay. System-rendered, no icon font.
2. **Inline hand-rolled SVGs** for UI glyphs — `IconDownload`, `IconBriefcase`, a live/pulse icon. Style: `stroke="currentColor"`, `strokeWidth=2` or `2.5`, `strokeLinecap="round"`, `strokeLinejoin="round"`. **Lucide-style outline icons**, hand-drawn inline rather than imported.
3. **Logo marks** — SVGs in `assets/`:
   - `logo.svg` — stacked `mahesh` / `inder` with the second word in signature blue (`#4a9eff`), for dark backgrounds.
   - `logo-dark.svg` — same, for light backgrounds (first word black).
   - `logo-horizontal.svg` — inline version for tight spaces.
   - `favicon.svg` — M/I mark with blue underline, for browser tabs.
4. **No icon font**. **No Lucide / Heroicons import** — but the style matches Lucide closely, so `lucide` from CDN is a safe substitute when building new views.

### Usage rules

- **Emoji stay** in persona contexts. They're part of the narrative (each persona has ONE emoji that acts as its glyph).
- **UI glyphs** are always outline, 2px stroke, `currentColor`. If adding new ones, write them inline or pull from Lucide.
- **Never mix** filled + outlined in the same cluster.
- **Sizes**: 13–16px for inline UI, 1–1.3rem when acting as a persona icon on a sphere.

---

## Font Substitution

All four main families (Plus Jakarta Sans, Inter, IBM Plex Mono, Newsreader, Cormorant Garamond) are **standard Google Fonts** — they load via CDN directly, no local `.ttf` files are needed. `colors_and_type.css` imports them at the top. If you want local files for offline reliability, download from Google Fonts → replace the `@import` with `@font-face` declarations.

**No substitutions were required** — the original design system uses only free web fonts.

---

## Next Steps / Asks

See caveats at the end of the delivery message.
