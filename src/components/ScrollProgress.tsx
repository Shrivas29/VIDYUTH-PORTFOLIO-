"use client";
import { motion, useScroll, useSpring } from "motion/react";

/**
 * Hairline racing-green bar pinned to the very top edge, scaling with page
 * scroll — a quiet echo of the hero's Karting → Formula 1 rail. Spring-damped
 * so it eases rather than tracking every jitter. Sits below the menu so an
 * open dropdown covers it, but above page content.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 h-0.5 w-full origin-left bg-green"
      style={{ scaleX, zIndex: 45 }}
    />
  );
}
