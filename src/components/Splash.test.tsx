import { StrictMode } from "react";
import { render, screen, cleanup, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MotionGlobalConfig } from "motion/react";
import { Splash, splashWasShownThisLoad } from "./Splash";

/** Resolves on the next real animation frame. */
function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

describe("Splash", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => cleanup());

  it("renders on first visit", () => {
    render(<Splash />);
    expect(screen.getByTestId("splash")).toBeInTheDocument();
  });

  it("does not render when session flag set", () => {
    sessionStorage.setItem("v12-splash", "1");
    render(<Splash />);
    expect(screen.queryByTestId("splash")).toBeNull();
  });

  it("is hidden from assistive tech (decorative transient chrome)", () => {
    render(<Splash />);
    expect(screen.getByTestId("splash")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Splash auto-hide timing", () => {
  beforeEach(() => {
    sessionStorage.clear();
    // The exit transition's completion is driven by motion's rAF-based frame
    // loop, which jsdom doesn't tick forward under vi.advanceTimersByTime.
    // skipAnimations makes the exit apply its final keyframe on the next
    // real animation frame instead of over the full 600ms transition, so a
    // handful of polled real frames (see nextFrame()) is enough to observe
    // completion without a slow, flaky multi-second real wait.
    MotionGlobalConfig.skipAnimations = true;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    MotionGlobalConfig.skipAnimations = false;
  });

  it("shows on mount and unmounts once the ~2600ms display window elapses", async () => {
    // Only fake the timer APIs the component itself calls (setTimeout);
    // leave requestAnimationFrame on its real implementation so motion's
    // frame loop can still tick and finish the exit animation below.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(<Splash />);
    expect(screen.getByTestId("splash")).toBeInTheDocument();

    // Not yet at the display duration: still showing.
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("splash")).toBeInTheDocument();

    // Past the display duration: the hide timer has fired.
    act(() => vi.advanceTimersByTime(700));

    let hidden = false;
    for (let i = 0; i < 10 && !hidden; i++) {
      await act(async () => {
        await nextFrame();
      });
      hidden = screen.queryByTestId("splash") === null;
    }
    expect(hidden).toBe(true);
  });
});

describe("Splash under React StrictMode", () => {
  beforeEach(() => {
    sessionStorage.clear();
    MotionGlobalConfig.skipAnimations = true;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    MotionGlobalConfig.skipAnimations = false;
  });

  // Regression test for the dev-mode double-invoke bug: StrictMode runs the
  // mount effect twice (setup -> cleanup -> setup again). Without the
  // useRef guard in Splash, the first invocation wrote the sessionStorage
  // flag and the second invocation would see it already set and hide the
  // splash immediately, so it never showed at all under `next dev`. This
  // test fails on the unguarded implementation (verified by reverting the
  // fix locally) and passes with it.
  it("still shows on a fresh mount, sets the session flag once, and auto-hides", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    render(
      <StrictMode>
        <Splash />
      </StrictMode>
    );

    expect(screen.getByTestId("splash")).toBeInTheDocument();
    expect(splashWasShownThisLoad()).toBe(true);
    expect(sessionStorage.getItem("v12-splash")).toBe("1");

    act(() => vi.advanceTimersByTime(2700));

    let hidden = false;
    for (let i = 0; i < 10 && !hidden; i++) {
      await act(async () => {
        await nextFrame();
      });
      hidden = screen.queryByTestId("splash") === null;
    }
    expect(hidden).toBe(true);
  });
});

describe("splashWasShownThisLoad", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => cleanup());

  it("is true after a mount that shows the splash", () => {
    render(<Splash />);
    expect(splashWasShownThisLoad()).toBe(true);
  });

  it("is false after a mount that skips the splash (session flag already set)", () => {
    sessionStorage.setItem("v12-splash", "1");
    render(<Splash />);
    expect(splashWasShownThisLoad()).toBe(false);
  });
});
