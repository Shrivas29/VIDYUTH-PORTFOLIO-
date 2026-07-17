import "./globals.css";
import type { Metadata } from "next";
import { display, block, body } from "@/lib/fonts";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Splash } from "@/components/Splash";
import { Header } from "@/components/Header";
import { PartnerChip } from "@/components/PartnerChip";

export const metadata: Metadata = {
  title: "Vidyuth #12 — Karting Driver",
  description:
    "Official site of Vidyuth, 11-year-old karting driver racing toward Formula 1. 3 podiums. Race number 12.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${block.variable} ${body.variable}`}>
      <body>
        <SmoothScroll>
          <Splash />
          <Header />
          {children}
          <PartnerChip />
        </SmoothScroll>
      </body>
    </html>
  );
}
