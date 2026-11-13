import { Link } from 'react-router-dom';
import { ArrowRight, Check, KeyRound, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SectionHeading from './SectionHeading.jsx';

/* The two ways to work with us. No prices: every project is quoted after a consultation. */
const PLANS = [
  {
    icon: KeyRound,
    tag: 'Build only',
    title: 'One-off build',
    desc: 'We build your website and hand it over completely. You own it outright.',
    points: ['Full design and build', 'One round of revisions', 'Full ownership, yours to keep', 'Domain and hosting guidance'],
    extraLabel: 'After launch you get',
    extra: ['Full source code and all project files', 'A handover call to walk you through everything', 'Step-by-step hosting set-up instructions'],
  },
  {
    icon: LifeBuoy,
    tag: 'Managed for you',
    title: 'Monthly plan',
    desc: 'We build your site and look after it afterwards: hosting, security and updates.',
    points: ['Everything in the one-off build', 'Hosting and security managed', 'Ongoing changes and updates', 'Priority support'],
    extraLabel: 'Every month we handle',
    extra: ['Hosting on fast, secure servers with SSL', 'Content updates: text, images, new pages', 'Security monitoring and automatic backups'],
    featured: true,
  },
];

function PlanCard({ plan, i }) {
  const { icon: Icon, featured } = plan;
  return (
    <div
      data-reveal
      style={{ '--reveal-i': i }}
      className={cn(
        'relative flex flex-col rounded-[28px] border p-7 md:p-9',
        featured ? 'border-ink bg-ink text-cream shadow-lg' : 'border-ink/10 bg-card text-ink shadow-sm'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={cn('grid size-12 place-items-center rounded-xl', featured ? 'bg-primary text-ink' : 'bg-orange-tint text-orange-ink')}>
          <Icon className="size-6" strokeWidth={2.2} />
        </span>
        {featured && <Badge variant="primary">Most popular</Badge>}
      </div>
      <p className={cn('mt-6 font-display text-xs font-bold uppercase tracking-[0.16em]', featured ? 'text-orange-soft' : 'text-orange-ink')}>{plan.tag}</p>
      <h3 className={cn('mt-2 font-display text-3xl font-bold tracking-[-0.02em]', featured ? 'text-cream' : 'text-ink')}>{plan.title}</h3>
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
  return (
    <section id="pricing" className="bg-sand/70 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          align="center"
          label="Two ways to work with us"
          title="Own it outright,"
          accent="or let us keep it tidy."
          sub="We build your site either way. The difference is who looks after it afterwards. Both are quoted per project after a free consultation."
        />
        <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.title} plan={plan} i={i} />
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
