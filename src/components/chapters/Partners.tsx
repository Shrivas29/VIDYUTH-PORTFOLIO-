"use client";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SeamCurtain } from "@/components/SeamCurtain";
import { SectionMarker } from "@/components/SectionMarker";
import { RevealHeading } from "@/components/RevealHeading";

const logoSlots = ["Season partner", "Race-day partner", "Kit partner"];

export function Partners() {
  const reduced = useHydratedReducedMotion();
  return (
    <section id="partners" className="relative bg-graph px-5 py-24 md:px-12 lg:px-20">
      <SeamCurtain />
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Partners" as="p" />
        <RevealHeading wrapClassName="mt-10" className="font-display text-[clamp(2.5rem,7vw,5.5rem)]">
          Partner with Vidyuth
        </RevealHeading>
        <p className="mt-6 max-w-[55ch] text-[15px] leading-relaxed">
          Your brand on a rising driver&rsquo;s kart, suit, and story. Season sponsorships and
          single-race packages.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {logoSlots.map((slot, i) => (
            <motion.div
              key={slot}
              className="flex h-36 flex-col items-center justify-center gap-2 border border-dashed border-ink/50"
              initial={false}
              whileInView={reduced ? undefined : { opacity: [0, 1], x: [-28, 0], y: [28, 0] }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-block text-xl text-ink/70">Your logo here</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-ink/70">{slot}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={false}
          whileInView={reduced ? undefined : { opacity: [0, 1], y: [24, 0] }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="#contact"
            className="mt-12 inline-flex min-h-11 cursor-pointer items-center bg-green px-8 py-3 text-sm font-extrabold uppercase tracking-[0.04em] text-ink transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            style={{ clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 100%)" }}
          >
            Start the conversation
          </a>
        </motion.div>
      </div>
    </section>
  );
}
