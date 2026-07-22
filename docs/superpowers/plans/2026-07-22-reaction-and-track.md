# Reaction Test + Scroll-Driven Road to F1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a playable F1 start-lights reaction game as a new chapter, and rework the static Road-to-F1 list into a scroll-scrubbed racing line with a traveling kart marker.

**Architecture:** Two self-contained chapter components following the existing `"use client"` + `motion/react` pattern. Pure, framework-free logic (scoring, node math) lives in small `src/lib` modules so it is unit-testable without a DOM. The reaction game is a `useState` phase machine driven by `setTimeout`/`performance.now()`; the track is driven by `motion`'s `useScroll` (non-pinned) mapped through `useTransform`. Only `site.ts` (registries + benchmark constant) and `page.tsx` (insert the new chapter) change outside the component/lib/test files.

**Tech Stack:** Next 15 (App Router), React 19, `motion` v12 (`motion/react`), Tailwind v4, Vitest + Testing Library, jsdom.

## Global Constraints

- No new dependencies. Use only `motion`, already installed. No GSAP pinning.
- Follow existing chapter conventions: `"use client"`, `useHydratedReducedMotion`, `SectionMarker`/`RevealHeading`, palette tokens `bg-ink` / `text-white-soft` / `text-green` / `font-block` / `font-display`, shared ease `[0.22, 1, 0.36, 1]`.
- Copy follows stop-slop: short, active voice, no adverbs, **no em-dashes**.
- Accessibility: real `<button>` semantics, `cursor-pointer`, visible `focus-visible` ring, min 44px targets, `aria-live` for game status.
- Reduced motion (`useHydratedReducedMotion`) renders a static, fully-usable variant — never gates content on animation.
- No layout shift; no horizontal scroll at 375 / 768 / 1280.
- Benchmark is a single source of truth: `reactionBenchmarkMs = 180` in `src/data/site.ts`.
- Tests live beside the file as `*.test.ts(x)`, matching the existing suite. `vitest.setup.ts` already stubs `IntersectionObserver`, `ResizeObserver`, and `matchMedia` (returns `matches: false`, i.e. reduced motion OFF by default in tests).

---

## Task 1: Site data — benchmark constant + chapter registration

**Files:**
- Modify: `src/data/site.ts` (add `reactionBenchmarkMs`; add `reaction` to `chapters` and `darkChapters`)
- Test: `src/data/site.test.ts` (append cases)

**Interfaces:**
- Produces: `reactionBenchmarkMs: number` (=180); `chapters` includes `{ id: "reaction", label: "Reaction" }` between `highlight` and `life`; `darkChapters` includes `"reaction"`.

- [ ] **Step 1: Write the failing tests** — append to `src/data/site.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { chapters, darkChapters, reactionBenchmarkMs } from "./site";

describe("reaction registration", () => {
  it("exposes a positive benchmark in milliseconds", () => {
    expect(reactionBenchmarkMs).toBe(180);
  });

  it("registers the reaction chapter between highlight and life", () => {
    const ids = chapters.map((c) => c.id);
    expect(ids).toContain("reaction");
    expect(ids.indexOf("reaction")).toBe(ids.indexOf("highlight") + 1);
    expect(ids.indexOf("life")).toBe(ids.indexOf("reaction") + 1);
  });

  it("marks the reaction chapter as a dark (ink) section", () => {
    expect(darkChapters.has("reaction")).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data/site.test.ts`
Expected: FAIL — `reactionBenchmarkMs` is `undefined` / `reaction` not in `chapters`.

- [ ] **Step 3: Implement** — in `src/data/site.ts`:

Add near the other exported constants (e.g. after `contactEmail`):

```ts
// Reaction-game benchmark: Vidyuth's start-lights reaction, in milliseconds.
export const reactionBenchmarkMs = 180;
```

Add `"reaction"` to the dark-chapter set:

```ts
export const darkChapters = new Set(["road-to-f1", "highlight", "reaction", "life", "contact"]);
```

Insert the chapter entry between `highlight` and `life` in the `chapters` array:

