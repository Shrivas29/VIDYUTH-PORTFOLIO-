import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { DiagonalArrival } from "./DiagonalArrival";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DiagonalArrival", () => {
  it("wraps children in a scrubbed arrival container", () => {
    render(
      <DiagonalArrival>
        <p>chapter content</p>
      </DiagonalArrival>
    );
    expect(screen.getByText("chapter content")).toBeInTheDocument();
    expect(screen.getByTestId("diagonal-arrival")).toBeInTheDocument();
  });

  it("renders children without any wrapper under prefers-reduced-motion", () => {
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
    render(
      <DiagonalArrival>
        <p>static content</p>
      </DiagonalArrival>
    );
    expect(screen.getByText("static content")).toBeInTheDocument();
    expect(screen.queryByTestId("diagonal-arrival")).toBeNull();
  });
});
