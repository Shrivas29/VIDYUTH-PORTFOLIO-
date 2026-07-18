import "./globals.css";
import type { Metadata } from "next";
import { panchang } from "@/lib/fonts";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Splash } from "@/components/Splash";
import { Header } from "@/components/Header";
import { PartnerChip } from "@/components/PartnerChip";
import { ChapterTransition } from "@/components/ChapterTransition";

export const metadata: Metadata = {
  title: "Vidyuth #12 — Karting Driver",
  description:
    "Official site of Vidyuth, 11-year-old karting driver racing toward Formula 1. 3 podiums. Race number 12.",
};

// Runs before the body paints: if the splash is not going to play (already
// seen this session, or reduced motion), mark the root so CSS hides the
// boot cover immediately and the hero shows with no delay. Otherwise the
// cover stays, so the hero never flashes before the React splash mounts.
// A data attribute (not a class) survives hydration untouched by React.
const BOOT_SCRIPT =
  "try{if(sessionStorage.getItem('v12-splash')||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-splash-skip','')}}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={panchang.variable}
      // The boot script sets data-splash-skip on <html> before hydration;
      // suppress the expected attribute-mismatch warning for this element.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <div id="boot-cover" aria-hidden="true" />
        <SmoothScroll>
          <Splash />
          <Header />
          {children}
          <ChapterTransition />
          <PartnerChip />
        </SmoothScroll>
      </body>
    </html>
  );
}
