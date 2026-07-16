# Vidyuth Karting Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single-page scroll-story portfolio for Vidyuth (11-year-old karting driver, #12) replicating charlesleclerc.com's structure and craft with his own acid-green/ink identity.

**Architecture:** Next.js 15 App Router, one route (`/`), ten chapter components composed in order plus a splash preloader. Lenis drives smooth scroll; Framer Motion (`motion` package) drives reveals and the pinned quote scrub. All copy/stats live in one typed data module so content edits never touch components.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, `motion`, `lenis`, Vitest + Testing Library, Playwright (via playwright-skill) for visual verification, ffmpeg for media.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-16-vidyuth-portfolio-design.md` — follow its palette, type, and chapter table exactly.
- Tokens: `--ink: oklch(0.13 0.02 280)`, `--paper: oklch(0.96 0 0)`, `--green: oklch(0.85 0.25 135)`, `--white-soft: oklch(0.95 0 0)`.
- Fonts: Anton SC (display, uppercase) + Manrope (body/UI) via `next/font/google`, `display: swap`.
- No fabricated data: results are exactly the five client-confirmed races; derived stats 3 podiums / 5 events / best P2; IAME finishes labeled "in category".
- Every animation has a `prefers-reduced-motion` fallback. Content never gated on animation.
- Contrast: body ink-on-paper ≥ 4.5:1. Green is never body-text color on light.
- No side-stripe borders, no gradient text, no eyebrow-kicker on every section (the dot+rule section marker is the reference's device and is the one deliberate kicker system), display tracking ≥ -0.04em.
- Commits after every task, message style: short imperative + `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` (minimal boot version)

**Interfaces:**
- Produces: bootable Next dev server; `src/app/` tree later tasks fill in.

- [ ] **Step 1: Write config files**

`package.json`:
```json
{
  "name": "vidyuth-racing",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`.gitignore`:
```
node_modules/
.next/
out/
*.tsbuildinfo
.DS_Store
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

`postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`src/app/globals.css` (boot version, replaced in Task 2):
```css
@import "tailwindcss";
```

`src/app/layout.tsx` (boot version, replaced in Task 2):
```tsx
import "./globals.css";
export const metadata = { title: "Vidyuth #12" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` (boot version):
```tsx
export default function Home() {
  return <main>Vidyuth</main>;
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install next@15 react@19 react-dom@19 motion lenis
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss postcss vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```
Expected: clean install, `motion` and `lenis` present in `package.json` dependencies.

- [ ] **Step 3: Boot check**

```bash
npm run dev -- --port 3456 &
sleep 6 && curl -s http://localhost:3456 | grep -q "Vidyuth" && echo BOOT_OK
```
Expected: `BOOT_OK`. Kill the server after.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Scaffold Next.js 15 app with motion and lenis"
```

---

### Task 2: Design tokens, fonts, vitest setup

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create: `vitest.config.ts`, `vitest.setup.ts`, `src/lib/fonts.ts`

**Interfaces:**
- Produces: CSS vars `--ink --paper --green --white-soft`, utility classes `.bg-graph`, `.font-display`; `fonts.ts` exports `display` and `body` (next/font objects with `.variable`).

- [ ] **Step 1: Fonts module**

`src/lib/fonts.ts`:
```ts
import { Anton_SC, Manrope } from "next/font/google";

export const display = Anton_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
```

- [ ] **Step 2: Tokens + base styles**

`src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-ink: oklch(0.13 0.02 280);
  --color-paper: oklch(0.96 0 0);
  --color-green: oklch(0.85 0.25 135);
  --color-white-soft: oklch(0.95 0 0);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
}

:root {
  --z-sticky: 40;
  --z-header: 50;
  --z-menu: 60;
  --z-splash: 70;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body), sans-serif;
  font-weight: 500;
}

.font-display {
  font-family: var(--font-display), sans-serif;
  text-transform: uppercase;
  line-height: 0.88;
}

/* graph-paper: reference's light-section texture */
.bg-graph {
  background-color: var(--color-paper);
  background-image:
    linear-gradient(color-mix(in oklch, var(--color-ink) 5%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklch, var(--color-ink) 5%, transparent) 1px, transparent 1px);
  background-size: 72px 72px;
}

