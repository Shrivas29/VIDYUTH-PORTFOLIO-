import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Reaction } from "./Reaction";

const play = () => screen.getByTestId("reaction-stage");

describe("Reaction game", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts idle and prompts a start", () => {
    render(<Reaction />);
    expect(play()).toHaveAttribute("data-phase", "idle");
  });

  it("arms on click and reaches the set phase after the light sequence", () => {
    render(<Reaction />);
    fireEvent.click(play());
    expect(play()).toHaveAttribute("data-phase", "arming");
    act(() => vi.advanceTimersByTime(5000)); // five lights at 1s each
    expect(play()).toHaveAttribute("data-phase", "set");
  });

  it("treats a tap during set as a jump start and records no best", () => {
    render(<Reaction />);
    fireEvent.click(play());
    act(() => vi.advanceTimersByTime(5000));
    fireEvent.click(play());
    expect(play()).toHaveAttribute("data-phase", "jumpstart");
    expect(localStorage.getItem("v12-reaction-best")).toBeNull();
  });

  it("times a go tap, shows the seconds, and saves a legit best", () => {
    // Random hold -> deterministic 1000ms; performance.now -> a fixed delta.
    vi.spyOn(Math, "random").mockReturnValue(0); // hold = HOLD_MIN_MS (200)
    const now = vi.spyOn(performance, "now");
    render(<Reaction />);
    fireEvent.click(play());
    now.mockReturnValue(1000); // go timestamp, read inside the go-timeout callback when it fires
    act(() => vi.advanceTimersByTime(5000 + 200)); // lights + min hold -> go
    expect(play()).toHaveAttribute("data-phase", "go");

    // simulate the tap 203ms later
    now.mockReturnValue(1203);
    fireEvent.click(play());
    expect(play()).toHaveAttribute("data-phase", "result");
    expect(screen.getByTestId("reaction-time")).toHaveTextContent("0.203");
    expect(localStorage.getItem("v12-reaction-best")).toBe("203");
  });
});
