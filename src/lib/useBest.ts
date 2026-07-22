"use client";
import { useCallback, useSyncExternalStore } from "react";
import { readBest, writeBestIfBetter } from "@/lib/reaction";

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(onChange: Listener) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Hydration-safe reaction best-time, mirroring useHydratedReducedMotion:
 * reading `localStorage` during the first render (server or first client
 * hydration pass) would mismatch, so `useSyncExternalStore` renders the
 * server snapshot (`null` -> "--") through hydration, then swaps in the
 * real stored best. `commit` persists a new time (keeping it only if it's
 * better) and notifies subscribers so any mounted display re-renders.
 */
export function useBest() {
  const best = useSyncExternalStore(subscribe, readBest, getServerSnapshot);
  const commit = useCallback((ms: number) => {
    const next = writeBestIfBetter(ms);
    notify();
    return next;
  }, []);
  return { best, commit };
}