h1, h2, h3 { text-wrap: balance; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 3: Wire fonts into layout**

`src/app/layout.tsx`:
```tsx
import "./globals.css";
import type { Metadata } from "next";
import { display, body } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Vidyuth #12 — Karting Driver",
  description:
    "Official site of Vidyuth, 11-year-old karting driver racing toward Formula 1. 3 podiums. Race number 12.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Smoke test the setup**

Create `src/lib/fonts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { display, body } from "./fonts";

describe("fonts", () => {
  it("exposes CSS variables for both families", () => {
    expect(display.variable).toBe("--font-display");
    expect(body.variable).toBe("--font-body");
  });
});
```

Run: `npm test`
Expected: PASS (next/font works under vitest via plugin-react; if next/font throws in jsdom, mock it in `vitest.setup.ts` with `vi.mock("next/font/google", ...)` returning `{ variable: "--font-display" }` style objects).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Add design tokens, fonts, and vitest setup"
```

---

### Task 3: Content data module

**Files:**
- Create: `src/data/site.ts`, `src/data/site.test.ts`

**Interfaces:**
- Produces (consumed by every chapter component):
```ts
export type RaceResult = { event: string; finish: number; category: "4-stroke" | "IAME (in category)" };
export const driver: { name: string; age: number; number: 12; headline: string; intro: string; bio: string[] };
export const results: RaceResult[];
export function derivedStats(rs: RaceResult[]): { podiums: number; events: number; bestFinish: number };
export const roadToF1: { stage: string; detail: string; current: boolean }[];
export const lifeCards: { title: string; text: string }[];
export const quote: string;
export const chapters: { id: string; label: string }[];
```

- [ ] **Step 1: Write failing tests**

`src/data/site.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { results, derivedStats, driver, chapters } from "./site";

describe("results data", () => {
  it("contains exactly the five confirmed races", () => {
    expect(results).toHaveLength(5);
    expect(results.map((r) => r.finish)).toEqual([3, 2, 3, 4, 6]);
  });
  it("derives 3 podiums, 5 events, best P2", () => {
    const s = derivedStats(results);
    expect(s).toEqual({ podiums: 3, events: 5, bestFinish: 2 });
  });
  it("labels IAME results in category", () => {
    const iame = results.filter((r) => r.event.startsWith("IAME"));
    expect(iame).toHaveLength(2);
    iame.forEach((r) => expect(r.category).toBe("IAME (in category)"));
  });
  it("driver facts match client-confirmed data", () => {
    expect(driver.age).toBe(11);
    expect(driver.number).toBe(12);
    expect(driver.name).toBe("Vidyuth");
  });
  it("has all ten chapters in order", () => {
    expect(chapters.map((c) => c.id)).toEqual([
      "hero", "driver", "stats", "beginnings", "road-to-f1",
      "quote", "gallery", "life", "partners", "contact",
    ]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — module `./site` not found.

- [ ] **Step 3: Implement**

`src/data/site.ts`:
```ts
export type RaceResult = {
  event: string;
  finish: number;
  category: "4-stroke" | "IAME (in category)";
};

export const driver = {
  name: "Vidyuth",
  age: 11,
  number: 12 as const,
  headline: "Born to race",
  intro:
    "Eleven years old. Three podiums. One goal: Formula 1. Vidyuth races karts the way the greats started, and he is only getting faster.",
  bio: [
    "Vidyuth climbed into a kart before most kids pick a sport, and the stopwatch settled it. Within his first seasons he was standing on podiums in 4-stroke competition and holding his own in the IAME series.",
    "Racing number 12. Green helmet. A family that travels to every circuit. The plan runs from karting through junior single-seaters, all the way to Formula 1.",
  ],
};

export const results: RaceResult[] = [
  { event: "Chennai Karting Festival", finish: 3, category: "4-stroke" },
  { event: "Karter Cup Season 1", finish: 2, category: "4-stroke" },
  { event: "GTM Endurance", finish: 3, category: "4-stroke" },
  { event: "IAME Series India, Round 1", finish: 4, category: "IAME (in category)" },
  { event: "IAME Series India, Round 2", finish: 6, category: "IAME (in category)" },
];

export function derivedStats(rs: RaceResult[]) {
  return {
    podiums: rs.filter((r) => r.finish <= 3).length,
    events: rs.length,
    bestFinish: Math.min(...rs.map((r) => r.finish)),
  };
}

export const roadToF1 = [
  { stage: "Karting", detail: "4-stroke podiums and IAME India rounds. This is now.", current: true },
  { stage: "International karting", detail: "IAME and FIA karting abroad, against the fastest kids in the world.", current: false },
  { stage: "Junior single-seaters", detail: "F4, then the junior formula ladder.", current: false },
  { stage: "Formula 1", detail: "The seat every step points at.", current: false },
];

export const lifeCards = [
  { title: "Training", text: "Kart fitness is real fitness: neck, grip, core, reaction drills. He trains around the school week." },
  { title: "Race day", text: "Walk the track. Briefing. Visor down. The grid does not care how old you are." },
  { title: "School and racing", text: "Homework travels in the kit bag. Teachers get the race calendar a term ahead." },
  { title: "The dream", text: "Every champion's story starts in a kart. His has already started." },
];

export const quote = "Too young to drive a car. Fast enough to race one.";

export const chapters = [
  { id: "hero", label: "Start" },
  { id: "driver", label: "The Driver" },
  { id: "stats", label: "Stats" },
  { id: "beginnings", label: "Beginnings" },
  { id: "road-to-f1", label: "Road to F1" },
  { id: "quote", label: "Mindset" },
  { id: "gallery", label: "Gallery" },
  { id: "life", label: "Life as a Driver" },
  { id: "partners", label: "Partners" },
  { id: "contact", label: "Contact" },
];
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS (all 5).

- [ ] **Step 5: Commit**

```bash
git add src/data && git commit -m "Add typed content module with confirmed results"
```

---

### Task 4: Media pipeline

**Files:**
- Create: `scripts/media.sh`, outputs in `public/media/` (webp photos, `hero.mp4`, `hero.webm`, `hero-poster.jpg`)

**Interfaces:**
- Produces: `public/media/photo-01.webp` … `photo-N.webp` (1600px wide max, quality 82), `public/media/portrait.webp` (the cutout image `PHOTO...(2).jpg`), `hero.mp4` ≤ 4MB.

- [ ] **Step 1: Write the script**

`scripts/media.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
SRC="assets"
OUT="public/media"
mkdir -p "$OUT"

i=1
for f in "$SRC"/*.jpeg "$SRC"/*.jpg; do
  [ -e "$f" ] || continue
  n=$(printf "photo-%02d" "$i")
  ffmpeg -y -i "$f" -vf "scale='min(1600,iw)':-2" -quality 82 "$OUT/$n.webp" </dev/null
  i=$((i+1))
done

# Hero loop: pick a 15s window with motion (adjust -ss after eyeballing source)
ffmpeg -y -ss 00:00:20 -t 15 -i "$SRC"/VIDEO-*.mp4 \
  -vf "scale=1440:-2:flags=lanczos,eq=saturation=1.05" -an \
  -c:v libx264 -crf 23 -preset slow -movflags +faststart "$OUT/hero.mp4" </dev/null
ffmpeg -y -ss 00:00:20 -t 15 -i "$SRC"/VIDEO-*.mp4 \
  -vf "scale=1440:-2:flags=lanczos" -an -c:v libvpx-vp9 -crf 34 -b:v 0 "$OUT/hero.webm" </dev/null
ffmpeg -y -ss 00:00:21 -i "$SRC"/VIDEO-*.mp4 -frames:v 1 -vf "scale=1440:-2" "$OUT/hero-poster.jpg" </dev/null
ls -lh "$OUT"
```

- [ ] **Step 2: Run and verify**

```bash
chmod +x scripts/media.sh && ./scripts/media.sh
```
Expected: webp files + hero.mp4 (≤ 4MB; if larger raise crf to 26) + hero.webm + hero-poster.jpg in `public/media/`.

- [ ] **Step 3: Eyeball the hero window**

Open `public/media/hero.mp4`; the 15s window must show on-track motion, not pit lane idle. If not, change `-ss` and re-run. Record chosen offset in the script.

- [ ] **Step 4: Commit**

```bash
git add scripts public/media && git commit -m "Add media pipeline: webp photos and hero loop"
```

---

### Task 5: UI primitives

**Files:**
- Create: `src/components/Monogram.tsx`, `src/components/SectionMarker.tsx`, `src/components/Sticker12.tsx`, `src/components/AngleShape.tsx`, `src/components/primitives.test.tsx`

**Interfaces:**
- Produces:
  - `Monogram({ inverted?: boolean })` — V12 stacked-italic SVG mark, ~64px wide.
  - `SectionMarker({ label: string })` — ruled line + dot + small uppercase Manrope label (the reference's device).
  - `Sticker12()` — outlined drop-shadow "12" sticker SVG.
  - `AngleShape({ className? })` — green skewed parallelogram `<div>` for section transitions.

- [ ] **Step 1: Failing render tests**

`src/components/primitives.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Monogram } from "./Monogram";
import { SectionMarker } from "./SectionMarker";
import { Sticker12 } from "./Sticker12";

describe("primitives", () => {
  it("Monogram renders an svg with V12 title", () => {
    render(<Monogram />);
    expect(screen.getByTitle("V12")).toBeInTheDocument();
  });
  it("SectionMarker renders its label uppercase", () => {
    render(<SectionMarker label="The Driver" />);
    expect(screen.getByText("The Driver")).toBeInTheDocument();
  });
  it("Sticker12 renders the race number", () => {
    render(<Sticker12 />);
    expect(screen.getByTitle("Race number 12")).toBeInTheDocument();
  });
});
```

Run: `npm test` → FAIL (modules missing).

- [ ] **Step 2: Implement**

`src/components/Monogram.tsx`:
```tsx
export function Monogram({ inverted = false }: { inverted?: boolean }) {
  const fill = inverted ? "var(--color-white-soft)" : "var(--color-ink)";
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" aria-hidden={false} role="img">
      <title>V12</title>
      <text x="0" y="18" fontFamily="var(--font-display)" fontSize="22" fontStyle="italic" fill={fill}>V</text>
      <text x="14" y="38" fontFamily="var(--font-display)" fontSize="26" fontStyle="italic" fill={fill}>12</text>
    </svg>
  );
}
```

`src/components/SectionMarker.tsx`:
```tsx
export function SectionMarker({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-px w-full max-w-xs bg-ink/80" />
      <div className="flex items-center gap-3">
        <span className="size-1.5 rounded-full bg-ink" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-[0.04em]">{label}</span>
      </div>
    </div>
  );
}
```

`src/components/Sticker12.tsx`:
```tsx
export function Sticker12() {
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" role="img">
      <title>Race number 12</title>
      <text x="10" y="72" fontFamily="var(--font-display)" fontSize="72" fontStyle="italic"
        fill="var(--color-white-soft)" stroke="var(--color-ink)" strokeWidth="3"
        paintOrder="stroke" style={{ filter: "drop-shadow(4px 4px 0 var(--color-ink))" }}>
        12
      </text>
    </svg>
  );
}
```

`src/components/AngleShape.tsx`:
```tsx
export function AngleShape({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`bg-green ${className}`}
      style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
    />
  );
}
```

- [ ] **Step 3: Run tests** → PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components && git commit -m "Add V12 monogram, section marker, sticker, angle shape"
```

---

### Task 6: Splash preloader

**Files:**
- Create: `src/components/Splash.tsx`, `src/components/Splash.test.tsx`

**Interfaces:**
- Produces: `Splash()` client component. Fixed overlay z-splash, ink background, V12 monogram + name wordmark scaling in, green wipe exit. Sets `sessionStorage.v12-splash=1`; renders `null` when flag present or `prefers-reduced-motion`.

- [ ] **Step 1: Failing tests**

`src/components/Splash.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Splash } from "./Splash";

describe("Splash", () => {
  beforeEach(() => sessionStorage.clear());
  it("renders on first visit", () => {
    render(<Splash />);
    expect(screen.getByTestId("splash")).toBeInTheDocument();
  });
  it("does not render when session flag set", () => {
    sessionStorage.setItem("v12-splash", "1");
    render(<Splash />);
    expect(screen.queryByTestId("splash")).toBeNull();
  });
});
```

Run: `npm test` → FAIL.

- [ ] **Step 2: Implement**

`src/components/Splash.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Monogram } from "./Monogram";

