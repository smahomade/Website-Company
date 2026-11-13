import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PORTFOLIO } from '@/data/portfolio.js';
import { cn } from '@/lib/utils';
import SectionHeading from './SectionHeading.jsx';

/* The biggest build leads, full width; the other two sit side by side under it */
const FEATURED = 'top-one-salon';

function ProjectCard({ p, featured, i }) {
  const shot = p.caseStudy.shots + '-1-';
  return (
    <article
      data-reveal
      style={{ '--reveal-i': i }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        featured && 'md:col-span-2 lg:flex-row'
      )}
    >
      <div className={cn('relative overflow-hidden border-b border-ink/[0.08] bg-sand', featured && 'lg:w-[58%] lg:shrink-0 lg:border-b-0 lg:border-r')}>
        <img
          src={shot + '1000.webp'}
          srcSet={shot + '600.webp 600w, ' + shot + '1000.webp 1000w'}
          sizes={featured ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 768px) 540px, 100vw'}
          alt={p.title + "'s home page"}
          width="1000"
          height="625"
          loading="lazy"
          className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      </div>
      <div className={cn('flex flex-1 flex-col gap-3 p-6 md:p-7', featured && 'lg:justify-center lg:p-10')}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{p.typeLabel.replace(' Build', ' build')}</Badge>
          <Badge variant="outline">{p.caseStudy.pages}</Badge>
          <span className="text-sm font-semibold text-muted-foreground">{p.industry}</span>
        </div>
        <h3 className={cn('font-display font-bold leading-tight tracking-[-0.02em] text-ink', featured ? 'text-3xl lg:text-4xl' : 'text-2xl')}>{p.title}</h3>
        <p className={cn('leading-relaxed text-muted-foreground', featured && 'lg:text-lg')}>{p.caseStudy.summary}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 lg:mt-2">
          {/* the case-study link covers the whole card; the live-site link sits above it */}
          <Link
            to={'/portfolio/' + p.id}
            className="inline-flex min-h-11 items-center gap-1.5 font-display font-semibold text-ink outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/45"
          >
            Read the case study
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <a
            href={p.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex min-h-11 items-center gap-1 rounded-md text-[15px] font-semibold text-orange-ink outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/45"
          >
            Visit site <ArrowUpRight className="size-4" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  const live = PORTFOLIO.filter((p) => p.status === 'live' && p.caseStudy);
  const ordered = [...live.filter((p) => p.id === FEATURED), ...live.filter((p) => p.id !== FEATURED)];
  return (
    <section id="work" className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            label="Recent work"
            title="Websites already working"
            accent="for real businesses."
            sub="Every one is live today. Open a case study to see what each business needed and how we built it."
          />
          <Button asChild variant="outline" className="self-start md:self-auto">
            <Link to="/portfolio">
              See the full portfolio <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {ordered.map((p, i) => (
            <ProjectCard key={p.id} p={p} featured={p.id === FEATURED} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
