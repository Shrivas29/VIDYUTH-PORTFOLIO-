import { renderToString } from "react-dom/server";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import { driver } from "@/data/site";

// Hero must never gate its headline's *content* on client JS running, so the
// SSR/first-paint test below renders the real component with the real
// `motion/react` module (renderToString never runs effects, so the
// animated path is never reached there regardless).
//
// The wiring tests further down need to inspect the delay actually handed
// to the entrance animation without driving framer-motion's real WAAPI
// timeline through jsdom, so `motion.span` is swapped for a plain `<span>`
// that surfaces `transition.delay` as a `data-delay` attribute. The rest
// of the `motion` namespace (div/p for the parallax wrappers) stays real.
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  const SpanMock = ({
    children,
    className,
    transition,
  }: {
    children?: React.ReactNode;
    className?: string;
    transition?: { delay?: number };
  }) => (
    <span className={className} data-testid="word" data-delay={transition?.delay}>
      {children}
    </span>
  );
  // `motion` is a Proxy that materializes components on demand, so spreading
  // it loses everything — delegate instead, overriding only `span`.
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get(target, prop) {
        if (prop === "span") return SpanMock;
        return Reflect.get(target, prop);
      },
    }),
  };
});

vi.mock("@/components/Splash", () => ({
  splashWasShownThisLoad: vi.fn(() => false),
}));

import { Hero, headlineDelayBase } from "./Hero";
import { splashWasShownThisLoad } from "@/components/Splash";

describe("Hero SSR / first paint", () => {
  it("renders the headline words as plain, visible spans with no inline opacity or transform", () => {
    const html = renderToString(<Hero />);

    // Finding 1's exact regression check: an unconditional inline
    // `opacity:0` in the SSR HTML would leave the headline permanently
    // invisible if client JS never ran.
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("opacity: 0");

    const container = document.createElement("div");
    container.innerHTML = html;

    const h1 = container.querySelector("h1");
    expect(h1?.textContent?.replace(/ /g, " ").trim()).toBe(driver.headline);

    const words = driver.headline.split(" ");
    const spans = container.querySelectorAll("h1 span");
    expect(spans).toHaveLength(words.length);
    spans.forEach((span, i) => {
      expect(span.textContent?.replace(/ /g, "").trim()).toBe(words[i]);
      // No inline style at all pre-hydration — content is never gated on
      // an animation's pre-start state.
      expect(span.getAttribute("style")).toBeNull();
    });
  });
});

describe("headlineDelayBase", () => {
  it("returns the 2.7s post-splash delay when the splash was shown this load", () => {
    expect(headlineDelayBase(true)).toBe(2.7);
  });

  it("returns the 0.3s short delay otherwise", () => {
    expect(headlineDelayBase(false)).toBe(0.3);
  });
});

describe("Hero headline entrance wiring", () => {
  afterEach(() => {
    cleanup();
    vi.mocked(splashWasShownThisLoad).mockReset().mockReturnValue(false);
  });

  it("schedules the entrance at the 2.7s post-splash delay (+ stagger) when the splash was shown this load", () => {
    vi.mocked(splashWasShownThisLoad).mockReturnValue(true);
    render(<Hero />);

    const words = screen.getAllByTestId("word");
    expect(words[0]).toHaveAttribute("data-delay", "2.7");
    expect(words[1]).toHaveAttribute("data-delay", String(2.7 + 0.12));
    expect(words[2]).toHaveAttribute("data-delay", String(2.7 + 2 * 0.12));
  });

  it("schedules the entrance at the 0.3s short delay (+ stagger) otherwise", () => {
    vi.mocked(splashWasShownThisLoad).mockReturnValue(false);
    render(<Hero />);

    const words = screen.getAllByTestId("word");
    expect(words[0]).toHaveAttribute("data-delay", "0.3");
    expect(words[1]).toHaveAttribute("data-delay", String(0.3 + 0.12));
    expect(words[2]).toHaveAttribute("data-delay", String(0.3 + 2 * 0.12));
  });
});
