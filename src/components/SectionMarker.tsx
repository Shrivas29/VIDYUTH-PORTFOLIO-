"use client";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";

const ease = [0.22, 1, 0.36, 1] as const;

export function SectionMarker({
  label,
  inverted = false,
  as: Tag = "h2",
}: {
  label: string;
  inverted?: boolean;
  /** "p" for sections that carry their own display h2, keeping one h2 per chapter. */
  as?: "h2" | "p";
}) {
  const reduced = useHydratedReducedMotion();
  // Tailwind extracts class names statically, so both palettes are spelled out.
  const rule = inverted ? "bg-white-soft/80" : "bg-ink/80";
  const dot = inverted ? "bg-white-soft" : "bg-ink";
  const text = inverted ? "text-white-soft" : "text-ink";
  const MotionTag = Tag === "h2" ? motion.h2 : motion.p;
  return (
    <div className="flex flex-col gap-2">
      <motion.div
        className={`h-px w-full max-w-xs origin-left ${rule}`}
        aria-hidden
        initial={false}
        whileInView={reduced ? undefined : { scaleX: [0, 1] }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.7, ease }}
      />
      <div className="flex items-center gap-3">
        <motion.span
          className={`size-1.5 rounded-full ${dot}`}
          aria-hidden
          initial={false}
          whileInView={reduced ? undefined : { scale: [0, 1] }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.4, delay: 0.25, ease }}
        />
        <MotionTag
          className={`text-xs font-bold uppercase tracking-[0.04em] ${text}`}
          initial={false}
          whileInView={reduced ? undefined : { opacity: [0, 1], x: [-10, 0] }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.3, ease }}
        >
          {label}
        </MotionTag>
      </div>
    </div>
  );
}