```ts
  { id: "highlight", label: "Onboard" },
  { id: "reaction", label: "Reaction" },
  { id: "life", label: "Life as a Driver" },
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/data/site.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/site.ts src/data/site.test.ts
git commit -m "feat: register reaction chapter + benchmark in site data"
```

---

## Task 2: Reaction scoring logic (pure `src/lib/reaction.ts`)

**Files:**
- Create: `src/lib/reaction.ts`
- Test: `src/lib/reaction.test.ts`

**Interfaces:**
- Produces:
  - `HUMAN_FLOOR_MS: number` (=100)
  - `formatSeconds(ms: number): string` — e.g. `formatSeconds(203) === "0.203"`
  - `judgeReaction(ms: number, benchmarkMs: number): { tooQuick: boolean; beatBenchmark: boolean; message: string }`
  - `readBest(): number | null` — best ms from `localStorage["v12-reaction-best"]`, or `null`
  - `writeBestIfBetter(ms: number): number` — persists `min(prev, ms)`, returns the new best
- Consumes: nothing.

- [ ] **Step 1: Write the failing test** — `src/lib/reaction.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import {
  HUMAN_FLOOR_MS,
  formatSeconds,
  judgeReaction,
  readBest,
  writeBestIfBetter,
} from "./reaction";

describe("formatSeconds", () => {
  it("renders milliseconds as fixed 3-decimal seconds", () => {
    expect(formatSeconds(203)).toBe("0.203");
    expect(formatSeconds(180)).toBe("0.180");
    expect(formatSeconds(1000)).toBe("1.000");
  });
});

describe("judgeReaction", () => {
  it("flags implausibly fast taps and does not count them as a win", () => {
    const v = judgeReaction(HUMAN_FLOOR_MS - 1, 180);
    expect(v.tooQuick).toBe(true);
    expect(v.beatBenchmark).toBe(false);
    expect(v.message).toBe("Too quick to be real. Go again.");
  });

  it("celebrates a time at or under the benchmark", () => {
    const v = judgeReaction(180, 180);
    expect(v.tooQuick).toBe(false);
    expect(v.beatBenchmark).toBe(true);
    expect(v.message).toBe("Grid-ready. Faster than Vidyuth.");
  });

  it("shows the benchmark to beat when slower", () => {
    const v = judgeReaction(250, 180);
    expect(v.beatBenchmark).toBe(false);
    expect(v.message).toBe("Vidyuth: 0.180s. Go again.");
  });
});

describe("best-time persistence", () => {
  beforeEach(() => localStorage.clear());

  it("returns null with nothing stored", () => {
    expect(readBest()).toBeNull();
  });

  it("stores the first time, then only keeps a faster one", () => {
    expect(writeBestIfBetter(300)).toBe(300);
    expect(readBest()).toBe(300);
    expect(writeBestIfBetter(250)).toBe(250);
    expect(writeBestIfBetter(400)).toBe(250);
    expect(readBest()).toBe(250);
  });

  it("ignores a corrupt stored value", () => {
    localStorage.setItem("v12-reaction-best", "not-a-number");
    expect(readBest()).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/reaction.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — `src/lib/reaction.ts`:

```ts
// Pure scoring + persistence for the start-lights reaction game. No React,
// no DOM assumptions beyond localStorage (guarded), so it unit-tests cleanly.

export const HUMAN_FLOOR_MS = 100;
const BEST_KEY = "v12-reaction-best";

/** Milliseconds as fixed 3-decimal seconds: 203 -> "0.203". */
export function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(3);
}

export type ReactionVerdict = {
  tooQuick: boolean;
  beatBenchmark: boolean;
  message: string;
};

export function judgeReaction(ms: number, benchmarkMs: number): ReactionVerdict {
  if (ms < HUMAN_FLOOR_MS) {
    return { tooQuick: true, beatBenchmark: false, message: "Too quick to be real. Go again." };
  }
  const beatBenchmark = ms <= benchmarkMs;
  return {
    tooQuick: false,
    beatBenchmark,
    message: beatBenchmark
      ? "Grid-ready. Faster than Vidyuth."
      : `Vidyuth: ${formatSeconds(benchmarkMs)}s. Go again.`,
  };
}

