import { describe, it, expect } from "vitest";
import { panchang } from "./fonts";

describe("fonts", () => {
  it("exposes the Panchang variable-font CSS variable", () => {
    expect(panchang.variable).toBe("--font-panchang");
  });
});
