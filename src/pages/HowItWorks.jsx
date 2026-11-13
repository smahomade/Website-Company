import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cloud, Globe, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import BeforeAfter from '@/components/site/BeforeAfter.jsx';
import Faq from '@/components/home/Faq.jsx';
import CtaBand from '@/components/home/CtaBand.jsx';
import { Button } from '@/components/ui/button';
import { R2 } from '@/lib/site.js';
import useReveal from '@/hooks/useReveal.js';
import { cn } from '@/lib/utils';

const PILLARS = [
  { icon: Globe, title: 'Domain', text: 'Your web address, and how to manage it yourself.' },
  { icon: ShieldCheck, title: 'Security', text: 'SSL and HTTPS set up, explained in plain English.' },
  { icon: Cloud, title: 'Hosting', text: 'Where the site lives, whether you run it or we do.' },
];

const STEPS = [
  {
    stage: 'Design',
    title: 'We get to know you first.',
    body: 'Before anything gets built we talk through your business, what you like, and where you’re starting from. That conversation is the brief.',
    visual: (
      <figure>
        <div className="overflow-hidden rounded-[24px] border border-ink/10 bg-sand shadow-md">
          <img src={R2 + '/images/communication-card.jpg'} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
        </div>
        <figcaption className="mt-3 text-sm text-muted-foreground">Every project starts with a conversation, not a form.</figcaption>
      </figure>
    ),
  },
  {
    stage: 'Build',
    title: 'Then we build it properly.',
    body: 'Clean, fast and mobile-first, tested on real devices until it’s right. You see progress as it happens, not a big reveal at the end.',
    visual: (
      <BeforeAfter
        before={R2 + '/screenshots/Raza/FullWebsiteScreenieRaza-old/razaacademy.co.uk_.jpg'}
        after={R2 + '/screenshots/Raza/FullWebsiteScreenieRaza-new/razaacademy.co.uk_new.jpg'}
        label="Raza Academy home page"
        caption="Raza Academy, before and after. Drag the handle."
      />
    ),
  },
  {
    stage: 'Launch',
    title: 'And hand it over, explained.',
    body: 'When it’s signed off we put it live and walk you through the parts people usually get left in the dark about.',
    visual: (
      <ul className="grid gap-4">
        {PILLARS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-4 rounded-[22px] border border-ink/10 bg-card p-5 shadow-sm">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-tint text-orange-ink">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink">{title}</p>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    ),
  },
];

const STARTS = [
  {
    label: 'Already have a site?',
    title: 'We’ll tell you honestly whether to fix it or start over.',
    text: 'Bring the link. We’ll look at what’s working, what isn’t, and give you a straight answer before any work begins.',
  },
  {
    label: 'Starting from scratch?',
    title: 'Easier than you think.',
    text: 'A logo if you have one, a couple of sites you like the look of, and a few sentences about what you do. That’s enough to begin.',
  },
];

export default function HowItWorks() {
  const pageRef = useRef(null);
  useReveal(pageRef);

  return (
    <div ref={pageRef} className="leading-normal">
      <Seo
        title="How It Works — PixelFold"
        description="Getting a website with PixelFold is refreshingly simple: a conversation, a build you can watch take shape, and a handover that's explained properly."
        path="/how-it-works"
      />
      <PageHeader
        label="How it works"
        title="Three steps."
        accent="No jargon."
        sub="A conversation, a build you can watch take shape, and a handover that’s actually explained."
      >
        <Button asChild size="lg">
          <Link to="/quote">
            Book a free consultation <ArrowRight />
          </Link>
        </Button>
      </PageHeader>

      <section className="bg-background pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl space-y-20 px-5 md:space-y-28 md:px-8">
          {STEPS.map((s, i) => (
            <article key={s.stage} data-reveal className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn(i % 2 && 'lg:order-2')}>
                <span aria-hidden="true" className="font-hand text-6xl font-bold leading-none text-orange-ink">{'0' + (i + 1)}</span>
                <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-orange-ink">{s.stage}</p>
                <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ink text-balance">{s.title}</h2>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              <div className={cn(i % 2 && 'lg:order-1')}>{s.visual}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-espresso py-24 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 md:grid-cols-2 md:px-8">
          {STARTS.map((s, i) => (
            <div key={s.label} data-reveal style={{ '--reveal-i': i }} className="rounded-[28px] border border-cream/10 bg-[#24211d] p-8 md:p-10">
              <p className="font-display text-sm font-bold uppercase tracking-[0.16em] text-orange-soft">{s.label}</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-cream text-balance">{s.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-cream/70">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Faq />
      <CtaBand />
    </div>
  );
}
