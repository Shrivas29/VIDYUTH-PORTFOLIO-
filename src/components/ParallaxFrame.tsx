"use client";
import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";

/**
 * Masked image parallax: the child drifts vertically inside an
 * overflow-hidden frame as the frame crosses the viewport, moving at a
 * different speed than the page. The child is pre-scaled just past the
 * drift range so the frame's edges never expose. Static under reduced
 * motion.
 */
export function ParallaxFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useHydratedReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className="size-full" style={reduced ? undefined : { y, scale: 1.16 }}>
        {children}
      </motion.div>
    </div>
  );
}
