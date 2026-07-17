import { Monogram } from "@/components/Monogram";
import { SeamCurtain } from "@/components/SeamCurtain";
import { chapters, socials } from "@/data/site";

const footerLink =
  "cursor-pointer text-sm font-bold text-white-soft/80 transition-colors duration-150 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green";

export function Footer() {
  return (
    <footer id="contact" className="relative bg-ink px-5 py-16 text-white-soft md:px-12 lg:px-20">
      <SeamCurtain finish="bottom" />
      <div className="mx-auto max-w-6xl">
        <Monogram inverted />
        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_auto]">
          <nav aria-label="Chapters" className="grid max-w-md grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3">
            {chapters.map((c) => (
              <a key={c.id} href={`#${c.id}`} className={footerLink}>
                {c.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-white-soft/70">Contact</p>
            <p className="max-w-[30ch] text-sm text-white-soft/85">
              Sponsorship enquiries open. Direct contact details coming soon.
            </p>
            {socials.map((s) => (
              <a key={s.href} href={s.href} className={footerLink} rel="noopener noreferrer" target="_blank">
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white-soft/20 pt-6 text-xs font-bold text-white-soft/70">
          <p>© 2026 Vidyuth</p>
          <a
            href="https://entostudios.com"
            rel="noopener noreferrer"
            target="_blank"
            className="cursor-pointer transition-colors duration-150 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
          >
            Site by ENTØ
          </a>
        </div>
      </div>
    </footer>
  );
}
