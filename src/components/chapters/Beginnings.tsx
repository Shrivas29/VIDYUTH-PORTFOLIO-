"use client";
import { motion, useReducedMotion } from "motion/react";
import { SectionMarker } from "@/components/SectionMarker";
import { TrackArrows } from "@/components/TrackArrows";
import { useDragTrack } from "@/lib/useDragTrack";
import { beginningsQuote, results, type RaceResult } from "@/data/site";

const CARD_STEP = 344; // card width 320 + gap 24

function ResultCard({ result }: { result: RaceResult }) {
  return (
    <article className="flex h-72 w-80 shrink-0 snap-start flex-col bg-white-soft/90 p-6 shadow-[0_2px_24px_rgba(0,0,22,0.08)]">
      <h3 className="border-b border-ink/60 pb-2 font-display text-2xl">{result.event}</h3>
      <p className="font-display mt-auto text-[clamp(4rem,10vw,6rem)]">P{result.finish}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.04em]">{result.category}</span>
        {result.finish <= 3 && (
          <span className="bg-green px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-ink">
            Podium
          </span>
        )}
      </div>
    </article>
  );
}

export function Beginnings() {
  const reduced = useReducedMotion();
  const { viewportRef, trackRef, x, prev, next } = useDragTrack(CARD_STEP);

  return (
    <section id="beginnings" className="bg-graph px-5 pb-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Beginnings" />
        <blockquote className="mt-10 max-w-[26ch] font-body text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-snug">
          &ldquo;{beginningsQuote}&rdquo;
        </blockquote>
        {reduced ? (
          <div className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {results.map((r) => (
              <ResultCard key={r.event} result={r} />
            ))}
          </div>
        ) : (
          <>
            <div ref={viewportRef} className="mt-12 overflow-hidden">
              <motion.div
                ref={trackRef}
                drag="x"
                dragConstraints={viewportRef}
                style={{ x }}
                whileTap={{ cursor: "grabbing" }}
                className="flex w-max cursor-grab gap-6"
              >
                {results.map((r) => (
                  <ResultCard key={r.event} result={r} />
                ))}
              </motion.div>
            </div>
            <div className="mt-8">
              <TrackArrows onPrev={prev} onNext={next} itemsLabel="results" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
