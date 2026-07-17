import localFont from "next/font/local";
import { Manrope } from "next/font/google";

// Pencerio Hairline (Fontshare / Indian Type Foundry) — the display voice:
// every expressive headline. Hand-drawn script, single hairline weight.
export const display = localFont({
  src: "../fonts/Pencerio-Hairline.woff2",
  weight: "50",
  variable: "--font-display",
  display: "swap",
});

// Tanker — the block voice: numerals, marks, and data labels, where a
// hairline script stops being legible (race results, the VD mark).
export const block = localFont({
  src: "../fonts/Tanker-Regular.woff2",
  weight: "400",
  variable: "--font-block",
  display: "swap",
});

export const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
