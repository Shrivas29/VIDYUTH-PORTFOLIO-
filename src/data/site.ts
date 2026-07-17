export type RaceResult = {
  event: string;
  finish: number;
  category: "4-stroke" | "IAME (in category)";
};

export const driver = {
  name: "Vidyuth",
  age: 11,
  number: 12 as const,
  headline: "Born to race",
  intro:
    "Eleven years old. Three podiums. One goal: Formula 1. Vidyuth races karts the way the greats started, and he is only getting faster.",
  bio: [
    "Vidyuth climbed into a kart before most kids pick a sport, and the stopwatch settled it. Within his first seasons he was standing on podiums in 4-stroke competition and holding his own in the IAME series.",
    "Racing number 12. Green helmet. A family that travels to every circuit. The plan runs from karting through junior single-seaters, all the way to Formula 1.",
  ],
};

export const results: RaceResult[] = [
  { event: "Chennai Karting Festival", finish: 3, category: "4-stroke" },
  { event: "Karter Cup Season 1", finish: 2, category: "4-stroke" },
  { event: "GTM Endurance", finish: 3, category: "4-stroke" },
  { event: "IAME Series India, Round 1", finish: 4, category: "IAME (in category)" },
  { event: "IAME Series India, Round 2", finish: 6, category: "IAME (in category)" },
];

export function derivedStats(rs: RaceResult[]) {
  return {
    podiums: rs.filter((r) => r.finish <= 3).length,
    events: rs.length,
    bestFinish: Math.min(...rs.map((r) => r.finish)),
  };
}

export const roadToF1 = [
  { stage: "Karting", detail: "4-stroke podiums and IAME India rounds. This is now.", current: true },
  { stage: "International karting", detail: "IAME and FIA karting abroad, against the fastest kids in the world.", current: false },
  { stage: "Junior single-seaters", detail: "F4, then the junior formula ladder.", current: false },
  { stage: "Formula 1", detail: "The seat every step points at.", current: false },
];

export const lifeCards = [
  { title: "Training", text: "Kart fitness is real fitness: neck, grip, core, reaction drills. He trains around the school week." },
  { title: "Race day", text: "Walk the track. Briefing. Visor down. The grid does not care how old you are." },
  { title: "School and racing", text: "Homework travels in the kit bag. Teachers get the race calendar a term ahead." },
  { title: "The dream", text: "Every champion's story starts in a kart. His has already started." },
];

export const beginningsQuote = "I want to be on that grid.";

// Ships empty until the client supplies links; Footer renders only what's here.
export const socials: { label: string; href: string }[] = [];

export type GalleryPhoto = { src: string; width: number; height: number; alt: string };

export const gallery: GalleryPhoto[] = [
  { src: "/media/photo-02.webp", width: 1280, height: 854, alt: "Vidyuth leads a pack of karts through a corner in kart number 12" },
  { src: "/media/photo-08.webp", width: 1066, height: 1600, alt: "Panning shot of Vidyuth cornering at full speed" },
  { src: "/media/photo-04.webp", width: 1280, height: 854, alt: "Vidyuth takes the checkered flag in kart number 12" },
  { src: "/media/photo-12.webp", width: 1066, height: 1600, alt: "Vidyuth flat out on the straight, the kerbs a blur" },
  { src: "/media/photo-05.webp", width: 1179, height: 648, alt: "Vidyuth carries speed through a corner, green helmet down" },
  { src: "/media/photo-09.webp", width: 1066, height: 1600, alt: "Vidyuth turns in past the tyre wall" },
  { src: "/media/photo-06.webp", width: 640, height: 640, alt: "A handshake with a rival driver in the paddock at sunset" },
  { src: "/media/photo-10.webp", width: 1280, height: 854, alt: "Vidyuth with the Momentum Motorsports team" },
  { src: "/media/photo-11.webp", width: 924, height: 1600, alt: "Talking gloves and setup with a fellow driver before a session" },
  { src: "/media/photo-03.webp", width: 1280, height: 854, alt: "Vidyuth in Momentum Motorsports colours in the paddock" },
  { src: "/media/photo-13.webp", width: 1066, height: 1600, alt: "Suited up at the fence, helmet on, waiting for track time" },
];

export const chapters = [
  { id: "hero", label: "Start" },
  { id: "driver", label: "The Driver" },
  { id: "stats", label: "Stats" },
  { id: "beginnings", label: "Beginnings" },
  { id: "road-to-f1", label: "Road to F1" },
  { id: "gallery", label: "Gallery" },
  { id: "life", label: "Life as a Driver" },
  { id: "partners", label: "Partners" },
  { id: "contact", label: "Contact" },
];
