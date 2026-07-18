# Scroll-scrub reveal hero (kart → F1)

Date: 2026-07-18. Approved by Shrivas: build the engine first with a
placeholder clip; generate the real video later on his final go.

## Goal

Replace the current hero (raw kart video under the ASCII-canvas mask —
Shrivas called the mask "fungly") with a scroll-scrubbed cinematic
showcase in the style of the ESPN "How F1 has evolved since 1950" feature:
a clean side-profile vehicle on a studio background whose playback is
driven by scroll. Here the clip transitions **kart → F1 car** — his
journey revealing as you scroll.

## Reference mechanic (studied)

ESPN feature: one ~7s pre-rendered video, `video.currentTime` set from
scroll progress (top = frame 0). No mask, no per-frame canvas. Cream
background, editorial serif headline, "FIG 1" hand-label.

## Component: ScrubReveal

`src/components/ScrubReveal.tsx`, client.

- Tall outer section (~300svh) gives scroll room; a `sticky top-0 h-svh`
  inner holds the composition so the clip scrubs over roughly three
  viewports of scroll.
- `useScroll` over the outer section → a target currentTime. A rAF loop
  eases `video.currentTime` toward the target (lerp) so seeks read smooth
  and decoupled from scroll jitter. Video: `muted playsInline preload
  auto`, never played — only seeked. Waits for `loadedmetadata`.
- Clean `bg-paper` studio background, video `object-contain` centered.
- Editorial overlay in brand: green kicker (`RACE Nº 12`), Panchang
  display headline (`Born to race`), a `FIG 01` label, and a
  progress-driven caption that crossfades `KARTING` → `FORMULA 1` at the
  midpoint with a thin progress rule. "Scroll to reveal" fades out.
- Reduced motion: no scrub loop; show the poster frame statically with the
  headline visible (content never gated on motion).

## Hero rework

`Hero.tsx` becomes the ScrubReveal host: drop `AsciiVideo` and the
halftone/mask layers. Keep the splash handoff — the headline still waits
for `splashWasShownThisLoad()` / `POST_SPLASH_DELAY`. The old
`hero.webm/mp4` serves as the **placeholder** scrub source until the real
clip lands.

## Video (later phase, on final go)

Higgsfield Seedance 2.0, start-frame = side-profile kart, end-frame =
side-profile F1 car (so the morph is exactly kart→F1), driver in his
**green helmet** (reliable, on-brand; real face rejected as uncanny),
green-accented livery, plain studio bg, silent, wide aspect. Generated
kart/F1 stills via generate_image first. Swap the file into ScrubReveal;
no code change beyond the src + duration.

## Testing

- Unit: reduced-motion renders the static poster + headline; overlay
  labels present.
- Browser (Playwright): scrubbing the page advances the video's
  currentTime monotonically; no ASCII canvas remains; 60fps; no console
  errors; 375/1440 layouts clean.
