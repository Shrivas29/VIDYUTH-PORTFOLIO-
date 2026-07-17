"use client";
import { useCallback, useRef } from "react";
import { animate, useMotionValue } from "motion/react";

/**
 * Shared mechanics for the draggable card tracks (Beginnings, Gallery).
 * The viewport clips; the track drags on x within the viewport's bounds
 * (framer measures ref-based dragConstraints itself, so resize needs no
 * listener). Arrow buttons shift by one card step, re-measuring on each
 * click so the clamp never goes stale.
 */
export function useDragTrack(step: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const shiftBy = useCallback(
    (delta: number) => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      const overflow = track.scrollWidth - viewport.clientWidth;
      const minX = overflow > 0 ? -overflow : 0;
      const target = Math.max(minX, Math.min(0, x.get() + delta));
      animate(x, target, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
    },
    [x]
  );

  const prev = useCallback(() => shiftBy(step), [shiftBy, step]);
  const next = useCallback(() => shiftBy(-step), [shiftBy, step]);

  return { viewportRef, trackRef, x, prev, next };
}
