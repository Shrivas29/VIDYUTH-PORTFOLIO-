import "./globals.css";
import type { Metadata, Viewport } from "next";
import { panchang } from "@/lib/fonts";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Splash } from "@/components/Splash";
import { Header } from "@/components/Header";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SideNav } from "@/components/SideNav";
import { CursorHint } from "@/components/CursorHint";
import { ChapterTransition } from "@/components/ChapterTransition";
import { contactEmail, socials, driver, nextRace, results, derivedStats } from "@/data/site";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidyuthracing.com";
const TITLE = "Vidyuth Nº12 — Karting Driver Racing Toward Formula 1";
const DESCRIPTION =
  "Official site of Vidyuth, 12-year-old karting driver from Coimbatore racing toward Formula 1. 3 podiums, best finish P2. Race number 12.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — Vidyuth Nº12" },
  description: DESCRIPTION,
  applicationName: "Vidyuth Nº12",
  authors: [{ name: "Vidyuth" }],
  creator: "Vidyuth Racing",
  keywords: [
    "Vidyuth",
    "Vidyuth Racing",
    "karting driver",
    "kart racing India",
    "IAME Series India",
    "junior karting",
    "Formula 1",
    "Coimbatore karting",
    "young racing driver",
    "Nº12",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: "Vidyuth Nº12",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vidyuth Nº12 — Karting to Formula 1" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  category: "sports",
};

export const viewport: Viewport = {
  themeColor: "#000016",
};

// Structured data as a single @graph: the athlete, his next race, and an FAQ.
// Together these give search engines the entities behind the page and open the
// door to rich results (event listings, FAQ snippets).
const stats = derivedStats(results);

const PERSON = {
  "@type": "Person",
  "@id": `${SITE_URL}/#vidyuth`,
  name: "Vidyuth",
  alternateName: "Vidyuth Nº12",
  jobTitle: "Karting Driver",
  description: DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  email: `mailto:${contactEmail}`,
  nationality: "Indian",
  homeLocation: { "@type": "Place", name: "Coimbatore, India" },
  sameAs: socials.map((s) => s.href),
  knowsAbout: ["Karting", "Motorsport", "Formula 1", "IAME Series India"],
};

const NEXT_RACE_EVENT = {
  "@type": "SportsEvent",
  name: nextRace.event,
  sport: "Kart racing",
  startDate: nextRace.date,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: nextRace.venue, address: "Coimbatore, India" },
  performer: { "@id": `${SITE_URL}/#vidyuth` },
  url: SITE_URL,
};

const FAQ = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How old is Vidyuth and what number does he race?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Vidyuth is ${driver.age} and races kart number ${driver.number}.`,
      },
    },
    {
      "@type": "Question",
      name: "What does Vidyuth race?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "4-stroke karting and the IAME Series India, on the ladder toward Formula 1.",
      },
    },
    {
      "@type": "Question",
      name: "What are Vidyuth's results so far?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `${stats.podiums} podiums across ${stats.events} events, best finish P${stats.bestFinish}.`,
      },
    },
    {
      "@type": "Question",
      name: "Where is Vidyuth based?",
      acceptedAnswer: { "@type": "Answer", text: "Coimbatore, India." },
    },
    {
      "@type": "Question",
      name: "How can I sponsor or partner with Vidyuth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Reach the team at ${contactEmail} to talk sponsorship and partnerships.`,
      },
    },
  ],
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [PERSON, NEXT_RACE_EVENT, FAQ],
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
      {PLAUSIBLE_DOMAIN && (
        <head>
          {/* Privacy-friendly analytics — loads only when the domain env var is set. */}
          <script defer data-domain={PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />
        </head>
      )}
      <body>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <div id="boot-cover" aria-hidden="true" />
        <SmoothScroll>
          <Splash />
          <Header />
          <ScrollProgress />
          <SideNav />
          {children}
          <ChapterTransition />
          <CursorHint />
        </SmoothScroll>
      </body>
    </html>
  );
}
