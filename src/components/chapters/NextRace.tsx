"use client";
import { useEffect, useState } from "react";
import { nextRace } from "@/data/site";

type Left = { done: boolean; days: number; hours: number; mins: number; secs: number };

function timeLeft(target: number): Left {
  const d = Math.max(0, target - Date.now());
  return {
    done: d === 0,
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    mins: Math.floor((d % 3600000) / 60000),
    secs: Math.floor((d % 60000) / 1000),
  };
}

function Unit({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-block text-[clamp(2rem,6vw,3.5rem)] tabular-nums text-white-soft">
        {value === null ? "--" : String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white-soft/70">{label}</span>
    </div>
  );
}

/**
 * Slim countdown to the next race. Values render as placeholders on the server
 * and start ticking after mount, so there is no hydration mismatch.
 */
export function NextRace() {
  const target = new Date(nextRace.date).getTime();
  const [left, setLeft] = useState<Left | null>(null);

  useEffect(() => {
    const tick = () => setLeft(timeLeft(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <section id="next-race" className="bg-ink px-5 py-14 text-white-soft md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green" aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-green">Next race</span>
          </div>
          <p className="mt-3 font-display text-[clamp(1.4rem,3vw,2.2rem)] leading-tight">{nextRace.event}</p>
          <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.04em] text-white-soft/60">{nextRace.venue}</p>
        </div>
        {left?.done ? (
          <p className="font-block text-[clamp(1.6rem,5vw,2.6rem)] text-green">Race weekend is here</p>
        ) : (
          <div className="flex gap-6 md:gap-8" role="timer" aria-label="Countdown to next race">
            <Unit value={left?.days ?? null} label="Days" />
            <Unit value={left?.hours ?? null} label="Hrs" />
            <Unit value={left?.mins ?? null} label="Min" />
            <Unit value={left?.secs ?? null} label="Sec" />
          </div>
        )}
      </div>
    </section>
  );
}
