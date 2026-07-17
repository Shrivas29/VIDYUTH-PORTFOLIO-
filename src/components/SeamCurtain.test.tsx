import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { SeamCurtain } from "./SeamCurtain";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SeamCurtain", () => {
  it("renders a decorative curtain carrying the VD monogram", () => {
    render(<SeamCurtain />);
    const curtain = screen.getByTestId("seam-curtain");
    expect(curtain).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTitle("VD")).toBeInTheDocument();
  });

  it("renders the same decorative structure for the finish=\"bottom\" variant", () => {
    render(<SeamCurtain finish="bottom" />);
    expect(screen.getByTestId("seam-curtain")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTitle("VD")).toBeInTheDocument();
  });

  it("renders nothing under prefers-reduced-motion", () => {
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
    const { container } = render(<SeamCurtain />);
    expect(container.firstChild).toBeNull();
  });
});
