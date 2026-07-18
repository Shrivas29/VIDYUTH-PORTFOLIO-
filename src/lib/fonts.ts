import localFont from "next/font/local";

// Panchang (Fontshare / Indian Type Foundry) — one variable face, weights
// 200–800, drives the whole site. The three voices (display headlines, the
// block/data mark, and body) are the same family differentiated by weight
// in globals.css, so it ships as a single ~37KB woff2.
export const panchang = localFont({
  src: "../fonts/Panchang-Variable.woff2",
  weight: "200 800",
  variable: "--font-panchang",
  display: "swap",
});
