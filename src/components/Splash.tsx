"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (seen || reduced) {
      shownThisLoad = false;
      setShow(false);
      return;
    }
    shownThisLoad = true;
    setShow(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => setShow(false), 2400);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <AnimatePresence>
      {show && (
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
      )}
    </AnimatePresence>
  );
}
