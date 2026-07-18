"use client";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { creed } from "@/data/site";

/** Full-width quote band — his own words, standing alone. */
export function Creed() {
  const reduced = useHydratedReducedMotion();
  return (
    <section className="bg-ink px-5 py-28 text-white-soft md:px-12 lg:px-20">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={false}
        whileInView={reduced ? undefined : { opacity: [0, 1], y: [28, 0] }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <blockquote className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-[1.05]">
          &ldquo;{creed}&rdquo;
        </blockquote>
        <footer className="mt-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.06em] text-white-soft/60">
          <span className="h-px w-10 bg-green" aria-hidden />
          Vidyuth Nº12
        </footer>
      </motion.div>
    </section>
  );
}
