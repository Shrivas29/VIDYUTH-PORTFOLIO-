"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { driver } from "@/data/site";
import { splashWasShownThisLoad } from "@/components/Splash";

const SHORT_DELAY = 0.3;
const POST_SPLASH_DELAY = 2.5;
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
 * headline waits for the splash's ~2.4s display plus its 0.6s wipe-exit to
 * clear before entering. On a repeat visit within the session (splash
 * skipped), a short delay reads better than a long one.
 *
 * Pure and exported so this branch is unit-testable directly, without having
 * to drive framer-motion's WAAPI timeline through a real browser.
 */
export function headlineDelayBase(splashShown: boolean): number {
  return splashShown ? POST_SPLASH_DELAY : SHORT_DELAY;
}

export function Hero() {
  // `useReducedMotion()` resolves synchronously from `matchMedia` on the
  // client's very first render, which differs from the server's guess
  // (there's no `window` during SSR, so it resolves to `null` there). It's
  // safe to read directly during render for the video effect below (effects
  // never run during SSR, so there's no interim wrong value to defend
  // against there) — but the headline's SSR markup below never branches on
  // it at all, for a stronger reason than hydration mismatch: the words
  // must render as real, visible content even if client JS never runs, full
  // stop. See `entrance` below.
  const reduced = useReducedMotion();
  const words = driver.headline.split(" ");

  // Server render and the client's first paint both render the headline as
  // plain, always-visible spans — no inline opacity/transform, nothing
  // gated on an effect. `entrance` starts `null` and stays `null` forever
  // under reduced motion (the headline is simply always visible, no
  // animation). Otherwise, the effect below flips it to the splash-aware
  // delay, and only once that value is known do the animated `motion.span`
  // words mount at all — they never mount with a placeholder delay that
  // later needs correcting.
  //
  // That ordering is what fixes the previous bug: framer-motion never
  // reschedules an already-started animation when only a `transition` prop
  // changes on a live element, so a "start at the wrong delay, then update
  // state to the right one" approach silently keeps running at the wrong
  // delay. Mounting the motion element for the first time only after the
  // correct delay is computed sidesteps that entirely — there is no
  // earlier, wrong animation to reschedule.
  //
  // This runs in a layout effect (before the browser's next paint), not a
  // passive `useEffect`: a passive effect is scheduled *after* paint, which
  // left a real, user-visible gap on repeat visits (splash skipped, nothing
  // covering the hero) — the static spans painted visible, then ~100ms+
  // later snapped to the motion span's invisible pre-animation state, a
  // visible → hidden → visible flicker. A layout effect closes almost all of
  // that gap: it fires synchronously as part of the same commit hydration
  // produced, before the browser's *next* paint, so there is no longer a
  // "hydrated, idle, still showing the static version" interval. One frame
  // of the raw SSR HTML (~10-16ms, confirmed via a production build) is
  // still visible before that first client paint — that part is the browser
  // painting streamed HTML before the JS bundle has even loaded, which is
  // exactly what SSR-visible content (Finding 1) requires and no client-side
  // effect, layout or passive, can execute before. Eliminating that last
  // frame too would mean either the SSR markup itself starts invisible
  // (reintroducing Finding 1) or a render-blocking inline script outside
  // React's hydration model entirely — a materially bigger change than this
  // fix.
  //
  // This only works because Splash's own flag-setting effect (Splash.tsx)
  // is *also* a layout effect. React fires every layout effect in the tree
  // before any passive effect, so if Hero's read here were a layout effect
  // while Splash's write stayed a passive `useEffect`, Hero would always
  // read the pre-splash default (verified by testing: the fresh-load delay
  // silently regressed to the short 0.3s on every load, splash or not).
  // Promoting Splash's effect to a layout effect too keeps both reads/writes
  // in the same commit phase, where the sibling-order guarantee (Splash
  // renders before `{children}` in the root layout, so its effect commits
  // first) actually holds.
  const [entrance, setEntrance] = useState<{ delayBase: number } | null>(null);

  useIsoLayoutEffect(() => {
    if (reduced) return; // stays static/visible forever — content, never gated on animation
    setEntrance({ delayBase: headlineDelayBase(splashWasShownThisLoad()) });
  }, [reduced]);

  // Scroll-out parallax: as the hero leaves the viewport the video zooms
  // slowly while the headline lifts away faster and the prompt fades —
  // cheap depth that makes the handoff into the first chapter cinematic.
  // All three motion values sit at their rest state at scroll 0, so SSR
  // and hydration markup agree; under reduced motion they're not attached.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const promptOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) {
      video.pause();
      video.load(); // drop back to the poster frame rather than a frozen mid-loop frame
    } else {
      // Optional chaining guards jsdom's test-environment `play()`, which
      // returns `undefined` instead of a Promise; real browsers always
      // return a Promise here, so this is a no-op there.
      video.play()?.catch(() => {}); // muted autoplay is allowed; ignore rare rejections
    }
  }, [reduced]);

  return (
    <section id="hero" ref={sectionRef} className="relative h-svh overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { scale: videoScale }}
        aria-hidden
      >
        <video
          ref={videoRef}
          className="size-full object-cover opacity-80"
          poster="/media/hero-poster.jpg"
          muted
          loop
          playsInline
        >
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>
      <div className="absolute inset-0 bg-ink/35" aria-hidden />
      <motion.div
        className="relative flex h-full flex-col items-center justify-center px-4"
        style={reduced ? undefined : { y: headlineY }}
      >
        <h1
          className="font-display text-center text-white-soft"
          style={{ fontSize: "clamp(4rem, 17vw, 15rem)" }}
        >
          {words.map((w, i) =>
            entrance ? (
              <motion.span
                key={w}
                className="inline-block"
                initial={{ y: "0.4em", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: entrance.delayBase + i * STAGGER,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
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
      </motion.div>
      <motion.p
        className="absolute inset-x-0 bottom-8 pl-5 text-left text-xs font-bold uppercase tracking-[0.04em] text-white-soft md:pl-0 md:text-center"
        style={reduced ? undefined : { opacity: promptOpacity }}
      >
        Scroll to explore
      </motion.p>
    </section>
  );
}
