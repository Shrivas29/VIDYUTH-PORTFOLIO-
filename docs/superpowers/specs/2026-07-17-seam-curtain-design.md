# Seam curtains between chapters + QuoteScrub removal

Date: 2026-07-17. Approved by Shrivas in conversation.

## Goal

Remove the "Too young to drive a car…" scrub section. Replace flat chapter
seams with a scroll-scrubbed curtain transition so each chapter arrives like
a page turn: an ink panel with an acid-green leading edge lifts off the
incoming section, flashing the VD mark.

## Removal

- Delete `src/components/chapters/QuoteScrub.tsx`; drop its import and
  element from `src/app/page.tsx`.
- Remove the `quote` export and the `{ id: "quote", label: "Mindset" }`
  chapter entry from `src/data/site.ts`; update `site.test.ts`.
- `public/media/photo-01.webp` becomes unused; the asset stays (harmless,
  may return in the gallery).
- Post-removal seam RoadToF1 (ink) → Gallery (graph) keeps light/dark
  contrast; both existing `SeamAccent` straddles stay valid.

## SeamCurtain component

`src/components/SeamCurtain.tsx`, client component, rendered as the first
child of every chapter section after the hero (Driver, Stats, Beginnings,
RoadToF1, Gallery, Life, Partners, Footer/contact). Host sections gain
`relative` where missing.

Structure and motion:

- Outer: `absolute inset-x-0 top-0 h-svh overflow-hidden pointer-events-none
  z-30`, `aria-hidden` (decorative; below `--z-sticky: 40`).
- Inner panel: full-size `bg-ink`, centered inverted `Monogram`, and a
  green leading band (`h-1.5 bg-green`) pinned to its bottom edge.
- Scrub: `useScroll({ target: hostSection, offset: ["start end",
  "start start"] })`; panel `y` maps progress 0→1 to `0%`→`-100%`. The
  overflow-hidden outer clips the lift, so the panel never covers the
  outgoing chapter above the seam. Net: the seam arrives closed and the
  curtain sweeps up at ~2x scroll speed through the entrance's second half.
- The host section element is found via the outer div's parent
  (`ref.current.closest("section, footer")`), so the component needs no
  props and stays drop-in.

Reduced motion: render nothing. Sections keep their existing static
presentation.

## Performance guardrails

- One transform-only layer per seam; no filters, no per-frame JS beyond
  motion's scroll binding.
- Panels sit idle (fully lifted or fully closed, off-screen) outside their
  own entrance window; browsers skip compositing for off-viewport fixed-size
  layers.

## Testing

- Unit (vitest): renders `aria-hidden` panel with the VD monogram; renders
  nothing under reduced motion.
- Browser (Playwright): screenshots mid-seam show the ink panel + green
  edge + VD mark; settled chapters show no curtain remnant; reduced-motion run
  shows no panels; zero console errors.
