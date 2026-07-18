"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Isometric layered wordmark. Each line holds a top and bottom word inside a
 * clipped, skewed row; hovering rolls the whole stack up one line so every
 * word flips to the next, cascading with a stagger.
 *
 * Adapted for this codebase: the source drove the roll with GSAP, but the
 * site already ships `motion` as its one animation runtime, so the hover is
 * reimplemented with a `motion.p` per word (no second animation library).
 * Color comes from `className` (the site has fixed light/dark sections, not
 * a `dark:` class strategy); the responsive sizing is wired through real
 * state instead of the source's unused CSS vars.
 */

interface LayeredTextProps {
  lines?: Array<{ top: string; bottom: string }>;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function LayeredText({
  lines = [
    { top: " ", bottom: "INFINITE" },
    { top: "INFINITE", bottom: "PROGRESS" },
    { top: "PROGRESS", bottom: "FUTURE" },
    { top: "FUTURE", bottom: " " },
  ],
  className = "",
}: LayeredTextProps) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fontSize = isDesktop ? 72 : 36;
  const lineH = isDesktop ? 60 : 35;
  const offset = isDesktop ? 35 : 20;
  const shift = -lineH; // roll up exactly one line so words swap cleanly
  const centerIndex = Math.floor(lines.length / 2);
  const total = lines.length * 2;
  const active = hovered && !reduced;

  const Word = ({ text, order }: { text: string; order: number }) => (
    <motion.p
      className="m-0 whitespace-nowrap px-[15px] align-top"
      style={{ height: `${lineH}px`, lineHeight: `${lineH - 5}px` }}
      animate={{ y: active ? shift : 0 }}
      transition={{ duration: 0.6, ease, delay: (active ? order : total - 1 - order) * 0.045 }}
    >
      {text}
    </motion.p>
  );

  return (
    <div
      className={`mx-auto cursor-pointer select-none uppercase tracking-[-2px] antialiased font-block ${className}`}
      style={{ fontSize: `${fontSize}px` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ul className="m-0 flex list-none flex-col items-center p-0">
        {lines.map((line, index) => (
          <li
            key={index}
            className="relative overflow-hidden"
            style={{
              height: `${lineH}px`,
              transform: `translateX(${offset * (index - centerIndex)}px) skew(${
                index % 2 === 0 ? "60deg, -30deg" : "0deg, -30deg"
              }) scaleY(${index % 2 === 0 ? 0.66667 : 1.33333})`,
            }}
          >
            <Word text={line.top} order={index * 2} />
            <Word text={line.bottom} order={index * 2 + 1} />
          </li>
        ))}
      </ul>
    </div>
  );
}