export function readBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeBestIfBetter(ms: number): number {
  const prev = readBest();
  const best = prev === null ? ms : Math.min(prev, ms);
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    /* storage unavailable (private mode) — best stays in-memory only */
  }
  return best;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/reaction.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/reaction.ts src/lib/reaction.test.ts
git commit -m "feat: reaction scoring + best-time persistence"
```

---

## Task 3: Reaction chapter component + wire into page

**Files:**
- Create: `src/components/chapters/Reaction.tsx`
- Create: `src/components/chapters/Reaction.test.tsx`
- Modify: `src/app/page.tsx` (import + place `<Reaction />` after `<Highlight />`)

**Interfaces:**
- Consumes: `reactionBenchmarkMs` (Task 1); `judgeReaction`, `formatSeconds`, `readBest`, `writeBestIfBetter` (Task 2); `SectionMarker`, `useHydratedReducedMotion`.
- Produces: `export function Reaction()` — a `<section id="reaction">`.

Phase machine: `idle → arming → set → go → result | jumpstart`. A tap while `idle`/`result`/`jumpstart` re-arms; a tap during `arming`/`set` is a jump start; a tap during `go` records the reaction.

- [ ] **Step 1: Write the failing test** — `src/components/chapters/Reaction.test.tsx`:

```tsx
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Reaction } from "./Reaction";

const play = () => screen.getByTestId("reaction-stage");

