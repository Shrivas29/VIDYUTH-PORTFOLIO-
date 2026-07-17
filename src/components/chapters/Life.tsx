"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBoxReveal } from "@/lib/useBoxReveal";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { lifeCards } from "@/data/site";

export function Life() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduced = useHydratedReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const clipPath = useBoxReveal(ref);

  return (
    <motion.section
      id="life"
      ref={ref}
      className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20"
      style={reduced ? undefined : { clipPath }}
    >
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Life as a Driver" inverted />
        <div className="mt-12 flex flex-col">
          {lifeCards.map((card, i) => {
            const open = openIndex === i;
            return (
              <motion.div
                key={card.title}
                className="border-t border-white-soft/20 last:border-b"
                initial={false}
                whileInView={reduced ? undefined : { opacity: [0, 1], x: [-28, 0], y: [20, 0] }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`life-panel-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
                >
                  <span className="size-2 shrink-0 rounded-full bg-green" aria-hidden />
                  <span className="font-block text-[clamp(1.8rem,5vw,3rem)]">{card.title}</span>
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
