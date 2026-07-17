"use client";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { AngleShape } from "@/components/AngleShape";

/**
 * Green angled strip straddling a light-to-dark chapter seam, drifting
 * into place as it enters view. Parent section must be `relative`; the
 * strip hangs half below the section's bottom edge.
 */
export function SeamAccent() {
  const reduced = useHydratedReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="absolute bottom-0 right-0 z-10 h-8 w-2/3 md:h-12 md:w-1/3"
      style={{ y: "50%" }}
      initial={false}
      whileInView={reduced ? undefined : { x: [-48, 0], opacity: [0, 1] }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <AngleShape className="size-full" />
    </motion.div>
  );
}
