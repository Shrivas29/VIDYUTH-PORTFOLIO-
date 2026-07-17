"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Monogram } from "./Monogram";

const SESSION_KEY = "v12-splash";

/**
 * Whether the current page load showed the splash. Set synchronously inside
 * `Splash`'s mount effect, so it is only meaningful after that effect has run
 * (i.e. after the component using it renders on the client). Task 8's hero
 * reads this to decide how to time its headline entrance.
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

  useEffect(() => {
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
    }
    if (!willShow.current) return;
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          data-testid="splash"
          aria-hidden="true"
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
      )}
    </AnimatePresence>
  );
}