describe("Reaction game", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts idle and prompts a start", () => {
    render(<Reaction />);
    expect(play()).toHaveAttribute("data-phase", "idle");
  });

  it("arms on click and reaches the set phase after the light sequence", () => {
    render(<Reaction />);
    fireEvent.click(play());
    expect(play()).toHaveAttribute("data-phase", "arming");
    act(() => vi.advanceTimersByTime(5000)); // five lights at 1s each
    expect(play()).toHaveAttribute("data-phase", "set");
  });

  it("treats a tap during set as a jump start and records no best", () => {
    render(<Reaction />);
    fireEvent.click(play());
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(play());
    expect(play()).toHaveAttribute("data-phase", "jumpstart");
    expect(localStorage.getItem("v12-reaction-best")).toBeNull();
  });

  it("times a go tap, shows the seconds, and saves a legit best", () => {
    // Random hold -> deterministic 1000ms; performance.now -> a fixed delta.
    vi.spyOn(Math, "random").mockReturnValue(0); // hold = HOLD_MIN_MS (200)
    const now = vi.spyOn(performance, "now");
    render(<Reaction />);
    fireEvent.click(play());
    act(() => vi.advanceTimersByTime(5000 + 200)); // lights + min hold -> go
    expect(play()).toHaveAttribute("data-phase", "go");

    now.mockReturnValue(1000); // go timestamp captured at 1000
    // simulate the tap 203ms later
    now.mockReturnValue(1203);
    fireEvent.click(play());
    expect(play()).toHaveAttribute("data-phase", "result");
    expect(screen.getByTestId("reaction-time")).toHaveTextContent("0.203");
    expect(localStorage.getItem("v12-reaction-best")).toBe("203");
  });
});
```

Note: the two `now.mockReturnValue` calls before the go-tap set the captured `go` timestamp (read when the `go` timeout fires) and the tap time. If the harness reads `performance.now()` inside the timeout callback rather than after, adjust by setting `now.mockReturnValue(1000)` **before** `advanceTimersByTime` and `1203` before the tap. Keep the assertion (`"0.203"`, `"203"`) fixed and align the mock ordering to the implementation in Step 3.

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/chapters/Reaction.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — `src/components/chapters/Reaction.tsx`:

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { reactionBenchmarkMs } from "@/data/site";
import { formatSeconds, judgeReaction, readBest, writeBestIfBetter } from "@/lib/reaction";

type Phase = "idle" | "arming" | "set" | "go" | "result" | "jumpstart";

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL_MS = 1000;
const HOLD_MIN_MS = 200;
const HOLD_MAX_MS = 3000;

const PROMPT: Record<Phase, string> = {
  idle: "Tap to start",
  arming: "Wait for it",
  set: "Wait for it",
  go: "TAP",
  result: "Tap to race again",
  jumpstart: "Jump start. Tap to reset.",
};

export function Reaction() {
  const reduced = useHydratedReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(0);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);

  const timers = useRef<number[]>([]);
  const goAt = useRef(0);

  useEffect(() => setBest(readBest()), []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const arm = useCallback(() => {
    clearTimers();
    setTimeMs(null);
    setLit(0);
    setPhase("arming");
    for (let i = 1; i <= LIGHT_COUNT; i++) {
      timers.current.push(window.setTimeout(() => setLit(i), i * LIGHT_INTERVAL_MS));
    }
    timers.current.push(window.setTimeout(() => setPhase("set"), LIGHT_COUNT * LIGHT_INTERVAL_MS));
    const hold = HOLD_MIN_MS + Math.random() * (HOLD_MAX_MS - HOLD_MIN_MS);
    timers.current.push(
      window.setTimeout(() => {
        setLit(0);
        goAt.current = performance.now();
        setPhase("go");
      }, LIGHT_COUNT * LIGHT_INTERVAL_MS + hold)
    );
  }, [clearTimers]);

  const tap = useCallback(() => {
    if (phase === "idle" || phase === "result" || phase === "jumpstart") {
      arm();
      return;
    }
    if (phase === "arming" || phase === "set") {
      clearTimers();
      setLit(0);
      setPhase("jumpstart");
      return;
    }
    // phase === "go": measure and score
    const ms = Math.round(performance.now() - goAt.current);
    clearTimers();
    setTimeMs(ms);
    const verdict = judgeReaction(ms, reactionBenchmarkMs);
    if (!verdict.tooQuick) setBest(writeBestIfBetter(ms));
    setPhase("result");
  }, [phase, arm, clearTimers]);

  const verdict = timeMs !== null ? judgeReaction(timeMs, reactionBenchmarkMs) : null;
  const status =
    phase === "go"
      ? "Lights out. Tap now."
      : phase === "result" && timeMs !== null
        ? `${formatSeconds(timeMs)} seconds. ${verdict?.message ?? ""}`
        : phase === "jumpstart"
          ? "Jump start. Tap to reset."
          : PROMPT[phase];

  return (
    <section id="reaction" className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Reaction" inverted as="p" />
        <h2 className="mt-8 font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.02]">
          Lights out.
        </h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white-soft/80">
          Five reds, then green. Tap the moment they vanish. Vidyuth reacts in{" "}
          {formatSeconds(reactionBenchmarkMs)}s.
        </p>

        <button
          type="button"
          data-testid="reaction-stage"
          data-phase={phase}
          onClick={tap}
          aria-label={
            phase === "go" ? "Lights out, tap now" : phase === "idle" ? "Start the reaction test" : "Reaction test"
          }
          className="mt-10 flex w-full cursor-pointer flex-col items-center gap-8 rounded-sm border border-white-soft/15 bg-white-soft/[0.03] px-6 py-14 transition-colors duration-200 hover:border-green/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
        >
          <div className="flex gap-3 md:gap-5" aria-hidden>
            {Array.from({ length: LIGHT_COUNT }, (_, i) => {
              const on = i < lit;
              return (
                <span
                  key={i}
                  className={`h-10 w-10 rounded-full md:h-14 md:w-14 ${
                    reduced ? "" : "transition-colors duration-100"
                  } ${on ? "bg-[oklch(0.62_0.22_25)] shadow-[0_0_24px_oklch(0.62_0.22_25/0.8)]" : "bg-white-soft/10"}`}
                />
              );
            })}
          </div>

          <div
            role="status"
            aria-live="polite"
            className="min-h-[3.5rem] text-center"
            data-testid="reaction-status"
          >
            {phase === "result" && timeMs !== null ? (
              <>
                <span
                  data-testid="reaction-time"
                  className={`font-block text-[clamp(2.4rem,8vw,4.5rem)] ${
                    verdict?.beatBenchmark ? "text-green" : "text-white-soft"
                  }`}
                >
                  {formatSeconds(timeMs)}s
                </span>
                <span className="mt-2 block text-[13px] font-bold uppercase tracking-[0.08em] text-white-soft/70">
                  {verdict?.message}
                </span>
              </>
            ) : (
              <span
                className={`font-block text-[clamp(1.6rem,5vw,2.6rem)] ${
                  phase === "go" ? "text-green" : "text-white-soft/70"
                }`}
              >
                {status}
              </span>
            )}
          </div>
        </button>

        <div className="mt-8 flex items-center justify-center gap-12">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white-soft/50">Your best</p>
            <p className="font-block mt-1 text-[clamp(1.4rem,4vw,2rem)]">
              {best === null ? "--" : `${formatSeconds(best)}s`}
            </p>
          </div>
          <div className="h-10 w-px bg-white-soft/15" aria-hidden />
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">Vidyuth</p>
            <p className="font-block mt-1 text-[clamp(1.4rem,4vw,2rem)] text-green">
              {formatSeconds(reactionBenchmarkMs)}s
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run to verify it passes** (align the `performance.now` mock ordering in the test with the implementation: `goAt.current` is read inside the go-timeout callback, so set `now.mockReturnValue(1000)` before `advanceTimersByTime(5000 + 200)` and `now.mockReturnValue(1203)` before the go-tap)

Run: `npx vitest run src/components/chapters/Reaction.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire into the page** — modify `src/app/page.tsx`:

