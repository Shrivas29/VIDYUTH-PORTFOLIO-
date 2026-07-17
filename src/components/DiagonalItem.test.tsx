import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { DiagonalItem } from "./DiagonalItem";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DiagonalItem", () => {
  it("renders children inside the entrance wrapper", () => {
    render(
      <DiagonalItem>
        <p>portrait</p>
      </DiagonalItem>
    );
    expect(screen.getByText("portrait")).toBeInTheDocument();
  });

  it("still renders children statically under prefers-reduced-motion", () => {
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
      <DiagonalItem>
        <p>static portrait</p>
      </DiagonalItem>
    );
    expect(screen.getByText("static portrait")).toBeInTheDocument();
  });
});
