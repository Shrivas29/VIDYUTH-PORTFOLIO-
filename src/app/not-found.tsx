import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-ink px-6 text-center text-white-soft">
      <div>
        <p className="font-block text-[clamp(5rem,22vw,13rem)] leading-none text-green">404</p>
        <p className="mt-6 font-display text-[clamp(1.4rem,4vw,2.2rem)]">This corner isn&rsquo;t on the track.</p>
        <Link
          href="/"
          className="mt-10 inline-flex min-h-11 cursor-pointer items-center bg-green px-8 py-3 text-sm font-extrabold uppercase tracking-[0.04em] text-ink transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
          style={{ clipPath: "polygon(4% 0, 100% 0, 96% 100%, 0 100%)" }}
        >
          Back to the start
        </Link>
      </div>
    </main>
  );
}
