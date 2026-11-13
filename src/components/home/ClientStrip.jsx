import { Link } from 'react-router-dom';
import { PORTFOLIO } from '@/data/portfolio.js';

/* The live client sites by name, each linking to its case study. A still row, no ticker. */
export default function ClientStrip() {
  const live = PORTFOLIO.filter((p) => p.status === 'live' && p.caseStudy);
  return (
    <section aria-label="Our clients" className="border-y border-ink/[0.08] bg-sand/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-7 md:flex-row md:justify-between md:px-8">
        <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink/70">Live for businesses like yours</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {live.map((p) => (
            <li key={p.id}>
              <Link
                to={'/portfolio/' + p.id}
                className="flex min-h-11 items-baseline gap-2 rounded-md font-display text-lg font-bold tracking-[-0.01em] text-ink/80 transition-colors outline-none hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring/45"
              >
                {p.title}
                <span className="text-xs font-semibold text-muted-foreground">{p.industry}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
