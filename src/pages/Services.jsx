import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, Mail, MessagesSquare, Pause, Play } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import ServiceDialog from '@/components/site/ServiceDialog.jsx';
import { FEATURE_ICON, FEATURE_TONE, KIND_ICON } from '@/components/site/packageIcons.js';
import SectionHeading from '@/components/home/SectionHeading.jsx';
import BrowserFrame from '@/components/home/BrowserFrame.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { SERVICES, SERVICE_TABS } from '@/data/services.js';
import { HERO_CARDS } from '@/data/heroCards.js';
import { CONTACT } from '@/lib/site.js';
import { cn } from '@/lib/utils';

/* Recent builds, shown beside the packages of the tab they were: real client sites, each under the
   package it actually was (`pack`). There has been no Starter build, so that tab shows none. */
const EXAMPLES = [
  { name: 'Change Work Therapies', short: 'Change Work', pack: 'business', note: 'A seven-page site for a therapy practice, calm and trust-led.' },
  { name: 'Raza Academy', short: 'Raza', pack: 'business', note: 'An eight-page rebuild for an education provider.' },
  { name: 'Top One Salon', short: 'Top One', pack: 'custom', note: 'A bespoke build of 40+ pages for a London salon.' },
].map((e) => {
  const card = HERO_CARDS.find((c) => c.name === e.name);
  return { ...e, url: card.url, still: card.tourPoster || card.img, tour: card.tour };
});

const INCLUDED = ['Mobile-first design', 'Basic on-page SEO', 'Contact form', 'Handover explained in plain English'];

const EXPECT = [
  { t: 'Free consultation', d: 'A short conversation about your business and what you need.' },
  { t: 'Quote within 24 hours', d: 'Scope, timeline and price, agreed before any work starts.' },
  { t: 'Progress as it happens', d: 'You see the site take shape rather than waiting for a big reveal.' },
  { t: 'Launch and handover', d: 'We put it live and walk you through domain, hosting and security.' },
];

/* One recent build in a browser window, with the others of its package a click away. Its tour
   plays only when asked: the mouse over the window, or the button (touch and keyboard). The video
   isn't fetched until then. */
