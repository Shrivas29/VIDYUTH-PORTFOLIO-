"use client";
import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Duration-based easing (easeOutExpo): each wheel tick glides out with a
    // weighted tail — the damped, premium scroll of reference-grade sites.
    // Held at 0.9s: long enough to feel smooth, short enough that a trackpad
    // flick tracks the input instead of sliding on for over a second (the
    // 1.3s tail read as floaty/laggy, especially stacked with scroll-linked
    // motion).
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });
    let raf: number;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
