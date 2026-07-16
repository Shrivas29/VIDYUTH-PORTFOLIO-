import { describe, it, expect } from "vitest";
import { results, derivedStats, driver, chapters } from "./site";

describe("results data", () => {
  it("contains exactly the five confirmed races", () => {
    expect(results).toHaveLength(5);
    expect(results.map((r) => r.finish)).toEqual([3, 2, 3, 4, 6]);
  });
  it("derives 3 podiums, 5 events, best P2", () => {
    const s = derivedStats(results);
    expect(s).toEqual({ podiums: 3, events: 5, bestFinish: 2 });
  });
  it("labels IAME results in category", () => {
    const iame = results.filter((r) => r.event.startsWith("IAME"));
    expect(iame).toHaveLength(2);
    iame.forEach((r) => expect(r.category).toBe("IAME (in category)"));
  });
  it("driver facts match client-confirmed data", () => {
    expect(driver.age).toBe(11);
    expect(driver.number).toBe(12);
    expect(driver.name).toBe("Vidyuth");
  });
  it("has all ten chapters in order", () => {
    expect(chapters.map((c) => c.id)).toEqual([
      "hero", "driver", "stats", "beginnings", "road-to-f1",
      "quote", "gallery", "life", "partners", "contact",
    ]);
  });
});
