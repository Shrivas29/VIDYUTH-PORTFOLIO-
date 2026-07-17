"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Hydration-safe `prefers-reduced-motion`. Branching rendered output on
 * motion's `useReducedMotion` causes hydration mismatches (React #418):
 * the server guesses `false` while the client's first render reads the
 * real preference. `useSyncExternalStore` renders the server snapshot
 * through hydration, then re-renders with the real value — so the static
 * variant swaps in before any scroll-driven animation can play. Only
 * needed where the value changes rendered output; effect-only readers
 * (Splash, Hero's video) can use `useReducedMotion` directly.
 */
export function useHydratedReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