function ExampleBuild({ list, tab }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const ex = list[Math.min(index, list.length - 1)];

  const play = () => {
    setPlaying(true);
    requestAnimationFrame(() => videoRef.current?.play()?.catch(() => setPlaying(false)));
  };
  const stop = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setPlaying(false);
  };
  const pick = (i) => {
    stop();
    setIndex(i);
  };

  return (
    <div className="rounded-[24px] border border-ink/10 bg-card p-4">
      <div
        onPointerEnter={(e) => e.pointerType === 'mouse' && play()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && stop()}
      >
        <BrowserFrame url={ex.url} className="shadow-md">
          <div className="relative aspect-video bg-sand">
            <img src={ex.still} alt={ex.name + '’s website'} loading="lazy" className="absolute inset-0 size-full object-cover object-top" />
            {playing && <video key={ex.tour} ref={videoRef} src={ex.tour} muted loop playsInline aria-hidden="true" tabIndex={-1} className="absolute inset-0 size-full object-cover" />}
            <button
              type="button"
              onClick={playing ? stop : play}
              aria-label={(playing ? 'Stop the ' : 'Play the ') + ex.name + ' tour'}
              className="absolute bottom-3 right-3 grid size-11 cursor-pointer place-items-center rounded-full bg-cream/95 text-ink shadow-md outline-none transition-colors hover:bg-white focus-visible:ring-[3px] focus-visible:ring-ring/60"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          </div>
        </BrowserFrame>
      </div>
      <div className="px-2 pb-2 pt-5">
        <p className="font-display text-xl font-bold text-ink">{ex.name}</p>
        <p className="mt-0.5 text-sm font-semibold text-orange-ink">A recent {tab} build</p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{ex.note}</p>
        {list.length > 1 && (
          <div role="group" aria-label="Choose a build" className="mt-4 flex flex-wrap gap-2">
            {list.map((e, i) => (
              <button
                key={e.name}
                type="button"
                aria-pressed={e === ex}
                onClick={() => pick(i)}
                className="min-h-10 cursor-pointer rounded-full border border-ink/15 px-4 text-sm font-semibold text-ink/75 outline-none transition-colors hover:border-ink/40 focus-visible:ring-[3px] focus-visible:ring-ring/45 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-cream"
              >
                {e.short}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Included() {
  return (
    <div className="rounded-[24px] border border-ink/10 bg-sand/70 p-6">
      <h2 className="font-display text-lg font-bold text-ink">Every package includes</h2>
      <ul className="mt-4 space-y-2.5">
        {INCLUDED.map((x) => (
          <li key={x} className="flex items-center gap-3 font-semibold text-ink">
            <span className="grid size-5 place-items-center rounded-full bg-ink text-cream">
              <Check aria-hidden="true" className="size-3" strokeWidth={3} />
            </span>
            {x}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-ink/10 pt-4 text-sm leading-relaxed text-muted-foreground">
        No fixed price list. Each package is scoped and quoted around your project, and agreed before any work starts.
      </p>
    </div>
  );
}

function PackageCard({ s, onDetails }) {
  const Icon = KIND_ICON[s.iconKind] || KIND_ICON.key;
  return (
    <article className="rounded-[24px] border border-ink/10 bg-card p-6 transition-shadow hover:shadow-md md:p-7">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-tint text-orange-ink">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ink/65">{s.tierLabel}</span>
            {s.ribbon && <Badge variant={s.ribbon.own ? 'dark' : 'primary'}>{s.ribbon.text}</Badge>}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-ink">{s.title}</h3>
          <p className="mt-1 text-muted-foreground">{s.tagline}</p>
        </div>
      </div>
      <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {s.features.map((f) => {
          const item = typeof f === 'string' ? { text: f, type: 'standard' } : f;
          const FIcon = FEATURE_ICON[item.type] || FEATURE_ICON.standard;
          return (
            <li key={item.text} className="flex items-start gap-2.5 text-[15px] font-semibold text-ink">
              <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', FEATURE_TONE[item.type] || FEATURE_TONE.standard)}>
                <FIcon aria-hidden="true" className="size-3" strokeWidth={3} />
              </span>
              {item.text}
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5">
        <Button asChild>
          <Link to="/quote">Book a consultation</Link>
        </Button>
        <Button variant="ghost" onClick={() => onDetails(s.key)} aria-haspopup="dialog">
          Read more <span className="sr-only">about {s.title}</span>
        </Button>
      </div>
    </article>
  );
}

export default function Services() {
  const [tab, setTab] = useState('starter');
  const [modalKey, setModalKey] = useState(null);

  /* /services?package=business opens on that package (the footer's links). Read in an effect: the
     prebuilt page always starts on Starter, and the first render has to match it */
  const { search } = useLocation();
  useLayoutEffect(() => {
    const wanted = new URLSearchParams(search).get('package');
    if (SERVICE_TABS.some((t) => t.id === wanted)) setTab(wanted);
  }, [search]);

  const service = modalKey ? SERVICES.find((s) => s.key === modalKey) : null;

  return (
    <div className="leading-normal">
      <Seo
        title="Services — PixelFold"
        description="PixelFold builds single-page, multi-page and fully custom websites for small businesses, with managed hosting and support if you want it. Each project is scoped and quoted individually."
        path="/services"
      />
      <PageHeader
        title="Websites built around"
        accent="your business."
        sub="Websites for small businesses across the UK. Every project is scoped and quoted around what you actually need."
        chips={['Quoted per project', 'Mobile-first design', 'UK-based', 'Plain English']}
      />

      <section id="services" className="bg-background pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="sr-only">Packages</h2>
          {/* every tab's packages are in the page, so search engines read them all; forceMount keeps
              them all showing too, so the ones not chosen are hidden by their state */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="Package type" className="grid w-full grid-cols-3 sm:inline-flex sm:w-fit">
              {SERVICE_TABS.map((t) => {
                const Icon = KIND_ICON[t.iconKind];
                return (
                  <TabsTrigger key={t.id} value={t.id} className="flex-col gap-0 px-3 py-2 sm:flex-row sm:gap-2 sm:px-5">
                    {Icon && <Icon aria-hidden="true" className="hidden size-5 sm:block" />}
                    <span>{t.label}</span>
                    <span className="text-xs font-semibold sm:hidden">{t.sub}</span>
                    <span className="hidden text-sm font-medium sm:inline">· {t.sub}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {SERVICE_TABS.map((t) => {
              const builds = EXAMPLES.filter((e) => e.pack === t.id);
              return (
                <TabsContent key={t.id} value={t.id} forceMount className="mt-8 grid gap-6 data-[state=inactive]:hidden lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
                  <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                    {builds.length > 0 && <ExampleBuild list={builds} tab={t.id} />}
                    <Included />
                  </aside>
                  <div className="space-y-5">
                    {SERVICES.filter((s) => s.category === t.id).map((s) => (
                      <PackageCard key={s.key} s={s} onDetails={setModalKey} />
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>

      <section className="bg-sand/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading title="How a project runs," accent="start to finish." />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXPECT.map((e, i) => (
              <li key={e.t} className="rounded-[24px] border border-ink/10 bg-card p-6">
                <span aria-hidden="true" className="font-hand text-[42px] font-bold leading-none text-orange-ink">{'0' + (i + 1)}</span>
                <p className="mt-3 font-display text-lg font-bold text-ink">{e.t}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{e.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-espresso py-24 text-cream md:py-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading tone="dark" title="Tell us about" accent="your project." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="flex flex-col rounded-[24px] bg-primary p-7 text-ink">
              <span className="grid size-12 place-items-center rounded-xl bg-ink text-cream">
                <MessagesSquare aria-hidden="true" className="size-6" />
              </span>
              <Badge variant="dark" className="mt-5">Recommended</Badge>
              <h3 className="mt-3 font-display text-2xl font-bold">Book a free consultation</h3>
              <p className="mt-2 flex-1 leading-relaxed">Tell us what you need and we come back within 24 hours with a clear scope, timeline and quote. No obligation.</p>
              <Button asChild variant="dark" className="mt-6 self-start">
                <Link to="/quote">
                  Start your brief <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="flex flex-col rounded-[24px] border border-cream/10 bg-[#24211d] p-7">
              <span className="grid size-12 place-items-center rounded-xl bg-cream/10 text-cream">
                <WhatsAppIcon size={22} />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-cream">Message on WhatsApp</h3>
              <p className="mt-2 flex-1 leading-relaxed text-cream/70">Prefer to talk it through? Send a message and we’ll arrange a quick call at a time that suits you.</p>
              <Button asChild variant="outline-light" className="mt-6 self-start">
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>
              </Button>
            </div>
            <div className="flex flex-col rounded-[24px] border border-cream/10 bg-[#24211d] p-7">
              <span className="grid size-12 place-items-center rounded-xl bg-cream/10 text-cream">
                <Mail aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-cream">Send an email</h3>
              <p className="mt-2 flex-1 leading-relaxed text-cream/70">Email what you need and we’ll reply within 24 hours with next steps.</p>
              <Button asChild variant="outline-light" className="mt-6 self-start">
                <a href={'mailto:' + CONTACT.email}>Email us</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ServiceDialog service={service} onClose={() => setModalKey(null)} />
    </div>
  );
}