export function Splash() {
  const [show, setShow] = useState<boolean | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const seen = sessionStorage.getItem("v12-splash");
    if (seen || reduced) { setShow(false); return; }
    setShow(true);
    sessionStorage.setItem("v12-splash", "1");
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, [reduced]);

  // First paint on server/first client render: decide synchronously in test env
  if (show === null && typeof window !== "undefined") {
    if (sessionStorage.getItem("v12-splash")) return null;
  }
  if (show === false) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-testid="splash"
        className="fixed inset-0 grid place-items-center bg-ink"
        style={{ zIndex: "var(--z-splash)" }}
        exit={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <Monogram inverted />
          <span className="font-display text-white-soft text-3xl">Vidyuth</span>
          <motion.span
            className="block h-0.5 w-40 origin-left bg-green"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            aria-hidden
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

Note for implementer: jsdom has no `matchMedia`; add to `vitest.setup.ts`:
```ts
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }),
});
```

- [ ] **Step 3: Run tests** → PASS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add session-gated splash preloader"
```

---

### Task 7: Scroll provider, header, CTA chip

**Files:**
- Create: `src/components/SmoothScroll.tsx`, `src/components/Header.tsx`, `src/components/PartnerChip.tsx`

**Interfaces:**
- Produces: `SmoothScroll({ children })` (Lenis rAF loop, disabled on reduced motion); `Header()` (fixed, Monogram left; CHAPTERS dropdown listing `chapters` from `@/data/site`, anchor links `#id`); `PartnerChip()` (fixed bottom-right green chip "Partner with Vidyuth" → `#partners`, 44px min target).

- [ ] **Step 1: Implement SmoothScroll**

`src/components/SmoothScroll.tsx`:
```tsx
"use client";
import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12, anchors: true });
    let raf: number;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 2: Implement Header with CHAPTERS dropdown**

`src/components/Header.tsx`:
```tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Monogram } from "./Monogram";
import { chapters } from "@/data/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 flex items-center justify-between px-5 py-4 md:px-8"
      style={{ zIndex: "var(--z-header)" }}
    >
      <a href="#hero" aria-label="Vidyuth 12, back to top" className="cursor-pointer">
        <Monogram />
      </a>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-[0.04em] mix-blend-difference text-white-soft"
        >
          Chapters
          <motion.span animate={{ rotate: open ? 180 : 0 }} aria-hidden>▾</motion.span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.nav
              role="menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 mt-3 flex w-56 flex-col bg-ink p-2"
              style={{ zIndex: "var(--z-menu)" }}
            >
              {chapters.map((c) => (
                <a key={c.id} role="menuitem" href={`#${c.id}`} onClick={() => setOpen(false)}
                  className="cursor-pointer px-4 py-2.5 text-sm font-bold text-white-soft hover:bg-green hover:text-ink">
                  {c.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Implement PartnerChip**

`src/components/PartnerChip.tsx`:
```tsx
export function PartnerChip() {
  return (
    <a
      href="#partners"
      className="fixed bottom-5 right-5 flex min-h-11 cursor-pointer items-center gap-2 bg-green px-5 py-3 text-xs font-extrabold uppercase tracking-[0.04em] text-ink transition-transform duration-200 hover:-translate-y-0.5"
      style={{ zIndex: "var(--z-sticky)", clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)" }}
    >
      Partner with Vidyuth
    </a>
  );
}
```

- [ ] **Step 4: Wire into layout**

In `src/app/layout.tsx` body:
```tsx
<body>
  <SmoothScroll>
    <Splash />
    <Header />
    {children}
    <PartnerChip />
  </SmoothScroll>
</body>
```
(Imports accordingly.)

- [ ] **Step 5: Verify in browser**

Start dev server; Playwright screenshot at 1440px: header visible, dropdown opens listing 10 chapters, chip bottom-right.
Expected: no console errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Add Lenis provider, chapter header, partner chip"
```

---

### Task 8: Hero chapter

**Files:**
- Create: `src/components/chapters/Hero.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Hero()` — `<section id="hero">`, full viewport, video bg (`hero.webm`/`hero.mp4`, poster, `autoPlay muted loop playsInline`), ink 35% overlay, huge display headline `driver.headline` (split into two staggered lines), "Scroll to explore" bottom-center.

- [ ] **Step 1: Implement**

`src/components/chapters/Hero.tsx`:
```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { driver } from "@/data/site";

export function Hero() {
  const reduced = useReducedMotion();
  const words = driver.headline.split(" "); // ["Born","to","race"]
  return (
    <section id="hero" className="relative h-svh overflow-hidden bg-ink">
      <video
        className="absolute inset-0 size-full object-cover opacity-80"
        poster="/media/hero-poster.jpg"
        autoPlay={!reduced} muted loop playsInline
        aria-hidden
      >
        <source src="/media/hero.webm" type="video/webm" />
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-ink/35" aria-hidden />
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <h1 className="font-display text-center text-white-soft"
            style={{ fontSize: "clamp(4rem, 17vw, 15rem)" }}>
          {words.map((w, i) => (
            <motion.span
              key={w}
              className="inline-block"
              initial={reduced ? false : { y: "0.4em", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.5 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}&nbsp;
            </motion.span>
          ))}
        </h1>
      </div>
      <p className="absolute inset-x-0 bottom-8 text-center text-xs font-bold uppercase tracking-[0.04em] text-white-soft">
        Scroll to explore
      </p>
    </section>
  );
}
```
Note: headline entrance delay 2.5s clears the splash exit on first visit; on later visits the splash is absent and the wait is acceptable only if ≤ 0.4s, so the implementer must read the session flag: `const delayBase = sessionStorage-flag-was-fresh ? 2.5 : 0.3` (pass down from a tiny `useSplashDone()` hook or context — implement as a module-level boolean exported from `Splash.tsx`: `export function splashWasShownThisLoad(): boolean`).

- [ ] **Step 2: Assemble page**

`src/app/page.tsx`:
```tsx
import { Hero } from "@/components/chapters/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Playwright at 1440/768/375: video covers, headline legible, no overflow-x. Confirm the upscaled 1024×576 source holds up under the overlay at 1440 (spec acceptance test). If mushy: increase overlay to /45 and add `backdrop-filter: blur(0px)`… no — if mushy, flag to user per spec.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add hero chapter with video loop and staggered headline"
```

---

### Task 9: The Driver + Stats cluster

**Files:**
- Create: `src/components/chapters/Driver.tsx`, `src/components/chapters/Stats.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Driver()` — `<section id="driver">` graph-paper bg; SectionMarker "The Driver"; `driver.intro` as large Manrope paragraph (clamp 1.5–2.2rem, max-w-[34ch]); grid with `portrait.webp` (`next/image`) + `driver.bio` paragraphs (max-w-[65ch]).
  `Stats()` — `<section id="stats">` same bg; layered cards cluster: three stat cards (Podiums 3 / Events 5 / Best finish P2 from `derivedStats(results)`), one Sticker12 card, one "Series" card listing "4-stroke karting · IAME Series India"; cards slightly rotated (-2°..2°), overlapping on desktop (CSS grid + translate), stacked on mobile; each wrapped in `motion.div` `whileInView` entrance settling rotation from 0 with stagger 0.08, `viewport={{ once: true, margin: "-15%" }}`, initial opacity 1 fallback under reduced motion.

- [ ] **Step 1: Implement Driver** (complete component per interface; numerals in stat cards use `font-display` at clamp(3rem, 8vw, 6rem)).

`src/components/chapters/Driver.tsx`:
```tsx
import Image from "next/image";
import { SectionMarker } from "@/components/SectionMarker";
import { driver } from "@/data/site";

export function Driver() {
  return (
    <section id="driver" className="bg-graph px-5 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="The Driver" />
        <p className="mt-10 max-w-[34ch] font-body text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-snug">
          {driver.intro}
        </p>
        <div className="mt-16 grid gap-10 md:grid-cols-[320px_1fr] md:gap-16">
          <Image
            src="/media/portrait.webp" alt={`${driver.name} in his race suit and green helmet`}
            width={640} height={800} className="w-full max-w-xs"
            sizes="(min-width: 768px) 320px, 90vw"
          />
          <div className="flex max-w-[65ch] flex-col gap-5 self-center text-[15px] leading-relaxed">
            {driver.bio.map((p) => <p key={p.slice(0, 16)}>{p}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Implement Stats** (client component):

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { Sticker12 } from "@/components/Sticker12";
import { SectionMarker } from "@/components/SectionMarker";
import { derivedStats, results } from "@/data/site";

const cardBase = "bg-white-soft/90 p-6 shadow-[0_2px_24px_rgba(0,0,22,0.08)]";

export function Stats() {
  const s = derivedStats(results);
  const reduced = useReducedMotion();
  const cards = [
    { label: "Podiums", value: String(s.podiums), rot: -2 },
    { label: "Events raced", value: String(s.events), rot: 1.5 },
    { label: "Best finish", value: `P${s.bestFinish}`, rot: -1 },
  ];
  return (
    <section id="stats" className="bg-graph px-5 pb-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Stats" />
        <div className="mt-12 flex flex-wrap items-start gap-6 md:gap-0">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              className={`${cardBase} md:-mr-4 md:w-64`}
              initial={reduced ? false : { opacity: 0, y: 24, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: c.rot }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">{c.label}</p>
              <p className="font-display mt-3 text-[clamp(3rem,8vw,6rem)]">{c.value}</p>
            </motion.div>
          ))}
          <motion.div
            className={`${cardBase} md:-mr-4`}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0, rotate: 2 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: 0.24, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">Number</p>
            <Sticker12 />
          </motion.div>
          <motion.div
            className={cardBase}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: 0.32, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">Racing in</p>
            <p className="mt-3 max-w-[18ch] text-sm font-bold">4-stroke karting · IAME Series India</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add to page, verify via Playwright** (both sections, three viewports, cards legible, contrast OK).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add driver intro and layered stats cluster"
```

---

### Task 10: Beginnings timeline

**Files:**
- Create: `src/components/chapters/Beginnings.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Beginnings()` — `<section id="beginnings">`; SectionMarker "Beginnings"; pull-quote heading `"I want to be on that grid."` styled as the reference's quote (Manrope semibold, clamp(1.6rem, 3vw, 2.4rem), quotation marks); horizontal drag carousel (`motion.div` with `drag="x"`, `dragConstraints` measured from content width) of result cards: each card = event name (font-display, 2rem), `P{finish}` giant numeral, category tag; prev/next arrow buttons (outlined, 44px, `aria-label`) that scroll the track by one card via controlled `animate`.
- Consumes: `results` from `@/data/site`.

- [ ] **Step 1: Implement** the component (full code with `useRef` measuring `scrollWidth - clientWidth` for `dragConstraints`, arrows shifting an `x` motion value by card width 320+24, clamped; `whileTap={{ cursor: "grabbing" }}`; reduced motion: plain `overflow-x-auto` scroll container instead of drag).

- [ ] **Step 2: Verify** drag + arrows on desktop Playwright run; native horizontal scroll fallback at 375px; all five results visible with correct finishes (P3 P2 P3 P4 P6).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "Add beginnings results carousel"
```

---

### Task 11: Road to F1 ladder

**Files:**
- Create: `src/components/chapters/RoadToF1.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `RoadToF1()` — `<section id="road-to-f1">` ink background (dark section), white-soft text; SectionMarker (inverted variant: pass `className` prop — extend SectionMarker with `inverted?: boolean` toggling `bg-white-soft`/`text-white-soft`); heading "Road to F1" in font-display clamp(3rem, 9vw, 7.5rem); ordered list of 4 stages from `roadToF1`, numbered 01–04 (this is the one legitimate numbered sequence per spec), each row: number, stage name (font-display 2.5rem), detail (Manrope, max-w-[55ch]); current stage carries a green marker chip "NOW" and green stage name; rows reveal `whileInView` with per-row slide-in from left, stagger 0.1, once.
- Consumes: `roadToF1` from `@/data/site`.

- [ ] **Step 1: Extend SectionMarker with `inverted` prop** (update primitives test to cover it: renders with `text-white-soft` class when inverted).

- [ ] **Step 2: Implement RoadToF1** per interface (complete code; green only as accent chip + current stage title, contrast checked: green on ink ≥ 3:1 for large text).

- [ ] **Step 3: Verify** via Playwright dark section renders, NOW chip on Karting, no overflow at 375.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add road to F1 ladder section"
```

---

### Task 12: Pinned quote scrub

**Files:**
- Create: `src/components/chapters/QuoteScrub.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `QuoteScrub()` — `<section id="quote">` with `h-[300svh]` outer and `sticky top-0 h-svh` inner; background: `photo-01.webp` (panning kart shot) via `next/image fill` + `blur-[6px] brightness-[0.45]` + `scale-110`; the quote uppercase font-display single line `whitespace-nowrap` at `clamp(8rem, 28vh, 22rem)`; `useScroll({ target: outerRef })` + `useTransform(scrollYProgress, [0,1], ["4%", "-104%"])` → x translate of the line (measured: translate from right edge to fully past left; implementer computes end % from line width vs viewport, or uses `x` in px via measured refs).
- Reduced motion: no pin, static section with the quote wrapped in 2 lines at clamp(2.5rem, 8vw, 5rem).

- [ ] **Step 1: Implement** with complete code:

```tsx
"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { quote } from "@/data/site";

export function QuoteScrub() {
  const outer = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["6%", "-106%"]);
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <section id="quote" className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-6">
        <Image src="/media/photo-01.webp" alt="" fill className="object-cover opacity-40 blur-sm" sizes="100vw" />
        <p className="font-display relative max-w-[14ch] text-center text-[clamp(2.5rem,8vw,5rem)] text-white-soft">{quote}</p>
      </section>
    );
  }

  return (
    <section id="quote" ref={outer} className="relative h-[300svh] bg-ink">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Image src="/media/photo-01.webp" alt="" fill
          className="scale-110 object-cover opacity-45 blur-[6px]" sizes="100vw" priority={false} />
        <div className="flex h-full items-center">
          <motion.p style={{ x }} className="font-display whitespace-nowrap text-[clamp(8rem,28vh,22rem)] text-white-soft">
            {quote}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** scrub: Playwright wheel-scroll through section, screenshot at 25/50/75% — line progresses right→left; check no horizontal scrollbar leaks (`overflow-hidden` on sticky inner).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "Add pinned horizontal quote scrub"
```

---

### Task 13: Gallery

**Files:**
- Create: `src/components/chapters/Gallery.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `Gallery()` — `<section id="gallery">` graph bg; SectionMarker "Gallery"; drag carousel (same mechanics as Beginnings — extract shared hook `src/lib/useDragTrack.ts` if both need it: returns `{ trackRef, x, prev, next, constraints }`) of all track photos `photo-02.webp`+ (skip portrait/screenshot images), `next/image` 480×320 `object-cover`, lazy; arrows identical to Beginnings.
- DRY note: implementer extracts `useDragTrack` during this task and refactors Beginnings to use it (small, safe refactor with existing Playwright pass re-run).

- [ ] **Step 1: Extract `useDragTrack` hook + refactor Beginnings** (re-run Task 10 verification).

- [ ] **Step 2: Implement Gallery** with the hook; alt text per photo ("Vidyuth racing kart number 12 on track" variants).

- [ ] **Step 3: Verify** drag + lazy loading (network tab shows below-fold images deferred).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add photo gallery with shared drag-track hook"
```

---

### Task 14: Life cards, Partners, Footer, final assembly

**Files:**
- Create: `src/components/chapters/Life.tsx`, `src/components/chapters/Partners.tsx`, `src/components/Footer.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces:
  - `Life()` — `<section id="life">` ink bg; 4 rows from `lifeCards`, each an expandable disclosure (`<button aria-expanded>` + `AnimatePresence` height auto): closed = title in font-display 3rem white-soft with green index dot; open = text paragraph. One open at a time.
  - `Partners()` — `<section id="partners">` graph bg; heading "Partner with Vidyuth" font-display; pitch paragraph ("Your brand on a rising driver's kart, suit, and story. Season sponsorships and single-race packages."); empty-state logo row: three outlined placeholder tiles each reading "Your logo here" (designed, not apologetic); CTA `mailto:` button (green, 44px+) with copy "Start the conversation" — email address `[NEEDS-CLIENT]`: use `href="#contact"` until supplied, and the footer contact block says "Sponsorship enquiries via Instagram" linking the social when provided.
  - `Footer()` — `<footer id="contact">` ink bg; chapter link columns, social slots (render only links present in `src/data/site.ts` `socials: {label, href}[]` — ship empty array until client provides), "© 2026 Vidyuth", "Site by ENTØ" credit linking entostudios.com.
- Consumes: `lifeCards`, `chapters` from `@/data/site`.

- [ ] **Step 1: Add `socials: { label: string; href: string }[] = []` to `src/data/site.ts`** + test that it exports an array.

- [ ] **Step 2: Implement all three components** (complete code per interface).

- [ ] **Step 3: Assemble final page order** in `src/app/page.tsx`: Hero, Driver, Stats, Beginnings, RoadToF1, QuoteScrub, Gallery, Life, Partners, Footer.

- [ ] **Step 4: Verify** full-page Playwright pass, all ten chapter anchors navigable from CHAPTERS menu.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add life, partners, footer; assemble full page"
```

---

### Task 15: Quality gate pass

**Files:**
- Modify: whatever the audits flag.

**Interfaces:**
- Consumes: the finished page; Produces: shipping-ready build.

- [ ] **Step 1: Unit tests green**: `npm test` → all pass.
- [ ] **Step 2: Production build**: `npm run build` → zero errors/warnings.
- [ ] **Step 3: Playwright responsive sweep** at 375/768/1280/1440: screenshot every chapter, check `document.body.scrollWidth <= innerWidth` at each stop (no horizontal leak), tab-order walk hits header menu → chapters → chip → footer links.
- [ ] **Step 4: Reduced-motion sweep**: emulate `prefers-reduced-motion` in Playwright, confirm splash skipped, quote static, carousels scrollable, all content visible.
- [ ] **Step 5: Lighthouse** (`npx lighthouse http://localhost:3456 --preset=desktop`): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90. Fix flags (likely: video preload, image sizes, contrast).
- [ ] **Step 6: Contrast audit**: verify computed ink-on-paper and white-on-ink pairs ≥ 4.5:1; green-on-ink large text ≥ 3:1 (adjust `--green` lightness if short).
- [ ] **Step 7: impeccable slop-detector**: run `node ~/.claude/skills/impeccable/scripts/detect.mjs --json src` — zero banned-pattern hits.
- [ ] **Step 8: Commit fixes**

```bash
git add -A && git commit -m "Pass quality gates: a11y, responsive, lighthouse"
```

---

## Self-review notes

- Spec coverage: chapters 0–10 → Tasks 6 (splash), 8 (hero), 9 (driver+stats), 10 (beginnings), 11 (road), 12 (quote), 13 (gallery), 14 (life+partners+footer). Identity → Task 2/5. Media → Task 4. Motion/reduced-motion → per-task + Task 15. Honesty rule → Task 3 tests pin exact results; Partners empty-state designed.
- Type consistency: `derivedStats(results)` used in Stats matches Task 3 signature; `chapters` ids match anchor `#id`s across Header/page.
- Known judgment calls for the implementer: exact `-ss` hero window (Task 4 step 3), quote scrub end-percentage fine-tune (Task 12), `useDragTrack` extraction (Task 13). All bounded with acceptance checks.
