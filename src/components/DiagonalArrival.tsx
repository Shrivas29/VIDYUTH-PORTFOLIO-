"use client";
import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";

/**
 * Scroll-scrubbed diagonal entrance for a whole chapter. Wrap a section
 * in it and the chapter arrives from the bottom-right: shifted 14vw
 * right with its top edge cut at a slant, both easing to rest as the
 * chapter scrolls in. Native scroll supplies the upward motion; this
 * supplies the rightward origin and the slanted leading edge — together
 * they read as panels flying in diagonally across a free canvas.
 *
 * The slant lives in a clip-path so it never repaints layout, and the
 * whole thing settles to an untransformed, unclipped block (no visual
 * difference at rest, anchors keep their positions).
 */
export function DiagonalArrival({ children }: { children: ReactNode }) {
  // Split so `useScroll` never runs under reduced motion: it binds to the
  // wrapper ref on mount and throws if that ref never attaches.
  const reduced = useHydratedReducedMotion();
  if (reduced) return <>{children}</>;
  return <ArrivalInner>{children}</ArrivalInner>;
}

function ArrivalInner({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // Finish at "start 25%" (top quarter of the viewport) rather than the
  // very top, so short final chapters still complete their arrival.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 25%"] });
  const x = useTransform(scrollYProgress, [0, 1], ["14vw", "0vw"]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    // Top edge rises toward the right — the leading corner of a panel
    // entering from the bottom-right. ~5deg at full bleed, easing flat.
    ["polygon(0 9vw, 100% 0%, 100% 100%, 0 100%)", "polygon(0 0vw, 100% 0%, 100% 100%, 0 100%)"]
  );

  return (
    <motion.div ref={ref} data-testid="diagonal-arrival" style={{ x, clipPath }}>
      {children}
    </motion.div>
  );
}
