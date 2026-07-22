"use client";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { RevealHeading } from "@/components/RevealHeading";
import { roadToF1 } from "@/data/site";
import { nodePositions, reachedCount } from "@/lib/track";

// Subtle S-curve in a 100 x 1000 user space (stretched to the rail with
// preserveAspectRatio="none"; a stroked line reads fine under the stretch).
const RAIL_PATH = "M50 0 C 18 250, 82 420, 50 620 S 18 880, 50 1000";
const ease = [0.22, 1, 0.36, 1] as const;

export function RoadToF1() {
  const reduced = useHydratedReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const positions = nodePositions(roadToF1.length);
  const currentIndex = Math.max(0, roadToF1.findIndex((s) => s.current));

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 60%"],
  });

  // Draw the line, glide the marker, sway it toward the curve.
  const dashoffset = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const markerTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const markerX = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, -14, 14, 0]);

  // Node activation needs to read progress in render, so mirror it into state.
  const [reached, setReached] = useState(reduced ? currentIndex + 1 : 1);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    setReached(reachedCount(positions, p));
  });

  const staticFrac = positions[currentIndex] ?? 0;
  const litCount = reduced ? currentIndex + 1 : reached;

  return (
    <section ref={sectionRef} id="road-to-f1" className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Road to F1" inverted as="p" />
        <RevealHeading wrapClassName="mt-10" className="font-display text-[clamp(3rem,9vw,7.5rem)]">
          Road to F1
        </RevealHeading>

        <div className="mt-16 grid grid-cols-[44px_minmax(0,1fr)] gap-4 md:grid-cols-[64px_minmax(0,1fr)] md:gap-8">
          {/* Rail */}
          <div className="relative">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={RAIL_PATH} fill="none" stroke="oklch(0.95 0 0 / 0.14)" strokeWidth={3} />
              <motion.path
                d={RAIL_PATH}
                fill="none"
                stroke="var(--color-green)"
                strokeWidth={4}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={reduced ? 0 : dashoffset}
              />
            </svg>

            {/* Stage nodes */}
            {positions.map((frac, i) => {
              const lit = i < litCount;
              return (
                <span
                  key={i}
                  aria-hidden
                  className={`absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${
                    lit ? "border-green bg-green" : "border-white-soft/30 bg-ink"
                  }`}
                  style={{ top: `${frac * 100}%` }}
                />
              );
            })}

            {/* Kart marker */}
            <motion.span
              data-testid="track-marker"
              aria-hidden
              className="absolute left-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-green text-[9px] font-extrabold text-ink shadow-[0_0_18px_var(--color-green)]"
              style={
                reduced
                  ? { top: `${staticFrac * 100}%` }
                  : { top: markerTop, x: markerX }
              }
            >
              12
            </motion.span>
          </div>

          {/* Stages */}
          <ol className="flex min-w-0 flex-col">
            {roadToF1.map((stage, i) => (
              <motion.li
                key={stage.stage}
                className="grid grid-cols-1 gap-3 border-t border-white-soft/20 py-8 first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8"
                initial={false}
                whileInView={reduced ? undefined : { opacity: [0, 1], x: [36, 0], y: [20, 0] }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className={`font-block text-[clamp(1.5rem,4vw,2.5rem)] ${stage.current ? "text-green" : ""}`}>
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
      </div>
    </section>
  );
}
