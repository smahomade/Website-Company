import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SectionHeading from './SectionHeading.jsx';

/* The two ways to work with us. No prices: every project is quoted after a consultation. */
const PLANS = [
  {
    title: 'One-off build',
    desc: 'We build your website and hand it over completely. You own it outright.',
    points: ['Full design and build', 'One round of revisions', 'Full ownership, yours to keep', 'Domain and hosting guidance'],
    extraLabel: 'After launch you get',
    extra: ['Full source code and all project files', 'A handover call to walk you through everything', 'Step-by-step hosting set-up instructions'],
  },
  {
    title: 'Monthly plan',
    desc: 'We build your site and look after it afterwards: hosting, security and updates.',
    points: ['Everything in the one-off build', 'Hosting and security managed', 'Ongoing changes and updates', 'Priority support'],
    extraLabel: 'Every month we handle',
    extra: ['Hosting on fast, secure servers with SSL', 'Content updates: text, images, new pages', 'Security monitoring and automatic backups'],
    featured: true,
  },
];

function PlanCard({ plan, id, hiddenOnPhones }) {
  const { featured } = plan;
  return (
    <div
      id={id}
      className={cn(
        'relative flex flex-col rounded-[28px] border p-7 md:p-9',
        hiddenOnPhones && 'max-md:hidden',
        featured ? 'border-ink bg-ink text-cream shadow-lg' : 'border-ink/10 bg-card text-ink'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className={cn('font-display text-3xl font-bold tracking-[-0.02em]', featured ? 'text-cream' : 'text-ink')}>{plan.title}</h3>
        {featured && <Badge variant="primary" className="mt-2">Most popular</Badge>}
      </div>
      <p className={cn('mt-3 leading-relaxed', featured ? 'text-cream/70' : 'text-muted-foreground')}>{plan.desc}</p>

      <ul className="mt-7 space-y-3">
        {plan.points.map((pt) => (
          <li key={pt} className="flex items-start gap-3 font-semibold">
            <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', featured ? 'bg-primary text-ink' : 'bg-ink text-cream')}>
              <Check className="size-3" strokeWidth={3} />
            </span>
            {pt}
          </li>
        ))}
      </ul>

      <div className={cn('mt-7 border-t pt-6', featured ? 'border-cream/10' : 'border-ink/10')}>
        <p className={cn('text-sm font-bold', featured ? 'text-cream/60' : 'text-ink/65')}>{plan.extraLabel}</p>
        <ul className={cn('mt-3 space-y-2 text-[15px]', featured ? 'text-cream/75' : 'text-muted-foreground')}>
          {plan.extra.map((x) => (
            <li key={x} className="flex gap-2.5">
              <span aria-hidden="true" className={cn('mt-[0.6em] size-1.5 shrink-0 rounded-full', featured ? 'bg-orange-soft' : 'bg-primary')} />
              {x}
            </li>
          ))}
        </ul>
      </div>

      <Button asChild size="lg" variant={featured ? 'default' : 'outline-dark'} className="mt-9 w-full">
        <Link to="/quote">Book a consultation</Link>
      </Button>
    </div>
  );
}

export default function Plans() {
  const [shown, setShown] = useState(0); /* phones only: which plan is on screen */
  return (
    <section id="pricing" className="bg-sand/70 py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          align="center"
          title="Own it outright,"
          accent="or let us keep it tidy."
          sub="We build your site either way. The difference is who looks after it afterwards. Both are quoted per project after a free consultation."
        />
        {/* phones: a switch between the two plans, so the page isn't two long cards in a row */}
        <div role="group" aria-label="Show a plan" className="mx-auto mt-10 flex max-w-sm rounded-full border border-ink/10 bg-white p-1 md:hidden">
          {PLANS.map((plan, i) => (
            <button
              key={plan.title}
              type="button"
              aria-pressed={shown === i}
              aria-controls={'plan-' + i}
              onClick={() => setShown(i)}
              className={cn(
                'min-h-11 flex-1 cursor-pointer rounded-full px-4 font-display text-[15px] font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/45',
                shown === i ? 'bg-ink text-cream' : 'text-ink/70 hover:text-ink'
              )}
            >
              {plan.title}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-4 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.title} plan={plan} id={'plan-' + i} hiddenOnPhones={i !== shown} />
          ))}
        </div>
        <p className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex min-h-11 items-center gap-2 rounded-md font-display font-semibold text-ink outline-none hover:text-orange-ink focus-visible:ring-[3px] focus-visible:ring-ring/45"
          >
            Compare every package <ArrowRight className="size-4" />
          </Link>
        </p>
      </div>
    </section>
  );
}
