"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { Monogram } from "@/components/Monogram";

type Phase = "idle" | "cover" | "leave";

const sweep = [0.76, 0, 0.24, 1] as const;

const variants = {
  idle: { y: "130%", transition: { duration: 0 } },
  cover: { y: "0%", transition: { duration: 0.5, ease: sweep } },
  leave: { y: "-130%", transition: { duration: 0.55, ease: sweep } },
};

/**
 * Full-screen chapter-jump transition. Clicking any in-page chapter link
 * sweeps a slanted ink panel up from the bottom of the viewport (green
 * strips on both edges, VD mark centered), performs the jump instantly
 * while covered, then the panel continues off through the top. The
 * diagonal edge comes from the same skew language as SeamCurtain.
 *
 * Interception happens in the bubble phase at the document root, after
 * the header's own handlers (menu close) have run, and stops the event
 * there so Lenis's anchor glide never starts underneath. Under reduced
 * motion nothing is intercepted and the overlay renders nothing — native
 * hash jumps apply.
 */
export function ChapterTransition() {
  const reduced = useHydratedReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const targetRef = useRef<string | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (reduced) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest?.('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      // Registered after the header's close handlers (child effects run
      // first), so stopping here silences only Lenis's later anchor hook.
      e.stopImmediatePropagation();
      if (phaseRef.current !== "idle") return; // mid-flight: swallow, don't restart
      targetRef.current = id;
      setPhase("cover");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reduced]);

  if (reduced) return null;

  const onComplete = (def: string) => {
    if (def === "cover") {
      const el = targetRef.current ? document.getElementById(targetRef.current) : null;
      if (el) {
        el.scrollIntoView({ behavior: "instant" });
        history.replaceState(null, "", `#${targetRef.current}`);
      }
      setTimeout(() => setPhase("leave"), 140);
    } else if (def === "leave") {
      setPhase("idle");
    }
  };

  return (
    <div
      data-testid="chapter-transition"
      data-phase={phase}
      aria-hidden="true"
      className={`fixed inset-0 overflow-hidden ${phase === "idle" ? "pointer-events-none" : ""}`}
      style={{ zIndex: "var(--z-transition)" }}
    >
      {/* Bleed + skew as in SeamCurtain: slanted edges never expose corners. */}
      <motion.div
        className="absolute inset-x-0 -inset-y-24 grid place-items-center bg-ink"
        style={{ skewY: -4 }}
        variants={variants}
        initial="idle"
        animate={phase}
        onAnimationComplete={onComplete}
      >
        <div className="scale-150">
          <Monogram inverted />
        </div>
        <div className="absolute inset-x-0 top-0 h-1.5 bg-green" />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-green" />
      </motion.div>
    </div>
  );
}
