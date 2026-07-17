"use client";
import { ReactNode } from "react";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";

/**
 * Display h2 that rises out of a mask when scrolled into view.
 * SSR markup stays fully visible (initial={false} + keyframes).
 */
export function RevealHeading({
  children,
  className = "",
  wrapClassName = "",
}: {
  children: ReactNode;
  className?: string;
  /** Spacing goes on the mask wrapper so the mask hugs the text. */
  wrapClassName?: string;
}) {
  const reduced = useHydratedReducedMotion();
  return (
    <div className={`overflow-hidden ${wrapClassName}`}>
      <motion.h2
        className={className}
        initial={false}
        whileInView={reduced ? undefined : { y: ["70%", "0%"], opacity: [0, 1] }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.h2>
    </div>
  );
}
