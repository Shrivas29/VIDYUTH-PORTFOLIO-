"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";
import { reactionBenchmarkMs } from "@/data/site";
import { formatSeconds, judgeReaction, readBest, writeBestIfBetter } from "@/lib/reaction";

type Phase = "idle" | "arming" | "set" | "go" | "result" | "jumpstart";

const LIGHT_COUNT = 5;
const LIGHT_INTERVAL_MS = 1000;
const HOLD_MIN_MS = 200;
const HOLD_MAX_MS = 3000;

const PROMPT: Record<Phase, string> = {
  idle: "Tap to start",
  arming: "Wait for it",
  set: "Wait for it",
  go: "TAP",
  result: "Tap to race again",
  jumpstart: "Jump start. Tap to reset.",
};

/**
 * F1 start-lights reaction game. Five reds light up one by one, then all go
 * dark together (unpredictable hold) — tap the instant they vanish. Tapping
 * early during the light sequence is a jump start; the timed reaction is
 * scored against Vidyuth's benchmark and the best is kept in localStorage.
 */
export function Reaction() {
  const reduced = useHydratedReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(0);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);

  const timers = useRef<number[]>([]);
  const goAt = useRef(0);

  useEffect(() => setBest(readBest()), []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const arm = useCallback(() => {
    clearTimers();
    setTimeMs(null);
    setLit(0);
    setPhase("arming");
    for (let i = 1; i <= LIGHT_COUNT; i++) {
      timers.current.push(window.setTimeout(() => setLit(i), i * LIGHT_INTERVAL_MS));
    }
    timers.current.push(window.setTimeout(() => setPhase("set"), LIGHT_COUNT * LIGHT_INTERVAL_MS));
    const hold = HOLD_MIN_MS + Math.random() * (HOLD_MAX_MS - HOLD_MIN_MS);
    timers.current.push(
      window.setTimeout(() => {
        setLit(0);
        goAt.current = performance.now();
        setPhase("go");
      }, LIGHT_COUNT * LIGHT_INTERVAL_MS + hold)
    );
  }, [clearTimers]);

  const tap = useCallback(() => {
    if (phase === "idle" || phase === "result" || phase === "jumpstart") {
      arm();
      return;
    }
    if (phase === "arming" || phase === "set") {
      clearTimers();
      setLit(0);
      setPhase("jumpstart");
      return;
    }
    // phase === "go": measure and score
    const ms = Math.round(performance.now() - goAt.current);
    clearTimers();
    setTimeMs(ms);
    const verdict = judgeReaction(ms, reactionBenchmarkMs);
    if (!verdict.tooQuick) setBest(writeBestIfBetter(ms));
    setPhase("result");
  }, [phase, arm, clearTimers]);

  const verdict = timeMs !== null ? judgeReaction(timeMs, reactionBenchmarkMs) : null;
  const status =
    phase === "go"
      ? "Lights out. Tap now."
      : phase === "result" && timeMs !== null
        ? `${formatSeconds(timeMs)} seconds. ${verdict?.message ?? ""}`
        : phase === "jumpstart"
          ? "Jump start. Tap to reset."
          : PROMPT[phase];

  return (
    <section id="reaction" className="bg-ink px-5 py-24 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SectionMarker label="Reaction" inverted as="p" />
        <h2 className="mt-8 font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.02]">
          Lights out.
        </h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white-soft/80">
          Five reds, then green. Tap the moment they vanish. Vidyuth reacts in{" "}
          {formatSeconds(reactionBenchmarkMs)}s.
        </p>

        <button
          type="button"
          data-testid="reaction-stage"
          data-phase={phase}
          onClick={tap}
          aria-label={
            phase === "go" ? "Lights out, tap now" : phase === "idle" ? "Start the reaction test" : "Reaction test"
          }
          className="mt-10 flex w-full cursor-pointer flex-col items-center gap-8 rounded-sm border border-white-soft/15 bg-white-soft/[0.03] px-6 py-14 transition-colors duration-200 hover:border-green/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
        >
          <div className="flex gap-3 md:gap-5" aria-hidden>
            {Array.from({ length: LIGHT_COUNT }, (_, i) => {
              const on = i < lit;
              return (
                <span
                  key={i}
                  className={`h-10 w-10 rounded-full md:h-14 md:w-14 ${
                    reduced ? "" : "transition-colors duration-100"
                  } ${on ? "bg-[oklch(0.62_0.22_25)] shadow-[0_0_24px_oklch(0.62_0.22_25/0.8)]" : "bg-white-soft/10"}`}
                />
              );
            })}
          </div>

          <div
            role="status"
            aria-live="polite"
            className="min-h-[3.5rem] text-center"
            data-testid="reaction-status"
          >
            {phase === "result" && timeMs !== null ? (
              <>
                <span
                  data-testid="reaction-time"
                  className={`font-block text-[clamp(2.4rem,8vw,4.5rem)] ${
                    verdict?.beatBenchmark ? "text-green" : "text-white-soft"
                  }`}
                >
                  {formatSeconds(timeMs)}s
                </span>
                <span className="mt-2 block text-[13px] font-bold uppercase tracking-[0.08em] text-white-soft/70">
                  {verdict?.message}
                </span>
              </>
            ) : (
              <span
                className={`font-block text-[clamp(1.6rem,5vw,2.6rem)] ${
                  phase === "go" ? "text-green" : "text-white-soft/70"
                }`}
              >
                {status}
              </span>
            )}
          </div>
        </button>

        <div className="mt-8 flex items-center justify-center gap-12">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white-soft/50">Your best</p>
            <p className="font-block mt-1 text-[clamp(1.4rem,4vw,2rem)]">
              {best === null ? "--" : `${formatSeconds(best)}s`}
            </p>
          </div>
          <div className="h-10 w-px bg-white-soft/15" aria-hidden />
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">Vidyuth</p>
            <p className="font-block mt-1 text-[clamp(1.4rem,4vw,2rem)] text-green">
              {formatSeconds(reactionBenchmarkMs)}s
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
