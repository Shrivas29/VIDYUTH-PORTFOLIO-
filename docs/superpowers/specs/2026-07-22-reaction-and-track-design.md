# Reaction Test + Scroll-Driven Road to F1 — Design

Date: 2026-07-22
Branch: feat/site-v1
Status: approved, ready for plan

Two additive features for the Vidyuth Nº12 portfolio, both following the
existing chapter conventions (`"use client"`, `motion/react` `whileInView`,
`useHydratedReducedMotion`, `SectionMarker`/`RevealHeading`, the ink/graph/green
palette, and the `chapters` + `darkChapters` registries in `src/data/site.ts`).

---

## Feature 1 — Reaction Test (F1 start-lights game)

### Purpose
A playable, shareable interactive beat that lets a visitor test their reaction
against a fixed "Vidyuth benchmark". Boosts time-on-page and memorability
without a backend.

### Placement
- New component `src/components/chapters/Reaction.tsx`, section `id="reaction"`.
- Inserted in `src/app/page.tsx` **after `<Highlight />` (Onboard) and before
  `<Life />`** — cockpit → race-start is a tight narrative transition.
- Registered in `src/data/site.ts`:
  - `chapters` array: `{ id: "reaction", label: "Reaction" }` placed between
    `highlight` and `life`.
  - `darkChapters` set: add `"reaction"` (it is an ink section, so the fixed
    header/side-nav chrome flips to light over it).
- Dark section: `bg-ink text-white-soft`, matching `Highlight`/`Life`.

### State machine
One reducer/`useState` machine with these phases:

| Phase       | What shows                                             | Exit |
|-------------|--------------------------------------------------------|------|
| `idle`      | Prompt: "Tap when the lights go out." All lights dim.  | user arms (click / Space / Enter) → `arming` |
| `arming`    | Five red lights illuminate left→right, ~1000ms apart.  | after 5th light → `set` |
| `set`       | All five red. Random hold **200–3000ms**.              | timer fires → `go`; user taps → `jumpstart` |
| `go`        | All lights OUT. Reaction timer starts (`performance.now()`). | user taps → `result` |
| `result`    | Reaction time in ms + comparison to benchmark.         | user re-arms → `arming` |
| `jumpstart` | "Jump start. Reset." No score recorded.                | user re-arms → `arming` |

- All timeouts are cleared on unmount and on phase change (no leaks, no
  double-fire). Store timer ids in a ref.
- Timing uses `performance.now()` for sub-ms accuracy; go-timestamp stored in a
  ref, read on the resolving tap.

### Scoring (local + benchmark, no backend)
- Benchmark lives in `src/data/site.ts` as `reactionBenchmarkMs = 180` (0.180s),
  single source of truth alongside the other site data.
- Best time persisted to `localStorage` key `v12-reaction-best` (integer ms).
  Read lazily on mount inside an effect (never during render — SSR safe).
- `result` copy:
  - time ≤ benchmark → "Grid-ready — faster than Vidyuth."
  - time > benchmark → "Vidyuth: 0.180s. Go again."
- Displays *Your best* vs *Vidyuth 0.180s* as two `font-block` numerals.
- Human-implausible taps (< 100ms after `go`) are still shown but flagged as a
  likely early guess in copy ("Too quick to be real — try again"), not saved as
  a best. Threshold constant `HUMAN_FLOOR_MS = 100`.

### Interaction & layout
- The armable surface is a single `<button>` filling the interactive card,
  min 44×44px (well exceeded), `cursor-pointer`, visible focus ring.
- Playable by pointer tap and by keyboard (Space/Enter). Space is intercepted
  only while the section's button has focus, so it never hijacks page scroll.
- Five lights render as a horizontal row of rounded rects/circles; `font-block`
  for the big ms readout.

### Accessibility & reduced motion
- `aria-live="polite"` status region announces each phase: "Lights out — tap
  now", "0.203 seconds — grid-ready", "Jump start, reset".
