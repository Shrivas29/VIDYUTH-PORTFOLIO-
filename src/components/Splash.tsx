"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

const SESSION_KEY = "v12-splash";

// How long the splash holds before it wipes away — the loading counter runs
// 0 -> 100 over ~2.1s, holds a beat on 100, then the curtain lifts. Hero's
// POST_SPLASH_DELAY is tuned to this so the headline enters just as the wipe
// clears it.
const DISPLAY_MS = 2600;

// Isomorphic layout effect: falls back to `useEffect` if this module is ever
// evaluated where `window` doesn't exist (SSR never actually runs this
// component's effects at all, so this is a safeguard against the dev-mode
// warning, not a real code path).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Whether the current page load showed the splash. Set synchronously inside
 * `Splash`'s mount effect, so it is only meaningful after that effect has run
 * (i.e. after the component using it renders on the client). Hero reads this
 * to decide how to time its headline entrance.
 *
 * This is a *layout* effect, not a plain `useEffect`, specifically so that
 * ordering guarantee holds: React fires every layout effect in the tree
 * before any passive effect, so a consumer reading this flag from its own
 * layout effect (Hero does) needs Splash's write to also be a layout
 * effect — otherwise the read always sees the pre-decision default,
 * regardless of component order. (Passive effects follow the same
 * sibling-order rule among themselves, and so do layout effects among
 * themselves, but the two phases don't interleave: *all* layout effects
 * commit before *any* passive effect does.)
 */
let shownThisLoad = false;

export function splashWasShownThisLoad(): boolean {
  return shownThisLoad;
}

export function Splash() {
  // Both the server render and the first client render must produce the same
  // output, so `show` always starts `false` here — never read sessionStorage
  // (or anything else client-only) during render. The effect below is the
  // only place that flips it, after hydration has already settled.
  const [show, setShow] = useState(false);
  const reduced = useReducedMotion();
  // Guards against React StrictMode's dev-mode double-invocation of mount
  // effects: without a guard, the first invocation would write the session
  // flag and the second would immediately see it and hide the splash, so it
  // would never actually show in `next dev` (and the flag would be burned
  // for the rest of the session). `decided` makes the "have we shown the
  // splash yet" call exactly once. `useReducedMotion()` lazily reads
  // `matchMedia` on first render and freezes that value in state (it never
  // updates after mount), so the `reduced` this closure captures is already
  // the correct first-mount value — no need to bypass the hook.
  //
  // The one-time decision alone isn't quite enough: StrictMode's simulated
  // mount->cleanup->remount cycle would clear the hide-timer set up on the
  // simulated first mount, and a naive "run the whole body once" guard would
  // then skip re-arming it on the real mount, leaving the splash stuck open
  // forever in dev. So the hide-timer is armed on every *actual* effect
  // invocation (each with its own cleanup), while `decided`/`willShow` only
  // gate the sessionStorage read/write and the one-time flags.
  const decided = useRef(false);
  const willShow = useRef(false);

  // Loading counter (0 -> 100) and the progress hairline it drives.
  const progress = useMotionValue(0);
  const lineWidth = useTransform(progress, (v) => `${v}%`);
  const [count, setCount] = useState(0);

  // Runs once when the splash shows (it only ever shows once per session, so
  // progress/count start at 0 and need no reset). onUpdate fires in rAF, not
  // synchronously in the effect body.
  useEffect(() => {
    if (!show || reduced) return;
    const controls = animate(progress, 100, {
      duration: 2.1,
      ease: [0.33, 1, 0.68, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return () => controls.stop();
  }, [show, reduced, progress]);

  useIsoLayoutEffect(() => {
    if (!decided.current) {
      decided.current = true;
      const seen = sessionStorage.getItem(SESSION_KEY);
      if (seen || reduced) {
        shownThisLoad = false;
        willShow.current = false;
        setShow(false);
      } else {
        shownThisLoad = true;
        willShow.current = true;
        setShow(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      }
      // React now owns the screen: the splash covers on fresh loads, the
      // hero shows otherwise. Drop the boot cover either way (this is a
      // layout effect, so the splash paints in the same commit — no gap).
      document.getElementById("boot-cover")?.remove();
    }
    if (!willShow.current) return;
    const t = setTimeout(() => setShow(false), DISPLAY_MS);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="splash"
          aria-hidden="true"
          className="fixed inset-0 overflow-hidden bg-ink text-white-soft"
          style={{ zIndex: "var(--z-splash)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex h-full flex-col justify-between px-6 py-8 md:px-10 md:py-10">
            {/* Top meta row */}
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-white-soft/45">
              <span>Vidyuth</span>
              <span>Nº12</span>
            </div>

            {/* Emblem, revealed with a crisp upward mask wipe */}
            <div className="flex flex-1 items-center justify-center overflow-hidden">
              <motion.img
                src="/media/v12-mark.svg"
                alt=""
                className="w-[min(60vw,340px)]"
                initial={{ y: "18%", opacity: 0, clipPath: "inset(0 0 100% 0)" }}
                animate={{ y: "0%", opacity: 1, clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              />
            </div>

            {/* Loading counter + progress hairline */}
            <div>
              <div className="flex items-end justify-between gap-4">
                <span className="whitespace-nowrap pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white-soft/45 md:text-[11px] md:tracking-[0.2em]">
                  Kart → Formula 1
                </span>
                <span className="font-block text-[clamp(2rem,10vw,5.5rem)] leading-none tabular-nums">
                  {String(count).padStart(3, "0")}
                </span>
              </div>
              <div className="relative mt-4 h-px w-full overflow-hidden bg-white-soft/15">
                <motion.span className="absolute inset-y-0 left-0 bg-green" style={{ width: lineWidth }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
