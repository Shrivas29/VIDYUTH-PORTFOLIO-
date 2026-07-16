import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Splash, splashWasShownThisLoad } from "./Splash";

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
