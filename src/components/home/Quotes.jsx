import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '@/data/testimonials.js';
import { PORTFOLIO } from '@/data/portfolio.js';
import SectionHeading from './SectionHeading.jsx';

/* Clients in their own words (data/testimonials.js). Shows nothing until there are some; no
   star ratings. */
export default function Quotes() {
  if (!TESTIMONIALS.length) return null;
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading label="In their words" title="What our clients" accent="say about working with us." />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => {
            const p = PORTFOLIO.find((x) => x.id === t.client);
            return (
              <figure key={t.client + t.name} data-reveal style={{ '--reveal-i': i % 3 }} className="flex flex-col rounded-2xl border border-ink/10 bg-card p-7 shadow-sm">
                <blockquote className="font-display text-lg font-medium leading-relaxed text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-5 text-[15px]">
                  <strong className="font-bold text-ink">{t.name}</strong>
                  {t.role && <span className="text-muted-foreground">, {t.role}</span>}
                  {p && (
                    <Link to={'/portfolio/' + p.id} className="mt-1 block font-semibold text-orange-ink hover:underline">
                      {p.title}
                    </Link>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
