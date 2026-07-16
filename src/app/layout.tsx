import "./globals.css";
import type { Metadata } from "next";
import { display, body } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Vidyuth #12 — Karting Driver",
  description:
    "Official site of Vidyuth, 11-year-old karting driver racing toward Formula 1. 3 podiums. Race number 12.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
