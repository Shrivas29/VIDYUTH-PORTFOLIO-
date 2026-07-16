# Vidyuth — Karting Portfolio, Design Spec

Date: 2026-07-16
Status: approved direction, pending final content from client
Reference: https://charlesleclerc.com/en/ (structure and craft level; identity is Vidyuth's own)

## Goal

A single-page scroll-story portfolio for Vidyuth, a young karting driver aiming for
Formula 1. The site must read as a professional athlete's official site, at the same
craft level as charlesleclerc.com.

Audience, ranked:
1. **Sponsors** — the site is a pitch: results, trajectory, professionalism, a clear partner CTA
2. **Academies / scouts** — a credibility dossier: stats, season-by-season results
3. **Fans** — story and personality

## Identity

Vidyuth's own kit drives the palette. His helmet and gloves are acid green on a black
suit; his kart carries **#12**.

### Color (OKLCH)

| Token | Value | Use |
|---|---|---|
| `--ink` | `oklch(0.13 0.02 280)` (≈ #000016 near-black, blue undertone) | text, dark sections |
| `--paper-grid` | `oklch(0.96 0 0)` + 1px grid lines at ~4% ink | light sections background (graph-paper texture, same device as reference) |
| `--green` | `oklch(0.85 0.25 135)` acid green, tuned to his helmet | accents, angled parallelogram shapes, sticker highlights, CTA |
| `--white` | `oklch(0.95 0 0)` | text on dark |

Color strategy: **committed**. Green replaces every use of Ferrari red in the
reference: angled shapes, section accents, the corner CTA chip, link hovers.
Contrast: body text ink-on-paper ≥ 4.5:1; green never used for body text on light.

### Typography

- **Display**: ultra-condensed uppercase grotesque for giant headlines
  (test order: Anton SC, then Archivo Black condensed via `font-stretch`; pick
  whichever matches the coign-87 energy at 300–400px sizes). Tracking ≥ -0.04em.
- **Body/UI**: **Manrope** (same family the reference uses), weights 500/700.
- Display headline ceiling: full-viewport single-line quotes are allowed to exceed
  normal clamp rules only inside the pinned horizontal-scrub section, where the line
  intentionally overflows and scrolls.

### Marks

- Monogram **V12** drawn as an SVG in the CL16 style: stacked italic letters,
  top-left, ink on light / white on dark.
- Race number **12** as a sticker-style graphic card (outlined, drop-shadowed
  numerals) in the stats cluster.

## Page structure (single page, chaptered)

Fixed header: V12 monogram left; CHAPTERS dropdown + hamburger right.
Sticky bottom-right CTA chip in green: **"Partner with Vidyuth"** → scrolls to Partners.

| # | Chapter | Content | Notes |
|---|---|---|---|
| 1 | **Hero** | 15s muted loop cut from client's track footage, giant condensed headline **BORN TO RACE** over it, "Scroll to explore" prompt | video: h264/webm dual source, poster frame, `playsinline muted loop autoplay` |
| 2 | **The Driver** | Section marker (• THE DRIVER, ruled line), large intro paragraph naming Vidyuth, age, base city, ambition; portrait photo + two short bio paragraphs | copy slots flagged `[NEEDS-CLIENT]` for age/city until confirmed |
| 3 | **Stats cluster** | Layered, slightly-rotated cards: Races, Wins, Podiums, Current series/team (Momentum Motorsports per kart livery — confirm), #12 sticker card | all numbers `[NEEDS-CLIENT]`; layout ships with real slots, no fake numbers |
| 4 | **Beginnings** | "• BEGINNINGS" + pull-quote from Vidyuth; year-by-year championship cards with prev/next carousel | timeline entries `[NEEDS-CLIENT]` |
| 5 | **Road to F1** | His trajectory: Karting now → national/international series → junior single-seaters → F1; current rung highlighted in green | the one section with a real ordered sequence; numbered steps earn their place here |
| 6 | **Pinned quote scrub** | Full-viewport dark section, blurred kart panning shot; giant single-line quote scrubs horizontally with scroll | quote `[NEEDS-CLIENT]`, fallback: "TOO YOUNG TO DRIVE A CAR. FAST ENOUGH TO RACE ONE." |
| 7 | **Gallery** | Draggable/arrow carousel of the client's track photos, captioned by circuit | photos exist in `assets/` |
| 8 | **Life as a Driver** | 4 expandable cards: Training / Race Day / School × Racing / The Dream | short copy each, written fresh |
| 9 | **Partners** | Sponsor logos row (empty-state designed: "Your brand on this kart" if none yet) + partner pitch block + contact CTA (mailto + phone/WhatsApp) | contact details `[NEEDS-CLIENT]` |
| 10 | **Footer** | Chapter links, socials (Instagram etc. `[NEEDS-CLIENT]`), photo credits, © Vidyuth 2026 | |

## Motion system

- **Lenis** smooth scroll wrapping the page.
- **Framer Motion** (`motion` package) for: section reveals (each styled to what it
  reveals, no uniform fade-up reflex), layered card entrances with rotation settle,
  carousel drag, chapter-menu open/close.
- **Pinned horizontal quote scrub**: section pins for ~2 viewports of scroll; the
  quote line translates X across it (scroll-linked `useScroll` + `useTransform`).
- All content visible by default; animations enhance, never gate visibility.
- `prefers-reduced-motion`: Lenis off, scrubs become static, reveals become instant;
  hero video pauses to poster.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- `motion` (Framer Motion) + `lenis`
- Deploy: Vercel. Repo: dedicated git repo at project root.
- Images: converted to WebP (originals kept in `assets/`, processed into `public/`),
  `next/image` with `sizes`, lazy below the fold.
- Video: ffmpeg cut + compress from the 11-min 1024×576 source to a ~15s loop,
  target ≤ 4MB h264 + webm, poster jpg. 1024×576 source is soft for full-bleed; use a
  slight dark overlay + upscale acceptance test at 1440px before committing to it.

## Out of scope (v1)

Store, news feed, multilingual, CMS. Single language (English), static content.

## Quality gates

- Global CLAUDE.md quality gate applies (a11y, contrast, 375/768/1280 Playwright
  passes, Lighthouse ≥ 90/95/90, reduced-motion).
- The AI-slop bans apply; the reference's own devices (graph paper, angled shapes,
  sticker numerals, condensed giants) are the design system and are used deliberately.
- No fabricated stats or results anywhere: every `[NEEDS-CLIENT]` slot ships either
  filled with client-confirmed data or visibly designed as "coming soon", never faked.

## Open content items (client to supply)

1. Age, base city, current series and team name
2. Race/championship results, year by year
3. A personal quote (for chapters 4 and 6)
4. Contact email/phone for sponsorship + social links
5. Any existing sponsor logos
