"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { driver } from "@/data/site";
import { splashWasShownThisLoad } from "@/components/Splash";

const SHORT_DELAY = 0.3;
// Tuned to Splash's DISPLAY_MS (2.6s) so the headline enters just before the
// wipe finishes clearing it — same handoff overlap.
const POST_SPLASH_DELAY = 2.7;
const STAGGER = 0.12;

// Isomorphic layout effect: `useLayoutEffect` warns when it runs during SSR
// (it never actually does here — this component is only ever rendered via
// `renderToString`, which doesn't run effects at all — but Next can still
// evaluate this module in a server context where the warning check fires).
// Falling back to `useEffect` there is a no-op safeguard, not a real code
// path.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Base headline entrance delay, in seconds, before the per-word `i * STAGGER`
 * offset is added. On a fresh load where the splash actually played, the
 * headline waits for the splash's ~2.6s display plus its 0.6s wipe-exit to
 * clear before entering. On a repeat visit within the session (splash
 * skipped), a short delay reads better than a long one.
 *
 * Pure and exported so this branch is unit-testable directly, without having
 * to drive framer-motion's WAAPI timeline through a real browser.
 */
export function headlineDelayBase(splashShown: boolean): number {
  return splashShown ? POST_SPLASH_DELAY : SHORT_DELAY;
}

/**
 * Scroll-scrub reveal hero. The section is three viewports tall; a pinned
 * stage inside it shows a side-profile showcase clip whose playback head is
 * driven by scroll — the clip transitions kart → F1 as you descend, in the
 * style of the ESPN "How F1 has evolved" feature. No mask, no per-frame
 * canvas: a rAF loop eases `video.currentTime` toward the scroll target so
 * seeks read smooth. (The current `hero.*` clip is a placeholder until the
 * generated kart→F1 showcase lands; only the src + duration change then.)
 */
export function Hero() {
  const reduced = useReducedMotion();
  const words = driver.headline.split(" ");

  // Splash handoff, unchanged: SSR/first paint render the headline as plain,
  // always-visible spans; only after the splash-aware delay is known do the
  // animated words mount. See the long note in git history for why this is a
  // layout effect paired with Splash's.
  const [entrance, setEntrance] = useState<{ delayBase: number } | null>(null);
  useIsoLayoutEffect(() => {
    if (reduced) return;
    setEntrance({ delayBase: headlineDelayBase(splashWasShownThisLoad()) });
  }, [reduced]);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Scrub the showcase clip: ease currentTime toward scroll progress each
  // frame. Never played — only seeked — so it holds wherever the scroll rests.
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const dur = video.duration;
      if (!dur || !Number.isFinite(dur)) return;
      const target = Math.max(0, Math.min(dur - 0.05, scrollYProgress.get() * dur));
      const cur = video.currentTime;
      const diff = target - cur;
      // Once settled at either end (kart at 0, F1 at dur) this early-returns,
      // so no wasteful seeking while the rest of the page scrolls past.
      if (Math.abs(diff) < 0.01) return;
      try {
        video.currentTime = cur + diff * 0.2;
      } catch {
        /* seek not ready yet */
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, scrollYProgress]);

  // Overlay motion — every value sits at its rest state at scroll 0, so SSR
  // and first paint agree and no inline `opacity:0` is ever emitted (the
  // headline content must survive with no JS). The KARTING→FORMULA 1 rail
  // reads progress through a sliding marker (an `x`/`left` value, not
  // opacity): scroll-linked opacity via motion's WAAPI path renders
  // non-monotonically here, and position is what this rail wants anyway. The
  // headline stays fixed while the clip scrubs, as in the reference.
  const markerX = useTransform(scrollYProgress, [0.04, 0.96], ["0%", "100%"]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1]);

  // Fade the scroll hint once the reveal starts — class-based, so no
  // scroll-linked inline opacity and nothing gated at SSR.
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setScrolled(v > 0.03));

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative h-[300svh]"
      // Matches the clip's studio cyclorama gradient so the object-contain
      // letterbox blends into one seamless cream field — the car floats.
      style={{ background: "radial-gradient(125% 95% at 50% 42%, #f2ede5 0%, #e7e0d5 52%, #d1cac0 100%)" }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Full-bleed showcase clip — object-contain over the matching cream
            field, so the whole car stays visible on every viewport and the
            studio background reads as one seamless surface with the hero. */}
        <motion.div className="absolute inset-0" style={reduced ? undefined : { scale: stageScale }} aria-hidden>
          <video
            ref={videoRef}
            // Mobile: a width-locked 16:9 band whose top and bottom edges are
            // feathered into the cream field, so the kart floats instead of
            // sitting in a visible rectangle. Desktop (md+): the original
            // full-bleed object-contain with no mask — layout unchanged.
            className="absolute inset-x-0 bottom-[11%] h-[56.25vw] w-full object-cover object-center [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)] md:inset-0 md:bottom-0 md:h-full md:object-contain md:object-[50%_82%] md:[-webkit-mask-image:none] md:[mask-image:none]"
            poster="/media/hero-reveal-poster.jpg"
            muted
            playsInline
            preload="auto"
          >
            <source src="/media/hero-reveal.mp4" type="video/mp4" />
          </video>
        </motion.div>

        <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-6 pt-24 md:px-10">
          {/* Kicker + headline (top) — fixed while the clip scrubs kart→F1 below */}
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-block bg-green px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">
              Kart → Formula 1
            </span>
            <h1 className="font-display text-ink" style={{ fontSize: "clamp(2.6rem, 7.5vw, 7rem)" }}>
              {words.map((w, i) =>
                entrance ? (
                  <motion.span
                    key={w}
                    className="inline-block"
                    initial={{ y: "0.4em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: entrance.delayBase + i * STAGGER, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}&nbsp;
                  </motion.span>
                ) : (
                  <span key={w} className="inline-block">
                    {w}&nbsp;
                  </span>
                )
              )}
            </h1>
          </div>

          {/* FIG label + KARTING→FORMULA 1 progress rail (bottom) */}
          <div className="flex items-end justify-between gap-6">
          <span className="font-block text-[11px] tracking-[0.02em] text-ink/60">Fig 01 — Nº 12</span>
          <div className="flex-1 pb-1">
            <div className="mx-auto flex max-w-md items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink/70">
              <span>Karting</span>
              <span>Formula 1</span>
            </div>
            <div className="relative mx-auto mt-2 h-px max-w-md bg-ink/20">
              <motion.span
                className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green"
                style={reduced ? undefined : { left: markerX }}
                aria-hidden
              />
            </div>
          </div>
          <span
            className={`hidden text-[11px] font-bold uppercase tracking-[0.04em] text-ink/70 transition-opacity duration-300 md:inline ${
              scrolled ? "opacity-0" : "opacity-100"
            }`}
          >
            Scroll to reveal
          </span>
          </div>
        </div>
      </div>
    </section>
  );
}