Add the import beside the other chapters:

```tsx
import { Reaction } from "@/components/chapters/Reaction";
```

Place it after `<Highlight />`:

```tsx
      <Highlight />
      <Reaction />
      <Life />
```

- [ ] **Step 6: Typecheck + full test run**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS, no type errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/chapters/Reaction.tsx src/components/chapters/Reaction.test.tsx src/app/page.tsx
git commit -m "feat: F1 start-lights reaction game chapter"
```

---

## Task 4: Track node math (pure `src/lib/track.ts`)

**Files:**
- Create: `src/lib/track.ts`
- Test: `src/lib/track.test.ts`

**Interfaces:**
- Produces:
  - `nodePositions(count: number): number[]` — fractional positions along the rail. `nodePositions(4) === [0, 1/3, 2/3, 1]`; `nodePositions(1) === [0]`; `nodePositions(0) === []`.
  - `isReached(at: number, progress: number): boolean` — `progress >= at`.
  - `reachedCount(positions: number[], progress: number): number` — how many nodes are reached.
- Consumes: nothing.

- [ ] **Step 1: Write the failing test** — `src/lib/track.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { nodePositions, isReached, reachedCount } from "./track";

describe("nodePositions", () => {
  it("spreads N nodes evenly from 0 to 1", () => {
    expect(nodePositions(4)).toEqual([0, 1 / 3, 2 / 3, 1]);
  });
  it("handles the degenerate counts", () => {
    expect(nodePositions(1)).toEqual([0]);
    expect(nodePositions(0)).toEqual([]);
  });
});

