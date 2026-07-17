"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SectionMarker } from "@/components/SectionMarker";
import { lifeCards } from "@/data/site";

export function Life() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section id="life" className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Life as a Driver" inverted />
        <div className="mt-12 flex flex-col">
          {lifeCards.map((card, i) => {
            const open = openIndex === i;
            return (
              <div key={card.title} className="border-t border-white-soft/20 last:border-b">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`life-panel-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
                >
                  <span className="size-2 shrink-0 rounded-full bg-green" aria-hidden />
                  <span className="font-display text-[clamp(1.8rem,5vw,3rem)]">{card.title}</span>
                  <motion.span
                    className="ml-auto font-body text-2xl font-medium text-white-soft/60"
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`life-panel-${i}`}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[55ch] pb-8 pl-6 text-[15px] leading-relaxed text-white-soft/85">
                        {card.text}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
