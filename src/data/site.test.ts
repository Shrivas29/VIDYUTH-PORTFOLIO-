import { describe, it, expect } from "vitest";
import { results, derivedStats, driver, chapters, socials, gallery, darkChapters, reactionBenchmarkMs } from "./site";

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
    expect(driver.age).toBe(12);
    expect(driver.number).toBe(12);
    expect(driver.name).toBe("Vidyuth");
  });
  it("exports socials as an array of label/href pairs", () => {
    expect(Array.isArray(socials)).toBe(true);
    socials.forEach((s) => {
      expect(typeof s.label).toBe("string");
      expect(typeof s.href).toBe("string");
    });
  });
  it("gallery photos all have alt text and real dimensions", () => {
    expect(gallery.length).toBeGreaterThan(0);
    gallery.forEach((p) => {
      expect(p.alt.length).toBeGreaterThan(10);
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    });
  });
  it("has all ten chapters in order", () => {
    expect(chapters.map((c) => c.id)).toEqual([
      "hero", "driver", "stats", "beginnings", "road-to-f1",
      "gallery", "highlight", "reaction", "life", "contact",
    ]);
  });
});

describe("reaction registration", () => {
  it("exposes a positive benchmark in milliseconds", () => {
    expect(reactionBenchmarkMs).toBe(180);
  });

  it("registers the reaction chapter between highlight and life", () => {
    const ids = chapters.map((c) => c.id);
    expect(ids).toContain("reaction");
    expect(ids.indexOf("reaction")).toBe(ids.indexOf("highlight") + 1);
    expect(ids.indexOf("life")).toBe(ids.indexOf("reaction") + 1);
  });

  it("marks the reaction chapter as a dark (ink) section", () => {
    expect(darkChapters.has("reaction")).toBe(true);
  });
});
