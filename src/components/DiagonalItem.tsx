"use client";
import { ReactNode } from "react";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";

/**
 * In-view entrance along the site's diagonal vector: the wrapped element
 * slides up-left into place from the bottom-right as it scrolls into
 * view. For static (server) chapter content; client chapters put the
 * same keyframes on their own motion elements.
 * SSR markup stays fully visible (initial={false} + keyframes).
 */
export function DiagonalItem({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useHydratedReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? undefined : { opacity: [0, 1], x: [56, 0], y: [36, 0] }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
