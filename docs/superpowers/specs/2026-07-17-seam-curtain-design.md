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
child of the four chapters whose seams have no designed transition today:
Driver, Gallery, Partners, and the Footer. The other seams keep their
existing treatments — Driver→Stats→Beginnings share one continuous graph
background on purpose, and RoadToF1/Life already enter through the
scroll-scrubbed `useBoxReveal` window (stacking a curtain inside that
clip would double up entrances). Every seam ends up with exactly one
transition: curtain, continuous paper, or box reveal. Host sections gain
`relative` where missing.

Structure and motion:

- Outer: `absolute inset-x-0 top-0 h-svh overflow-hidden pointer-events-none
  z-30`, `aria-hidden` (decorative; below `--z-sticky: 40`).
- Inner panel: full-size `bg-ink`, centered inverted `Monogram`, and a
  green leading band (`h-1.5 bg-green`) pinned to its bottom edge.
- Scrub: `useScroll` targets the curtain's own outer element (its top edge
  equals the seam, so no host lookup is needed); panel `y` maps progress
  0→1 to `0%`→`-100%`. The overflow-hidden outer clips the lift, so the
  panel never covers the outgoing chapter above the seam. Net: the seam
  arrives closed and the curtain sweeps up at ~2x scroll speed through the
  entrance's second half.
- `max-h-full` caps the outer at the host's height so a short host (the
  footer) doesn't stretch the page's scrollable area.
- `finish` prop: `"top"` (default) completes the lift when the section top
  reaches the viewport top; `"bottom"` completes when the section bottom
  meets the viewport bottom — required for the footer, whose top can never
  reach the viewport top, where the default would stall part-lifted.

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
