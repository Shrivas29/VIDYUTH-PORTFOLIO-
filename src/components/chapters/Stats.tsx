"use client";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { Sticker12 } from "@/components/Sticker12";
import { SectionMarker } from "@/components/SectionMarker";
import { derivedStats, results } from "@/data/site";

const cardBase = "bg-white-soft/90 p-6 shadow-[0_2px_24px_rgba(0,0,22,0.08)]";
// initial={false} keeps SSR markup fully visible (content never gated on
// animation); the keyframe arrays still animate 0 -> 1 when the card
// scrolls into view.
const cardReveal = {
  initial: false as const,
  viewport: { once: true, margin: "-15%" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function Stats() {
  const s = derivedStats(results);
  const reduced = useHydratedReducedMotion();
  const cards = [
    { label: "Podiums", value: String(s.podiums), rot: -2 },
    { label: "Events raced", value: String(s.events), rot: 1.5 },
    { label: "Best finish", value: `P${s.bestFinish}`, rot: -1 },
  ];
  return (
    <section id="stats" className="bg-graph px-5 pb-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Stats" />
        <div className="mt-12 flex flex-wrap items-start gap-6 md:gap-0">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              className={`${cardBase} md:-mr-4 md:w-64`}
              style={reduced ? { rotate: c.rot } : undefined}
              whileInView={reduced ? undefined : { opacity: [0, 1], x: [-28, 0], y: [28, 0], rotate: [0, c.rot] }}
              {...cardReveal}
              transition={{ ...cardReveal.transition, delay: i * 0.08 }}
            >
              <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">
                {c.label}
              </p>
              <p className="font-display mt-3 text-[clamp(3rem,8vw,6rem)]">{c.value}</p>
            </motion.div>
          ))}
          <motion.div
            className={`${cardBase} md:-mr-4`}
            style={reduced ? { rotate: 2 } : undefined}
            whileInView={reduced ? undefined : { opacity: [0, 1], x: [-28, 0], y: [28, 0], rotate: [0, 2] }}
            {...cardReveal}
            transition={{ ...cardReveal.transition, delay: 0.24 }}
          >
            <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">
              Number
            </p>
            <Sticker12 />
          </motion.div>
          <motion.div
            className={cardBase}
            style={reduced ? { rotate: -1.5 } : undefined}
            whileInView={reduced ? undefined : { opacity: [0, 1], x: [-28, 0], y: [28, 0], rotate: [0, -1.5] }}
            {...cardReveal}
            transition={{ ...cardReveal.transition, delay: 0.32 }}
          >
            <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">
              Racing in
            </p>
            <p className="mt-3 max-w-[18ch] text-sm font-bold">
              4-stroke karting · IAME Series India
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
