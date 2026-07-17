"use client";
import { RefObject, useEffect, useRef } from "react";
import { useHydratedReducedMotion } from "@/lib/useHydratedReducedMotion";

/**
 * ASCII-art layer over the hero video (the 21st.dev "Forest" recipe,
 * reimplemented on Canvas2D). The playing <video> is sampled into a
 * cols×rows buffer each frame; every cell becomes a monospace glyph from
 * a brightness ramp, drawn from a pre-rendered atlas (one drawImage per
 * cell — no per-cell fillText/fillStyle churn). Behind the glyphs sits a
 * blurred 90%-opacity copy of the frame, which is also what hides the
 * source footage's upscaled softness. Shimmer wobbles each cell's
 * brightness level over time; chromatic fringe, film dust, and a static
 * CSS halftone overlay (in Hero) finish the look. Runs at 30fps, DPR 1 —
 * the chunky grid is the aesthetic, so extra pixels would be waste.
 */

const RAMP = " .:-=+*#%@"; // charSet: "standard", light -> dense
const CELL = 10; // cellSize
const LEVELS = 24;
const FPS = 30;
const SHIMMER_SPEED = 1; // animSpeed 100
const SHIMMER_DEPTH = 0.6; // animIntensity 60
const CHROMATIC = 0.2; // pfx.chromatic 20
const DUST = 0.2; // pfx.filmDust 20

export function AsciiVideo({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useHydratedReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const dctx = canvas.getContext("2d");
    if (!dctx) return;

    const sample = document.createElement("canvas");
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    const glyphs = document.createElement("canvas");
    const gctx = glyphs.getContext("2d");
    const atlas = document.createElement("canvas");
    const actx = atlas.getContext("2d");
    // fringe: glyphs recolored via composite ops (a per-frame CSS filter
    // draw would rasterize on the CPU and halve the frame rate)
    const fringe = document.createElement("canvas");
    const fctx = fringe.getContext("2d");
    // bg: quarter-res buffer; the 4x upscale supplies most of the blur
    const bg = document.createElement("canvas");
    const bctx = bg.getContext("2d");
    if (!sctx || !gctx || !actx || !fctx || !bctx) return;

    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let inView = true;

    const buildAtlas = () => {
      atlas.width = CELL * LEVELS;
      atlas.height = CELL;
      actx.clearRect(0, 0, atlas.width, atlas.height);
      actx.font = `700 ${CELL}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      actx.textAlign = "center";
      actx.textBaseline = "middle";
      for (let i = 0; i < LEVELS; i++) {
        const l = i / (LEVELS - 1);
        const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(l * RAMP.length))];
        const v = Math.round(46 + l * 209); // grayscale 100, floored so darks stay legible on ink
        actx.fillStyle = `rgb(${v},${v},${v})`;
        actx.fillText(ch, i * CELL + CELL / 2, CELL / 2 + 1);
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = w;
      canvas.height = h;
      glyphs.width = w;
      glyphs.height = h;
      fringe.width = w;
      fringe.height = h;
      bg.width = Math.max(1, Math.round(w / 4));
      bg.height = Math.max(1, Math.round(h / 4));
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      sample.width = Math.max(1, cols);
      sample.height = Math.max(1, rows);
      buildAtlas();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
    });
    io.observe(canvas);

    // object-cover math shared by the sample pass and the backdrop pass
    const coverRect = (dw: number, dh: number): readonly [number, number, number, number] => {
      const s = Math.max(dw / video.videoWidth, dh / video.videoHeight);
      const vw = video.videoWidth * s;
      const vh = video.videoHeight * s;
      return [(dw - vw) / 2, (dh - vh) / 2, vw, vh];
    };

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (!inView || t - last < 1000 / FPS) return;
      last = t;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      // 1+2: sample the frame at one pixel per cell, grayscale + contrast
      const [sx, sy, sw, sh] = coverRect(cols, rows);
      sctx.filter = "grayscale(1) contrast(1.28)";
      sctx.drawImage(video, sx, sy, sw, sh);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      // bgMode "blur": soft 90% copy of the frame behind the glyphs,
      // rendered at quarter res and upscaled (smoothing does the blurring)
      const [qx, qy, qw, qh] = coverRect(bg.width, bg.height);
      bctx.filter = "blur(1px)";
      bctx.drawImage(video, qx, qy, qw, qh);
      bctx.filter = "none";
      dctx.clearRect(0, 0, w, h);
      dctx.imageSmoothingEnabled = true;
      dctx.globalAlpha = 0.9;
      dctx.drawImage(bg, 0, 0, w, h);
      dctx.globalAlpha = 1;

      // 3: glyph pass with shimmer (per-cell brightness-level wobble);
      // level-0 cells map to the space glyph, so they're skipped outright
      gctx.clearRect(0, 0, w, h);
      const ts = t * 0.002 * SHIMMER_SPEED;
      const skipBelow = LEVELS / RAMP.length;
      for (let y = 0; y < rows; y++) {
        const phase = ts * 2 + y * 0.55;
        for (let x = 0; x < cols; x++) {
          const lum = data[(y * cols + x) * 4];
          let lvl = (lum / 255) * (LEVELS - 1) + Math.sin(phase + x * 0.35) * SHIMMER_DEPTH * 3;
          if (lvl < skipBelow) continue;
          lvl = lvl > LEVELS - 1 ? LEVELS - 1 : lvl;
          gctx.drawImage(atlas, (lvl + 0.5 | 0) * CELL, 0, CELL, CELL, x * CELL, y * CELL, CELL, CELL);
        }
      }

      // 5: chromatic fringe — composite-tinted offset copies, then the clean pass
      for (const [tint, ox] of [
        ["rgb(255,60,60)", -1.5],
        ["rgb(60,200,255)", 1.5],
      ] as const) {
        fctx.globalCompositeOperation = "source-over";
        fctx.clearRect(0, 0, w, h);
        fctx.drawImage(glyphs, 0, 0);
        fctx.globalCompositeOperation = "source-in";
        fctx.fillStyle = tint;
        fctx.fillRect(0, 0, w, h);
        dctx.globalCompositeOperation = "screen";
        dctx.globalAlpha = CHROMATIC;
        dctx.drawImage(fringe, ox, 0);
      }
      dctx.globalAlpha = 1;
      dctx.globalCompositeOperation = "source-over";
      dctx.drawImage(glyphs, 0, 0);

      // 5: film dust — a few short-lived specks and the odd scratch
      if (Math.random() < 0.6) {
        dctx.globalAlpha = DUST * 0.9;
        dctx.fillStyle = "#fff";
        const specks = 1 + (Math.random() * 3) | 0;
        for (let i = 0; i < specks; i++) {
          dctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random(), 1 + Math.random() * 2);
        }
        if (Math.random() < 0.06) {
          dctx.globalAlpha = DUST * 0.5;
          const x = Math.random() * w;
          dctx.fillRect(x, Math.random() * h * 0.5, 1, 40 + Math.random() * 80);
        }
        dctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced, videoRef]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden />;
}
