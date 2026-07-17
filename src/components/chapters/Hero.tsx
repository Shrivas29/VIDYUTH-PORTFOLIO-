"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { driver } from "@/data/site";
import { splashWasShownThisLoad } from "@/components/Splash";

const SHORT_DELAY = 0.3;
const POST_SPLASH_DELAY = 2.5;

/**
 * Headline entrance delay, in seconds. On a fresh load where the splash
 * actually played, the headline should wait for the splash's ~2.4s display
 * plus its 0.6s wipe-exit to clear before entering. On a repeat visit within
 * the session (splash skipped), a short delay reads better than a long one.
 *
 * `splashWasShownThisLoad()` is only meaningful once Splash's own mount
 * effect has committed (it's a module-global flip inside that effect), so it
 * must never be read during render. This hook defaults to the short delay
 * and only lengthens it from an effect after mount — Splash renders before
 * `{children}` in the root layout, so its effect always commits first, but
 * defaulting short and upgrading is safe either way: the state flip lands
 * within milliseconds of mount, long before either delay has elapsed, so the
 * headline (still at its pre-animation opacity-0 state) never visibly jumps.
 */
function useHeadlineDelay(): number {
  const [delay, setDelay] = useState(SHORT_DELAY);
  useEffect(() => {
    if (splashWasShownThisLoad()) setDelay(POST_SPLASH_DELAY);
  }, []);
  return delay;
}

export function Hero() {
  // `useReducedMotion()` resolves synchronously from `matchMedia` on the
  // client's very first render, which differs from the server's guess
  // (there's no `window` during SSR, so it always renders as "not reduced").
  // Two different things follow from that:
  //
  // 1. It must never gate *what markup renders* on the first paint (an
  //    `initial`/`autoPlay` ternary keyed on it would render differently on
  //    the server vs. the client's first pass, producing a real hydration
  //    mismatch — confirmed via Playwright: React logged a console error,
  //    and worse, the video had already started playing natively off the
  //    server-rendered `autoplay` attribute before React's hydration pass
  //    could remove it, so simply toggling the attribute never actually
  //    stopped it). So `initial` below is static, and the video never
  //    carries a declarative `autoPlay` attribute at all.
  // 2. It's perfectly safe to read directly inside an effect, since effects
  //    never run during SSR and are already correct by their first client
  //    invocation (no interim wrong value to defend against, unlike the
  //    splash flag above). Playback and the headline's transition timing
  //    are both driven from effects/runtime config, never from SSR-visible
  //    attributes, so they read it straight from the hook.
  const reduced = useReducedMotion();
  const delayBase = useHeadlineDelay();
  const words = driver.headline.split(" ");

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) {
      video.pause();
      video.load(); // drop back to the poster frame rather than a frozen mid-loop frame
    } else {
      video.play().catch(() => {}); // muted autoplay is allowed; ignore rare rejections
    }
  }, [reduced]);

  return (
    <section id="hero" className="relative h-svh overflow-hidden bg-ink">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover opacity-80"
        poster="/media/hero-poster.jpg"
        muted
        loop
        playsInline
        aria-hidden
      >
        <source src="/media/hero.webm" type="video/webm" />
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-ink/35" aria-hidden />
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <h1
          className="font-display text-center text-white-soft"
          style={{ fontSize: "clamp(4rem, 17vw, 15rem)" }}
        >
          {words.map((w, i) => (
            <motion.span
              key={w}
              className="inline-block"
              initial={{ y: "0.4em", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { delay: delayBase + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
              }
            >
              {w}&nbsp;
            </motion.span>
          ))}
        </h1>
      </div>
      <p className="absolute inset-x-0 bottom-8 text-center text-xs font-bold uppercase tracking-[0.04em] text-white-soft">
        Scroll to explore
      </p>
    </section>
  );
}
