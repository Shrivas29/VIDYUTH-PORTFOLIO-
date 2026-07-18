"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { Sticker12 } from "@/components/Sticker12";
import { SectionMarker } from "@/components/SectionMarker";
import { derivedStats, results } from "@/data/site";

const cardBase = "bg-white-soft/90 p-6 shadow-[0_2px_24px_rgba(0,0,22,0.08)]";

/**
 * Number that ticks up to `value` the first time it scrolls into view. SSR and
 * no-JS render the real number (never a stale 0); the count-up only kicks in
 * when the card is still below the fold at mount, so the reset to 0 happens
 * off-screen — no visible flash.
 */
function CountUp({ value, prefix = "", reduced }: { value: number; prefix?: string; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight) return; // already visible: leave the real value
    setDisplay(0);
    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const controls = animate(0, value, {
          duration: 1.1,
          ease: [0.22, 1, 0.36, 1],
          onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, reduced]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
    </span>
  );
}
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
    { label: "Podiums", num: s.podiums, prefix: "", rot: -2 },
    { label: "Events raced", num: s.events, prefix: "", rot: 1.5 },
    { label: "Best finish", num: s.bestFinish, prefix: "P", rot: -1 },
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
              whileInView={reduced ? undefined : { opacity: [0, 1], x: [48, 0], y: [32, 0], rotate: [0, c.rot] }}
              {...cardReveal}
              transition={{ ...cardReveal.transition, delay: i * 0.08 }}
            >
              <p className="border-b border-ink/60 pb-2 text-[11px] font-bold uppercase tracking-[0.04em]">
                {c.label}
              </p>
              <p className="font-block mt-3 text-[clamp(3rem,8vw,6rem)]">
                <CountUp value={c.num} prefix={c.prefix} reduced={reduced} />
              </p>
            </motion.div>
          ))}
          <motion.div
            className={`${cardBase} md:-mr-4`}
            style={reduced ? { rotate: 2 } : undefined}
            whileInView={reduced ? undefined : { opacity: [0, 1], x: [48, 0], y: [32, 0], rotate: [0, 2] }}
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
            whileInView={reduced ? undefined : { opacity: [0, 1], x: [48, 0], y: [32, 0], rotate: [0, -1.5] }}
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