- Real button semantics + `aria-label` on the play surface.
- The lights are **gameplay, not decoration** — they still change state under
  `prefers-reduced-motion`, but instantly, with no scale/glow flourish. The
  section heading/marker reveals are gated on reduced motion like every other
  chapter.

### Testing (Vitest + Testing Library, matching existing `*.test.tsx`)
- `idle → arming` on click and on Enter/Space.
- Tapping during `set` yields `jumpstart` and records no best.
- A resolved `go → result` with a stubbed `performance.now()` delta shows the
  expected ms and the correct benchmark copy on both sides of 180ms.
- Best persists to `localStorage` and reloads on remount.
- Timers use fake timers; assert no pending timers after unmount.

---

## Feature 2 — Road to F1 as a scroll-driven track

### Purpose
Turn the static 4-stage `RoadToF1` list into a cinematic scroll-scrubbed
racing line: a kart marker travels a vertical track as you scroll, drawing a
green line behind it and lighting each stage as it arrives.

### Scope
- Reworks `src/components/chapters/RoadToF1.tsx` **in place**. Keeps
  `id="road-to-f1"`, the `roadToF1` data (no data change), the "Now" badge, the
  `SectionMarker` + `RevealHeading` header, and its `darkChapters` membership.

### Mechanic
- A vertical **SVG racing line** on the left rail spans the ordered stage list,
  with a gentle S-curve so it reads as a track, not a timeline bar.
- motion's `useScroll({ target: sectionRef, offset: [...] })` gives
  `scrollYProgress`. **Non-pinned** (deliberately — pinning inside Lenis is the
  fragile path; `useScroll` delivers the same "trace as you scroll" effect
  without pin jank).
- `scrollYProgress` drives:
  1. the green line **drawing in** via animated `stroke-dashoffset`
     (full length → 0), using a `useTransform` motion value.
  2. a **kart marker** translated along the path via
     `path.getPointAtLength(progress * totalLength)`, measured once on mount
     (and on resize) with `getTotalLength()`.
- Each of the 4 stage nodes lights green once the marker's progress passes its
  fractional position along the path. The final node is **Formula 1**, capped
  with a small checkered-flag motif at the destination.

### Reduced motion
- Line renders **fully drawn**, marker parked at the **current** stage
  (`roadToF1.find(s => s.current)`), all four stages fully visible — i.e. the
  exact static behavior shipping today. No scroll listeners attached.

### Structure & isolation
- Keep the SVG track as a small internal piece (a `TrackRail` sub-component or
  a clearly separated block within the file) so the path-measuring logic is
  testable and doesn't tangle with the stage list markup.
- Path length is read from the DOM after mount; guard for `null` refs and for
  `getTotalLength` being unavailable in jsdom (tests stub it).

### Testing
- Renders all four stages and the "Now" badge on the current stage (parity with
  today).
- Under reduced motion, no scroll subscription is created and every stage is
  visible (assert the reduced-motion branch renders the static layout).
- Marker position math: given a stubbed total length and a progress value, the
  computed point maps to the expected node activation (pure helper extracted and
  unit-tested).

---

## Shared constraints (both features)
- No new dependencies. `motion`, `gsap`, `lenis` already installed; Feature 2
  uses `motion/react` `useScroll`/`useTransform` (no GSAP pin).
- No layout shift; sections reserve their space. No horizontal scroll at
  375/768/1280.
- Copy follows stop-slop: short, active, no adverbs, no em-dashes.
- Only `src/data/site.ts` (chapter registry) and `src/app/page.tsx` (insert the
  new chapter) change outside the two component files and their tests.

## Out of scope
- Global/shared leaderboard (explicitly deferred — local + benchmark only).
- Sound effects.
- GSAP ScrollTrigger pinning.
- Any change to the other chapters, SEO metadata, or the countdown.
