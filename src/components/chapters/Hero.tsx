"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { driver } from "@/data/site";
import { splashWasShownThisLoad } from "@/components/Splash";

const SHORT_DELAY = 0.3;
const POST_SPLASH_DELAY = 2.5;
const STAGGER = 0.12;

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
  // This must be a plain `useEffect`, not `useLayoutEffect`: React fires
  // *every* layout effect in the tree before *any* passive effect, so a
  // layout effect here would run before Splash's own (passive) mount effect
  // has had a chance to flip `shownThisLoad` — reading it too early and
  // always seeing the pre-splash default. Splash.tsx's ordering guarantee
  // ("its effect always commits first") only holds between two effects of
  // the same kind; verified by testing that a layout effect here silently
  // regresses to the short delay on every load, splash or not. A passive
  // effect keeps Hero's read after Splash's write, at the cost of accepting
  // a one-frame flash between the static text and the motion span's
  // pre-animation state — an explicitly acceptable tradeoff here.
  const [entrance, setEntrance] = useState<{ delayBase: number } | null>(null);

  useEffect(() => {
    if (reduced) return; // stays static/visible forever — content, never gated on animation
    setEntrance({ delayBase: headlineDelayBase(splashWasShownThisLoad()) });
  }, [reduced]);

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
      </div>
      <p className="absolute inset-x-0 bottom-8 text-center text-xs font-bold uppercase tracking-[0.04em] text-white-soft">
        Scroll to explore
      </p>
    </section>
  );
}
