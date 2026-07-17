"use client";
import { RefObject } from "react";
import { useScroll, useTransform } from "motion/react";

/**
 * The incoming-chapter "window": a dark section first pokes into view as
 * a small rounded inset box, then grows to full bleed by the time its
 * top nears the viewport top. Scroll-linked clip-path only — no pins, no
 * layout change, and content padding always exceeds the 5% inset so
 * nothing is ever clipped (including the no-JS state, which just renders
 * a designed rounded card).
 */
export function useBoxReveal(ref: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 30%"] });
  return useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(5% 5% 5% 5% round 24px)", "inset(0% 0% 0% 0% round 0px)"]
  );
}
