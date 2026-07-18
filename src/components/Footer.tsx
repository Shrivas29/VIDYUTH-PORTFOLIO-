import { Monogram } from "@/components/Monogram";
import { chapters, socials, contactEmail } from "@/data/site";

const footerLink =
  "cursor-pointer text-sm font-bold text-white-soft/80 transition-colors duration-150 hover:text-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green";

export function Footer() {
  return (
    <footer id="contact" className="relative bg-ink px-5 py-16 text-white-soft md:px-12 lg:px-20">
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
              Sponsorship and race enquiries welcome.
            </p>
            <a href={`mailto:${contactEmail}`} className={footerLink}>
              {contactEmail}
            </a>
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                rel="noopener noreferrer"
                target="_blank"
                className="mt-1 inline-flex w-fit min-h-11 cursor-pointer items-center gap-2 border border-white-soft/25 px-4 py-2 text-sm font-bold text-white-soft transition-colors duration-150 hover:border-green hover:text-green focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
                Follow @vidyuthracing
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
