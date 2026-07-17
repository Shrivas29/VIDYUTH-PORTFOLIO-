import localFont from "next/font/local";
import { Manrope } from "next/font/google";

// Tanker (Fontshare / Indian Type Foundry) — the display voice of the site.
export const display = localFont({
  src: "../fonts/Tanker-Regular.woff2",
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
