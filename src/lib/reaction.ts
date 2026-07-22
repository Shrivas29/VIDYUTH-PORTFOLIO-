// Pure scoring + persistence for the start-lights reaction game. No React,
// no DOM assumptions beyond localStorage (guarded), so it unit-tests cleanly.

export const HUMAN_FLOOR_MS = 100;
const BEST_KEY = "v12-reaction-best";

/** Milliseconds as fixed 3-decimal seconds: 203 -> "0.203". */
export function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(3);
}

export type ReactionVerdict = {
  tooQuick: boolean;
  beatBenchmark: boolean;
  message: string;
};

export function judgeReaction(ms: number, benchmarkMs: number): ReactionVerdict {
  if (ms < HUMAN_FLOOR_MS) {
    return { tooQuick: true, beatBenchmark: false, message: "Too quick to be real. Go again." };
  }
  const beatBenchmark = ms <= benchmarkMs;
  return {
    tooQuick: false,
    beatBenchmark,
    message: beatBenchmark
      ? "Grid-ready. Faster than Vidyuth."
      : `Vidyuth: ${formatSeconds(benchmarkMs)}s. Go again.`,
  };
}

export function readBest(): number | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeBestIfBetter(ms: number): number {
  const prev = readBest();
  const best = prev === null ? ms : Math.min(prev, ms);
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch {
    /* storage unavailable (private mode) — best stays in-memory only */
  }
  return best;
}
