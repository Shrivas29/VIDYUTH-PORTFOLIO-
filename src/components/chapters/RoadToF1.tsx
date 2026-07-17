"use client";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { roadToF1 } from "@/data/site";

export function RoadToF1() {
  const reduced = useHydratedReducedMotion();
  return (
    <section id="road-to-f1" className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Road to F1" inverted as="p" />
        <h2 className="font-display mt-10 text-[clamp(3rem,9vw,7.5rem)]">Road to F1</h2>
        <ol className="mt-16 flex flex-col">
          {roadToF1.map((stage, i) => (
            <motion.li
              key={stage.stage}
              className="grid gap-3 border-t border-white-soft/20 py-8 md:grid-cols-[80px_1fr_1fr] md:gap-8"
              initial={false}
              whileInView={reduced ? undefined : { opacity: [0, 1], x: [-32, 0] }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-display text-xl text-white-soft/50" aria-hidden>
                0{i + 1}
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <h3 className={`font-display text-[clamp(1.8rem,4vw,2.5rem)] ${stage.current ? "text-green" : ""}`}>
                  {stage.stage}
                </h3>
                {stage.current && (
                  <span className="bg-green px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-ink">
                    Now
                  </span>
                )}
              </div>
              <p className="max-w-[55ch] text-[15px] leading-relaxed text-white-soft/85 md:self-center">
                {stage.detail}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
