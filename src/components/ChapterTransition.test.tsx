import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MotionGlobalConfig } from "motion/react";
import { ChapterTransition } from "./ChapterTransition";

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

function Page() {
  return (
    <>
      <ChapterTransition />
      <a href="#stats">Stats</a>
      <div id="stats" />
    </>
  );
}

describe("ChapterTransition", () => {
  beforeEach(() => {
    MotionGlobalConfig.skipAnimations = true;
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    MotionGlobalConfig.skipAnimations = false;
    window.history.replaceState(null, "", "/");
  });

  it("intercepts chapter-anchor clicks, covers, and jumps under the cover", async () => {
    render(<Page />);
    const panel = screen.getByTestId("chapter-transition");
    expect(panel).toHaveAttribute("data-phase", "idle");

    fireEvent.click(screen.getByText("Stats"));
    expect(panel).toHaveAttribute("data-phase", "cover");

    // skipAnimations completes the cover on the next frames; the jump and
    // hash update happen at cover-complete.
    let jumped = false;
    for (let i = 0; i < 12 && !jumped; i++) {
      await act(async () => {
        await nextFrame();
      });
      jumped = (Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.calls.length > 0;
    }
    expect(jumped).toBe(true);
    expect(window.location.hash).toBe("#stats");
  });

  it("leaves clicks alone under prefers-reduced-motion", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((q: string) => ({
      matches: q.includes("prefers-reduced-motion"),
      media: q,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false;
      },
    }) as MediaQueryList);
    render(<Page />);
    expect(screen.queryByTestId("chapter-transition")).toBeNull();
    const clicked = fireEvent.click(screen.getByText("Stats"));
    // fireEvent returns false when preventDefault was called — it must not be.
    expect(clicked).toBe(true);
  });
});
