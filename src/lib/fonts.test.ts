import { describe, it, expect } from "vitest";
import { display, body } from "./fonts";

describe("fonts", () => {
  it("exposes CSS variables for both families", () => {
    expect(display.variable).toBe("--font-display");
    expect(body.variable).toBe("--font-body");
  });
});
