import { Link } from 'react-router-dom';
import { ArrowRight, Cloud, Globe, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import BeforeAfter from '@/components/site/BeforeAfter.jsx';
import BrowserFrame from '@/components/home/BrowserFrame.jsx';
import Faq from '@/components/home/Faq.jsx';
import CtaBand from '@/components/home/CtaBand.jsx';
import { Button } from '@/components/ui/button';
import { HERO_CARDS } from '@/data/heroCards.js';
import { R2 } from '@/lib/site.js';
import { cn } from '@/lib/utils';

const PILLARS = [
  { icon: Globe, title: 'Domain', text: 'Your web address, and how to manage it yourself.' },
  { icon: ShieldCheck, title: 'Security', text: 'SSL and HTTPS set up, explained in plain English.' },
  { icon: Cloud, title: 'Hosting', text: 'Where the site lives, whether you run it or we do.' },
];

/* The questions the first conversation covers, written on a note like the home page's steps */
const QUESTIONS = [
  'What do you do, and who for?',
  'What do your customers need to see?',
  'What makes you stand out?',
  'Have you got a site already?',
  'Any sites you like the look of?',
];

function FirstChat() {
  return (
    <figure>
      <div className="rounded-[25px] border border-ink/[0.06] bg-white p-2 shadow-[0_14px_30px_-10px_rgba(60,40,0,0.28)]">
        <div className="rounded-[18px] border border-primary/15 bg-orange-tint px-6 pb-6 pt-6 md:px-8">
          <p className="font-display text-lg font-bold text-ink">What we’ll ask</p>
          {/* ruled like a notepad: one line under each question */}
          <ul className="mt-2 bg-[linear-gradient(transparent_43px,rgba(17,17,17,0.12)_43px)] bg-[length:100%_44px]">
            {QUESTIONS.map((q) => (
              <li key={q} className="font-hand text-[25px] leading-[44px] text-ink/85 md:text-[28px]">
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">Every project starts with a conversation, not a form.</figcaption>
    </figure>
  );
}

/* Three client sites, each designed around its own brand: fanned out, the latest on top */
const LOOKS = ['Raza Academy', 'Top One Salon', 'Change Work Therapies'].map((name) => {
  const card = HERO_CARDS.find((c) => c.name === name);
  const id = name.toLowerCase().replace(/ /g, '-');
  return { name, url: card.url, small: '/images/home/site-' + id };
});
const FAN = ['left-0 top-0', 'left-[11%] top-[18%]', 'left-[22%] top-[36%]'];

function ThreeLooks() {
  return (
    <figure>
      <div className="relative aspect-[16/13]">
        {LOOKS.map((l, i) => (
          <BrowserFrame key={l.name} url={l.url} className={cn('absolute w-[78%]', FAN[i])}>
            <img
              src={l.small + '-800.webp'}
              srcSet={l.small + '-480.webp 480w, ' + l.small + '-800.webp 800w'}
              sizes="(min-width: 1024px) 420px, 78vw"
              width="800"
              height="450"
              alt={l.name + '’s home page'}
              loading="lazy"
              className="aspect-video w-full object-cover object-top"
            />
          </BrowserFrame>
        ))}
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">Three clients, three looks: each design starts from the business’s own brand.</figcaption>
    </figure>
  );
}

/* The same four stages as the home page */
const STEPS = [
  {
    stage: 'Consultation',
    title: 'We get to know you first.',
    body: 'Before anything gets built we talk through your business, what you like, and where you’re starting from. That conversation is the brief.',
    visual: <FirstChat />,
  },
  {
    stage: 'Design',
    title: 'Designed around your brand.',
    body: 'We sketch your layout first, then design it around your brand. You see it before a line of code is written.',
    visual: <ThreeLooks />,
  },
  {
    stage: 'Build',
    title: 'Then we build it properly.',
    body: 'Clean, fast and mobile-first, and tested on real devices. You see progress as it happens, not a big reveal at the end.',
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
          <li key={title} className="flex items-center gap-4 rounded-[22px] border border-ink/10 bg-card p-5">
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

/* The two places people start from: the question is the heading */
const STARTS = [
  {
    title: 'Already have a site?',
    text: 'Bring the link. We’ll look at what’s working and what isn’t, and tell you whether to fix it or start over before any work begins.',
  },
  {
    title: 'Starting from scratch?',
    text: 'A logo if you have one, a couple of sites you like the look of, and a few sentences about what you do. That’s enough to begin.',
  },
];

export default function HowItWorks() {

  return (
    <div className="leading-normal">
      <Seo
        title="How It Works — PixelFold"
        description="Getting a website with PixelFold: a conversation, a design you see first, a build you can watch take shape, and a handover that's explained properly."
        path="/how-it-works"
      />
      <PageHeader
        title="Four steps."
        accent="Plain English."
        sub="A conversation, a design you see first, a build you can watch take shape, and a handover that’s actually explained."
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
            <article key={s.stage} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn(i % 2 && 'lg:order-2')}>
                <p className="flex items-baseline gap-3 font-hand font-bold leading-none text-orange-ink">
                  <span aria-hidden="true" className="text-6xl">{'0' + (i + 1)}</span>
                  <span className="text-[34px]">{s.stage}</span>
                </p>
                <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ink text-balance">{s.title}</h2>
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
            <div key={s.title} className="rounded-[28px] border border-cream/10 bg-[#24211d] p-8 md:p-10">
              <h2 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-cream text-balance">{s.title}</h2>
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
