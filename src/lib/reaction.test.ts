import { describe, it, expect, beforeEach } from "vitest";
import {
  HUMAN_FLOOR_MS,
  formatSeconds,
  judgeReaction,
  readBest,
  writeBestIfBetter,
} from "./reaction";

describe("formatSeconds", () => {
  it("renders milliseconds as fixed 3-decimal seconds", () => {
    expect(formatSeconds(203)).toBe("0.203");
    expect(formatSeconds(180)).toBe("0.180");
    expect(formatSeconds(1000)).toBe("1.000");
  });
});

describe("judgeReaction", () => {
  it("flags implausibly fast taps and does not count them as a win", () => {
    const v = judgeReaction(HUMAN_FLOOR_MS - 1, 180);
    expect(v.tooQuick).toBe(true);
    expect(v.beatBenchmark).toBe(false);
    expect(v.message).toBe("Too quick to be real. Go again.");
  });

  it("celebrates a time at or under the benchmark", () => {
    const v = judgeReaction(180, 180);
    expect(v.tooQuick).toBe(false);
    expect(v.beatBenchmark).toBe(true);
    expect(v.message).toBe("Grid-ready. Faster than Vidyuth.");
  });

  it("shows the benchmark to beat when slower", () => {
    const v = judgeReaction(250, 180);
    expect(v.beatBenchmark).toBe(false);
    expect(v.message).toBe("Vidyuth: 0.180s. Go again.");
  });
});

describe("best-time persistence", () => {
  beforeEach(() => localStorage.clear());

  it("returns null with nothing stored", () => {
    expect(readBest()).toBeNull();
  });

  it("stores the first time, then only keeps a faster one", () => {
    expect(writeBestIfBetter(300)).toBe(300);
    expect(readBest()).toBe(300);
    expect(writeBestIfBetter(250)).toBe(250);
    expect(writeBestIfBetter(400)).toBe(250);
    expect(readBest()).toBe(250);
  });

  it("ignores a corrupt stored value", () => {
    localStorage.setItem("v12-reaction-best", "not-a-number");
    expect(readBest()).toBeNull();
  });
});
