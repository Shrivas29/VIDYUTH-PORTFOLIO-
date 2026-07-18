import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-body" }),
}));

// Echo back the requested CSS variable so tests assert the real wiring.
vi.mock("next/font/local", () => ({
  default: (opts: { variable?: string }) => ({ variable: opts?.variable ?? "--font-local" }),
}));

// jsdom ships neither observer; framer-motion needs them for
// whileInView (IntersectionObserver) and useScroll (ResizeObserver).
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", { writable: true, value: ObserverStub });
Object.defineProperty(window, "ResizeObserver", { writable: true, value: ObserverStub });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  }),
});
