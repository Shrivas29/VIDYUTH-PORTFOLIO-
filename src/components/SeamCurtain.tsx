"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { Monogram } from "@/components/Monogram";

/**
 * Scroll-scrubbed curtain over a chapter seam. Drop it in as the first
 * child of a `relative` section: an ink panel with a green leading edge
 * covers the section's entrance as it scrolls in, then lifts away at
 * ~2x scroll speed, flashing the VD mark at the break.
 *
 * The scrub targets the curtain's own outer element — it sits at the
 * section's top, so its start edge tracks the seam exactly and the
 * component needs no target prop. The `overflow-hidden` outer clips the
 * lift, so the panel never slides over the outgoing chapter above the
 * seam; `max-h-full` keeps it from spilling past a host shorter than a
 * viewport (which would stretch the page's scroll area).
 *
 * `finish` picks when the lift completes. `"top"` (default): when the
 * section's top reaches the viewport top — right for chapters at least
 * a viewport tall. `"bottom"`: when the section's bottom meets the
 * viewport bottom — required for hosts whose top can never reach the
 * viewport top (the footer, or any chapter without a viewport's worth
 * of content after it), where the default scrub would stall part-lifted.
 */
export function SeamCurtain({ finish = "top" }: { finish?: "top" | "bottom" }) {
  // Split so `useScroll` never runs under reduced motion: it binds to the
  // outer ref on mount and throws if that ref never attaches (which is
  // exactly what a `return null` before the JSX would cause).
  const reduced = useHydratedReducedMotion();
  if (reduced) return null;
  return <CurtainInner finish={finish} />;
}

function CurtainInner({ finish }: { finish: "top" | "bottom" }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", finish === "top" ? "start start" : "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  return (
    <div
      ref={ref}
      data-testid="seam-curtain"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 h-svh max-h-full overflow-hidden"
    >
      <motion.div className="grid size-full place-items-center bg-ink" style={{ y }}>
        <Monogram inverted />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-green" />
      </motion.div>
    </div>
  );
}
