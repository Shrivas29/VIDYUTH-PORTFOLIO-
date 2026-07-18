"use client";

import { useEffect, useRef, useState } from "react";

interface TextGlitchProps {
  text: string;
  hoverText?: string;
  href?: string;
  className?: string;
  delay?: number;
  /** Play the decode + highlight sweep on mount (for the splash, no hover needed). */
  autoPlay?: boolean;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function TextGlitch({ text, hoverText, href, className = "", delay = 0, autoPlay = false }: TextGlitchProps) {
  const textRef = useRef<HTMLHeadingElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayHoverText, setDisplayHoverText] = useState(hoverText || text);
  const hoverIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const effective = hoverText || text;

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      if (!textRef.current) return;
      gsap.set(textRef.current, { backgroundSize: "0%", scale: 0.95, opacity: 0.7 });
      const tl = gsap.timeline({ delay });
      tl.to(textRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }).to(
        textRef.current,
        { backgroundSize: "100%", duration: 2, ease: "elastic.out(1, 0.5)" },
        "-=0.3"
      );
    };
    loadGSAP();
  }, [delay]);

  const runScramble = () => {
    let iteration = 0;
    if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    hoverIntervalRef.current = setInterval(() => {
      setDisplayHoverText(
        effective
          .split("")
          .map((letter, index) => (index < iteration ? effective[index] : LETTERS[Math.floor(Math.random() * 26)]))
          .join("")
      );
      if (iteration >= effective.length && hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
      iteration += 1 / 3;
    }, 30);
  };

  const reveal = () => {
    if (spanRef.current) spanRef.current.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
  };
  const conceal = () => {
    if (spanRef.current) spanRef.current.style.clipPath = "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)";
  };

  const handleMouseEnter = () => {
    runScramble();
    reveal();
  };
  const handleMouseLeave = () => {
    if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    setDisplayHoverText(effective);
    conceal();
  };

  // Auto-play once for the splash: after the gradient reveal, sweep the green
  // highlight in and decode the letters into place.
  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(() => {
      runScramble();
      reveal();
    }, delay * 1000 + 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, delay]);

  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    };
  }, []);

  const spanContent = href ? (
    <a href={href} target="_blank" rel="noreferrer" className="text-inherit no-underline">
      {displayHoverText}
    </a>
  ) : (
    displayHoverText
  );

  return (
    <h1
      ref={textRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative m-0 flex flex-col items-start justify-center overflow-hidden border-b border-white-soft/15 bg-gradient-to-r from-white-soft to-green bg-clip-text bg-no-repeat font-block leading-none tracking-tight text-white-soft/15 ${className}`}
      style={{
        backgroundSize: "0%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        width: "100%",
        whiteSpace: "nowrap",
      }}
    >
      {text}
      <span
        ref={spanRef}
        aria-hidden
        className="pointer-events-none absolute flex h-full w-full flex-col justify-center font-block text-ink transition-all duration-500 ease-out"
        style={{
          clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
          transformOrigin: "center",
          backgroundColor: "var(--color-green)",
          whiteSpace: "nowrap",
        }}
      >
        {spanContent}
      </span>
    </h1>
  );
}
