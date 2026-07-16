#!/usr/bin/env bash
# Media pipeline: converts client source assets (assets/) into web-ready files
# (public/media/). Run from the repo root: ./scripts/media.sh
set -euo pipefail
SRC="assets"
OUT="public/media"
mkdir -p "$OUT"

# --- webp encoder helper -----------------------------------------------
# This machine's ffmpeg build has no libwebp encoder at all ("Unknown
# encoder 'libwebp'"), so ffmpeg -c:v libwebp / -quality / -q:v all fail.
# to_webp() tries the direct ffmpeg route first (works on ffmpeg builds
# that do have libwebp) and falls back to ffmpeg (scale) -> cwebp (encode)
# through a temp PNG, which is what actually works here.
# Usage: to_webp <input> <output.webp> <scale_filter>
to_webp() {
  local in="$1" out="$2" vf="$3"
  if ffmpeg -y -i "$in" -vf "$vf" -c:v libwebp -quality 82 "$out" </dev/null -loglevel error 2>/dev/null; then
    return 0
  fi
  if ffmpeg -y -i "$in" -vf "$vf" -c:v libwebp -q:v 82 "$out" </dev/null -loglevel error 2>/dev/null; then
    return 0
  fi
  # Fallback: ffmpeg does the scaling (lossless PNG), cwebp does the encode.
  command -v cwebp >/dev/null 2>&1 || { echo "no webp encoder available (ffmpeg libwebp and cwebp both missing)" >&2; return 1; }
  local tmp
  tmp="$(mktemp -t media_XXXXXX).png"
  ffmpeg -y -i "$in" -vf "$vf" "$tmp" </dev/null -loglevel error
  cwebp -quiet -q 82 "$tmp" -o "$out"
  rm -f "$tmp"
}

SCALE="scale='min(1600,iw)':-2"

# --- Numbered gallery photos ---------------------------------------------
i=1
for f in "$SRC"/*.jpeg "$SRC"/*.jpg; do
  [ -e "$f" ] || continue
  n=$(printf "photo-%02d" "$i")
  to_webp "$f" "$OUT/$n.webp" "$SCALE"
  i=$((i+1))
done

# --- Portrait cutout ------------------------------------------------------
# assets/PHOTO-2026-07-16-15-53-05 (2).jpg is a white-background cutout
# portrait (kid in black race suit + green helmet). It already lands in the
# numbered loop above as one of the photo-NN.webp files, but the site's
# about/portrait slot needs it under its own stable name too.
PORTRAIT_SRC="$SRC/PHOTO-2026-07-16-15-53-05 (2).jpg"
if [ -e "$PORTRAIT_SRC" ]; then
  to_webp "$PORTRAIT_SRC" "$OUT/portrait.webp" "$SCALE"
fi

# --- Hero loop -------------------------------------------------------------
# Source: assets/VIDEO-2026-07-16-20-01-31.mp4, 1024x576 h264, ~663s total.
# Eyeballed via extracted frames every 30s across the full runtime, plus a
# 3-frame check inside the chosen window (see task-4-report.md for details):
#   - t=0s: pit lane, karts stationary, people standing around -> not usable.
#   - t=30s-t=270s: continuous on-track motion, kart mounted camera.
#   - t=195s-210s: on-track, enters a red/white-kerbed corner, passes the
#     pit building/grandstand, then straightens out on a back straight.
#     Confirmed continuous (no cuts/stops) at t=195s, 202s, 209s.
#   - By t=630s the kart is stationary back in the pit shed (session over).
# Chosen window: -ss 00:03:15 (195s), 15s duration -> ends 00:03:30.
HERO_SS="00:03:15"
HERO_POSTER_SS="00:03:17"

# hero.mp4 must stay <= 4MB. crf 23 (~6.2MB) and crf 26 (~4.5MB) both came in
# over budget on this clip; step crf up until the file clears the 4MB cap.
HERO_MAX_BYTES=4194304
for crf in 23 26 28 30 32; do
  ffmpeg -y -ss "$HERO_SS" -t 15 -i "$SRC"/VIDEO-*.mp4 \
    -vf "scale=1440:-2:flags=lanczos,eq=saturation=1.05" -an \
    -c:v libx264 -crf "$crf" -preset slow -movflags +faststart "$OUT/hero.mp4" </dev/null -loglevel error
  hero_bytes=$(stat -f%z "$OUT/hero.mp4" 2>/dev/null || stat -c%s "$OUT/hero.mp4")
  if [ "$hero_bytes" -le "$HERO_MAX_BYTES" ]; then
    break
  fi
done
if [ "$hero_bytes" -gt "$HERO_MAX_BYTES" ]; then
  echo "warning: hero.mp4 is $hero_bytes bytes, still over the 4MB budget at crf=$crf" >&2
fi

ffmpeg -y -ss "$HERO_SS" -t 15 -i "$SRC"/VIDEO-*.mp4 \
  -vf "scale=1440:-2:flags=lanczos" -an -c:v libvpx-vp9 -crf 34 -b:v 0 "$OUT/hero.webm" </dev/null -loglevel error

ffmpeg -y -ss "$HERO_POSTER_SS" -i "$SRC"/VIDEO-*.mp4 -frames:v 1 -vf "scale=1440:-2" "$OUT/hero-poster.jpg" </dev/null -loglevel error

ls -lh "$OUT"
