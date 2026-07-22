import { describe, it, expect } from "vitest";
import { nodePositions, isReached, reachedCount } from "./track";

describe("nodePositions", () => {
  it("spreads N nodes evenly from 0 to 1", () => {
    expect(nodePositions(4)).toEqual([0, 1 / 3, 2 / 3, 1]);
  });
  it("handles the degenerate counts", () => {
    expect(nodePositions(1)).toEqual([0]);
    expect(nodePositions(0)).toEqual([]);
  });
});

describe("isReached / reachedCount", () => {
  it("reaches a node once progress passes its fraction", () => {
    expect(isReached(0, 0)).toBe(true); // first node always reached
    expect(isReached(1, 0.99)).toBe(false);
    expect(isReached(1, 1)).toBe(true);
  });
  it("counts reached nodes for a progress value", () => {
    const p = nodePositions(4);
    expect(reachedCount(p, 0)).toBe(1);
    expect(reachedCount(p, 0.5)).toBe(2);
    expect(reachedCount(p, 1)).toBe(4);
  });
});
