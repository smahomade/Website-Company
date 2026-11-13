import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Images } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import ProjectViewer from '@/components/site/ProjectViewer.jsx';
import Quotes from '@/components/home/Quotes.jsx';
import CtaBand from '@/components/home/CtaBand.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PORTFOLIO } from '@/data/portfolio.js';
import { LOGO } from '@/lib/site.js';
import useReveal from '@/hooks/useReveal.js';

const host = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function ProjectCard({ p, i, onPages }) {
  const shot = p.caseStudy ? p.caseStudy.shots + '-1-' : null;
  return (
    <article data-reveal style={{ '--reveal-i': i % 2 }} className="group flex flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative overflow-hidden border-b border-ink/[0.08] bg-sand">
        <img
          src={shot ? shot + '1000.webp' : p.preview}
          srcSet={shot ? shot + '600.webp 600w, ' + shot + '1000.webp 1000w' : undefined}
          sizes="(min-width: 1024px) 560px, 100vw"
          alt={p.title + '’s home page'}
          width="1000"
          height="625"
          loading={i < 2 ? 'eager' : 'lazy'}
          className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{p.typeLabel.replace(' Build', ' build')}</Badge>
          {p.caseStudy && <Badge variant="outline">{p.caseStudy.pages}</Badge>}
          <span className="text-sm font-semibold text-muted-foreground">{p.industry}</span>
          {p.status === 'live' && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-[#1f7a46]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#22a35a]" />
              Live
            </span>
          )}
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-ink">{p.title}</h2>
        <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{p.caseStudy ? p.caseStudy.summary : p.desc}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-5">
          {p.caseStudy && (
            <Button asChild>
              <Link to={'/portfolio/' + p.id}>
                Read the case study <ArrowRight />
              </Link>
            </Button>
          )}
          {p.slides && (
            <Button variant="outline" onClick={() => onPages(p)} aria-haspopup="dialog">
              <Images /> See every page
            </Button>
          )}
          {p.liveUrl && (
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 px-2 text-[15px] font-semibold text-orange-ink outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/45"
            >
              {host(p.liveUrl)} <ArrowUpRight className="size-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Portfolio() {
  const pageRef = useRef(null);
  const [open, setOpen] = useState(null);
  useReveal(pageRef);

  return (
    <div ref={pageRef} className="leading-normal">
      <Seo
        title="Portfolio — PixelFold"
        description="Live websites PixelFold has designed and built for real UK businesses, from an education provider to a London salon, each with a case study of what we did and why."
        path="/portfolio"
      />
      <PageHeader
        label="Portfolio"
        title="Real websites for"
        accent="real businesses."
        sub="All of them live today. Open any one to flick through every page, or read the case study behind it."
        chips={['Live client sites', 'Hand-built', 'Mobile-friendly', 'UK-based']}
      />

      <section className="bg-background pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 md:px-8 lg:grid-cols-2">
          {PORTFOLIO.map((p, i) => (
            <ProjectCard key={p.id} p={p} i={i} onPages={setOpen} />
          ))}
          {/* the open slot: invites the next project instead of showing a dummy card */}
          <div data-reveal style={{ '--reveal-i': 1 }} className="flex flex-col items-start justify-center rounded-[28px] border-2 border-dashed border-ink/15 bg-sand/60 p-8 md:p-10">
            <span className="grid size-20 place-items-center rounded-[24px] bg-cream p-2.5 shadow-sm">
              <img src={LOGO.mark} alt="" width="202" height="205" className="h-auto w-full" />
            </span>
            <p className="mt-6 font-display text-sm font-bold uppercase tracking-[0.16em] text-orange-ink">Next up</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.02em] text-ink">Your website could be here.</h2>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
              We’re taking on new projects. Tell us what you need and we’ll come back within 24 hours with a plan.
            </p>
            <Button asChild className="mt-6">
              <Link to="/quote">
                Start a project <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Quotes />
      <CtaBand />
      <ProjectViewer project={open} onClose={() => setOpen(null)} />
    </div>
  );
}
