import { Link } from 'react-router-dom';
import { PORTFOLIO } from '@/data/portfolio.js';

/* Each client's own logo (public/images/clients, made from their sites' artwork), shown in grey
   and in colour on hover, linking to its case study. Heights are set per logo so they read at
   the same weight. A still row, no ticker. */
const LOGOS = {
  'raza-academy': { w: 536, h: 96, className: 'h-9' },
  'top-one-salon': { w: 250, h: 88, className: 'h-11' },
  'change-work-therapies': { w: 644, h: 80, className: 'h-8' },
};

export default function ClientStrip() {
  const live = PORTFOLIO.filter((p) => p.status === 'live' && p.caseStudy && LOGOS[p.id]);
  return (
    <section aria-label="Our clients" className="border-y border-ink/[0.08] bg-sand/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-8 md:flex-row md:justify-between md:px-8">
        <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink/70">Live for businesses like yours</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {live.map((p) => {
            const logo = LOGOS[p.id];
            return (
              <li key={p.id}>
                <Link
                  to={'/portfolio/' + p.id}
                  className="group flex min-h-11 items-center rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45"
                >
                  <img
                    src={'/images/clients/' + p.id + '.webp'}
                    width={logo.w}
                    height={logo.h}
                    alt={p.title + ' case study'}
                    loading="lazy"
                    className={logo.className + ' w-auto opacity-70 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0'}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
