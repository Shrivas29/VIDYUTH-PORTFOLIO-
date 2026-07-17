"use client";
import { motion, useReducedMotion } from "motion/react";
import { Sticker12 } from "@/components/Sticker12";
import { SectionMarker } from "@/components/SectionMarker";
import { derivedStats, results } from "@/data/site";

const cardBase = "bg-white-soft/90 p-6 shadow-[0_2px_24px_rgba(0,0,22,0.08)]";
const cardReveal = {
  viewport: { once: true, margin: "-15%" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function Stats() {
  const s = derivedStats(results);
  const reduced = useReducedMotion();
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
              initial={reduced ? false : { opacity: 0, y: 24, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: c.rot }}
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
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0, rotate: 2 }}
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
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
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
