"use client";
import { useEffect, useRef, useState } from "react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";
import { SectionMarker } from "@/components/SectionMarker";

/**
 * Onboard highlight. A muted clip loops while it is on screen (paused off
 * screen to spare the decoder) with a sound toggle for the engine audio.
 * Reduced motion holds the poster frame and never autoplays.
 */
export function Highlight() {
  const reduced = useHydratedReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(section);
    return () => io.disconnect();
  }, [reduced]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted) video.play().catch(() => {});
  };

  return (
    <section ref={sectionRef} id="highlight" className="relative bg-ink py-24 text-white-soft">
      <div className="mx-auto max-w-6xl px-5 md:px-12 lg:px-20">
        <SectionMarker label="Onboard" inverted as="p" />
        <h2 className="mt-8 font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.02]">
          Ride onboard
        </h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white-soft/80">
          Twenty-four seconds from the seat. Green helmet, number 12, flat through the corners.
        </p>

        <div className="relative mt-10 overflow-hidden rounded-sm">
          <video
            ref={videoRef}
            className="aspect-video w-full object-cover"
            poster="/media/highlight-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            controls={reduced}
          >
            <source src="/media/highlight.mp4" type="video/mp4" />
          </video>
          {!reduced && (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className="absolute bottom-4 left-4 flex min-h-11 cursor-pointer items-center gap-2 bg-ink/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white-soft backdrop-blur-sm transition-colors duration-200 hover:bg-green hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            >
              <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
              {muted ? "Sound off" : "Sound on"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