describe("isReached / reachedCount", () => {
  it("reaches a node once progress passes its fraction", () => {
    expect(isReached(0, 0)).toBe(true); // first node always reached
    expect(isReached(1, 0.99)).toBe(false);
    expect(isReached(1, 1)).toBe(true);
  });
  it("counts reached nodes for a progress value", () => {
    const p = nodePositions(4);
    expect(reachedCount(p, 0)).toBe(1);
    expect(reachedCount(p, 0.5)).toBe(2);
    expect(reachedCount(p, 1)).toBe(4);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/track.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** — `src/lib/track.ts`:

```ts
// Pure geometry for the scroll-driven Road-to-F1 rail. Kept DOM-free so the
// node-activation logic unit-tests without a browser.

/** Fractional positions (0..1) of `count` nodes spread evenly along the rail. */
export function nodePositions(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}

/** A node at fraction `at` is reached once scroll progress passes it. */
export function isReached(at: number, progress: number): boolean {
  return progress >= at;
}

/** How many of `positions` are reached at the given progress. */
export function reachedCount(positions: number[], progress: number): number {
  return positions.filter((at) => isReached(at, progress)).length;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/track.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/track.ts src/lib/track.test.ts
git commit -m "feat: pure node math for the Road-to-F1 rail"
```

---

## Task 5: Rework RoadToF1 into a scroll-driven track

**Files:**
- Modify: `src/components/chapters/RoadToF1.tsx` (full rewrite, same `id`/data)
- Create: `src/components/chapters/RoadToF1.test.tsx`

**Interfaces:**
- Consumes: `roadToF1` (`src/data/site.ts`); `nodePositions`, `reachedCount` (Task 4); `SectionMarker`, `RevealHeading`, `useHydratedReducedMotion`; `motion`, `useScroll`, `useTransform`, `useMotionValueEvent` from `motion/react`.
- Produces: `export function RoadToF1()` — a `<section id="road-to-f1">`.

Effect: a subtle S-curve green line **draws in** with scroll (`pathLength={1}` + animated `strokeDashoffset`, so no path measuring), a kart disc **glides down** the rail (`top` mapped from scroll progress, with a small horizontal sway), and each stage node **lights green** as progress passes it. Reduced motion renders the line fully drawn, the marker parked at the current stage, and every stage visible.

- [ ] **Step 1: Write the failing test** — `src/components/chapters/RoadToF1.test.tsx`:

```tsx
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { RoadToF1 } from "./RoadToF1";
import { roadToF1 } from "@/data/site";

afterEach(() => cleanup());

describe("RoadToF1 track", () => {
  it("renders every stage and the Now badge on the current stage", () => {
    render(<RoadToF1 />);
    for (const stage of roadToF1) {
      expect(screen.getByText(stage.stage)).toBeInTheDocument();
    }
    expect(screen.getByText(/^Now$/i)).toBeInTheDocument();
  });

  it("renders the section shell and the kart marker", () => {
    render(<RoadToF1 />);
    expect(document.getElementById("road-to-f1")).toBeInTheDocument();
    expect(screen.getByTestId("track-marker")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/chapters/RoadToF1.test.tsx`
Expected: FAIL — no `track-marker` testid yet (current component predates it).

- [ ] **Step 3: Implement** — replace `src/components/chapters/RoadToF1.tsx` entirely:

```tsx
"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { RevealHeading } from "@/components/RevealHeading";
import { roadToF1 } from "@/data/site";
import { nodePositions, reachedCount } from "@/lib/track";

// Subtle S-curve in a 100 x 1000 user space (stretched to the rail with
// preserveAspectRatio="none"; a stroked line reads fine under the stretch).
const RAIL_PATH = "M50 0 C 18 250, 82 420, 50 620 S 18 880, 50 1000";
const ease = [0.22, 1, 0.36, 1] as const;

export function RoadToF1() {
  const reduced = useHydratedReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const positions = nodePositions(roadToF1.length);
  const currentIndex = Math.max(0, roadToF1.findIndex((s) => s.current));

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 60%"],
  });

  // Draw the line, glide the marker, sway it toward the curve.
  const dashoffset = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const markerTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const markerX = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, -14, 14, 0]);

  // Node activation needs to read progress in render, so mirror it into state.
  const [reached, setReached] = useState(reduced ? currentIndex + 1 : 1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    setReached(reachedCount(positions, p));
  });

  const staticFrac = positions[currentIndex] ?? 0;
  const litCount = reduced ? currentIndex + 1 : reached;

  return (
    <section ref={sectionRef} id="road-to-f1" className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Road to F1" inverted as="p" />
        <RevealHeading wrapClassName="mt-10" className="font-display text-[clamp(3rem,9vw,7.5rem)]">
          Road to F1
        </RevealHeading>

        <div className="mt-16 grid grid-cols-[44px_1fr] gap-4 md:grid-cols-[64px_1fr] md:gap-8">
          {/* Rail */}
          <div className="relative">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={RAIL_PATH} fill="none" stroke="oklch(0.95 0 0 / 0.14)" strokeWidth={3} />
              <motion.path
                d={RAIL_PATH}
                fill="none"
                stroke="var(--color-green)"
                strokeWidth={4}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={reduced ? 0 : dashoffset}
              />
            </svg>

            {/* Stage nodes */}
            {positions.map((frac, i) => {
              const lit = i < litCount;
              return (
                <span
                  key={i}
                  aria-hidden
                  className={`absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${
                    lit ? "border-green bg-green" : "border-white-soft/30 bg-ink"
                  }`}
                  style={{ top: `${frac * 100}%` }}
                />
              );
            })}

            {/* Kart marker */}
            <motion.span
              data-testid="track-marker"
              aria-hidden
              className="absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-green text-[9px] font-extrabold text-ink shadow-[0_0_18px_var(--color-green)]"
              style={
                reduced
                  ? { top: `${staticFrac * 100}%` }
                  : { top: markerTop, x: markerX }
              }
            >
              12
            </motion.span>
          </div>

          {/* Stages */}
          <ol className="flex flex-col">
            {roadToF1.map((stage, i) => (
              <motion.li
                key={stage.stage}
                className="grid gap-3 border-t border-white-soft/20 py-8 first:border-t-0 md:grid-cols-[1fr_1fr] md:gap-8"
                initial={false}
                whileInView={reduced ? undefined : { opacity: [0, 1], x: [36, 0], y: [20, 0] }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className={`font-block text-[clamp(1.8rem,4vw,2.5rem)] ${stage.current ? "text-green" : ""}`}>
                    {stage.stage}
                  </h3>
                  {stage.current && (
                    <span className="bg-green px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-ink">
                      Now
                    </span>
                  )}
                </div>
                <p className="max-w-[55ch] text-[15px] leading-relaxed text-white-soft/85 md:self-center">
                  {stage.detail}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/chapters/RoadToF1.test.tsx`
Expected: PASS. (jsdom's `ResizeObserver` stub lets `useScroll` mount; `useMotionValueEvent` never fires in jsdom, so `reached` stays at its initial value — the test only asserts presence, not scroll state.)

- [ ] **Step 5: Typecheck + full suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/chapters/RoadToF1.tsx src/components/chapters/RoadToF1.test.tsx
git commit -m "feat: scroll-driven racing line for Road to F1"
```

---

## Task 6: Production build + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds, no type or lint errors, no console warnings.

- [ ] **Step 2: Manual smoke (dev server)**

Run: `npm run dev`, open the site. Verify:
- Reaction chapter appears after Onboard; side-nav shows "Reaction"; header/side-nav chrome flips to the light (dark-section) variant over it.
- Play: five reds fill, all clear, tap registers a time; a too-early tap shows "Jump start"; best persists across a reload; keyboard (Tab to the stage, Space/Enter) plays it.
- Road to F1: scrolling draws the green line, the "12" marker glides down and sways, nodes light up in sequence, Formula 1 lands at the bottom.
- Toggle OS "reduce motion": Road to F1 shows a fully-drawn line with the marker at "Karting"; the reaction lights change instantly with no glow transition; both remain fully playable/readable.
- No horizontal scroll at 375 / 768 / 1280.

- [ ] **Step 3: Commit any fixes, then stop**

```bash
git add -A
git commit -m "fix: verification pass for reaction + track"
```

(Skip the commit if Step 1–2 surfaced nothing.)

---

## Self-Review Notes

- **Spec coverage:** Reaction placement/registration (Task 1, 3), state machine + jump start + benchmark + local best (Task 2, 3), a11y/reduced-motion (Task 3), track draw + marker + node lighting + reduced-motion static (Task 4, 5), no new deps / no pin / copy rules (Global Constraints). All spec sections map to a task.
- **No placeholders:** every code step carries full source.
- **Type consistency:** `judgeReaction`, `formatSeconds`, `readBest`, `writeBestIfBetter`, `nodePositions`, `reachedCount`, `reactionBenchmarkMs` are used with the exact signatures they are defined with.
