import { useLayoutEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check, MessagesSquare, Minus, PenLine } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import ServiceDialog from '@/components/site/ServiceDialog.jsx';
import TourFrame from '@/components/site/TourFrame.jsx';
import { KIND_ICON } from '@/components/site/packageIcons.js';
import SectionHeading from '@/components/home/SectionHeading.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { SERVICES, SERVICE_TABS } from '@/data/services.js';
import { HERO_CARDS } from '@/data/heroCards.js';
import { CONTACT } from '@/lib/site.js';
import { cn } from '@/lib/utils';

/* Recent builds, shown under the packages of the tab they were: real client sites, each under the
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

/* The same four stages as the home page and How it works */
const EXPECT = [
  { t: 'Consultation', d: 'A free conversation about your business and what you need, then a clear scope, timeline and quote within 24 hours.' },
  { t: 'Design', d: 'We sketch your layout first, then design it around your brand. You see it before it’s built.' },
  { t: 'Build', d: 'Hand-built, fast and tested on real phones. You see it take shape as it happens.' },
  { t: 'Launch', d: 'We put it live and walk you through the domain, hosting and security.' },
];

/* The site is the same at every level of a Starter or Business package; this is what changes.
   `adds` is what a level adds to the one before it (the phone layout lists only that). */
const LEVELS = {
  'tier-base': { plan: 'One-off build', planNote: 'Yours outright', hosting: false, changes: false, accounts: false },
  'tier-managed': {
    plan: 'Monthly plan',
    hosting: true,
    changes: 'Minor, within 48 hours',
    accounts: false,
    adds: ['Hosting and domain, handled for you', 'Minor changes, within 48 hours'],
  },
  'tier-priority': { plan: 'Monthly plan', hosting: true, changes: 'Major and minor, under 48 hours', accounts: false, adds: ['Major changes too, under 48 hours'] },
  'tier-advanced': {
    plan: 'Monthly plan',
    hosting: true,
    changes: 'Major and minor, under 48 hours',
    accounts: 'Log-in and sign-up features',
    adds: ['Log-in and sign-up features'],
  },
};
const ROWS = [
  { key: 'plan', label: 'Plan' },
  { key: 'hosting', label: 'Hosting and domain', yes: 'Handled for you', no: 'You arrange them' },
  { key: 'changes', label: 'Changes after launch' },
  { key: 'accounts', label: 'Log-in and accounts' },
];
const SITE = { starter: 'a 1-page site', business: 'a 3–6 page site' };

function Tick({ className }) {
  return (
    <span className={cn('grid size-5 shrink-0 place-items-center rounded-full bg-ink text-cream', className)}>
      <Check aria-hidden="true" className="size-3" strokeWidth={3} />
    </span>
  );
}

/* "Recommended" from the data; "Own it outright" is the Plan row instead */
function Ribbon({ s }) {
  return s.ribbon && !s.ribbon.own ? <Badge variant="primary">{s.ribbon.text}</Badge> : null;
}

function Cell({ row, level }) {
  const v = level[row.key];
  if (row.key === 'plan') {
    return (
      <>
        <span className="font-semibold text-ink">{v}</span>
        {level.planNote && <span className="block text-sm text-muted-foreground">{level.planNote}</span>}
      </>
    );
  }
  if (!v) {
    return row.no ? (
      <span className="text-muted-foreground">{row.no}</span>
    ) : (
      <span className="text-ink/40">
        <Minus aria-hidden="true" className="size-4" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return (
    <span className="flex items-start gap-2.5 font-semibold text-ink">
      <Tick className="mt-0.5" />
      {v === true ? row.yes : v}
    </span>
  );
}

/* From md up: one table, the levels across and what changes between them down the side */
function Compare({ packs, tab, onDetails }) {
  return (
    <div className="hidden overflow-hidden rounded-[24px] border border-ink/10 bg-card md:block">
      <table className="w-full table-fixed border-collapse text-left text-[15px] leading-snug">
        <caption className="sr-only">{tab.label} packages compared</caption>
        <colgroup>
          <col className="w-[19%]" />
          {packs.map((s) => (
            <col key={s.key} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <td />
            {packs.map((s) => (
              <th key={s.key} scope="col" className="border-l border-ink/10 px-5 pb-5 pt-6 align-top font-normal">
                <span className="flex h-6 items-center">
                  <Ribbon s={s} />
                </span>
                <span className="mt-2 block font-display text-lg font-bold leading-tight tracking-[-0.01em] text-ink">{s.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{s.tagline}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.key} className="border-t border-ink/10">
              <th scope="row" className="px-5 py-4 align-top font-display font-bold text-ink">
                {r.label}
              </th>
              {packs.map((s) => (
                <td key={s.key} className="border-l border-ink/10 px-5 py-4 align-top">
                  <Cell row={r} level={LEVELS[s.tier]} />
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-ink/10">
            <td />
            {packs.map((s) => (
              <td key={s.key} className="border-l border-ink/10 px-3 py-3">
                <Button variant="ghost" size="sm" onClick={() => onDetails(s.key)} aria-haspopup="dialog">
                  Read more <span className="sr-only">about {s.title}</span>
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* Phones: one card per level, each listing only what it adds to the one before */
function Levels({ packs, onDetails }) {
  return (
    <ol className="space-y-4 md:hidden">
      {packs.map((s, i) => {
        const level = LEVELS[s.tier];
        return (
          <li key={s.key} className="rounded-[24px] border border-ink/10 bg-card p-5">
            <div>
                <h3 className="font-display text-xl font-bold leading-tight tracking-[-0.01em] text-ink">{s.title}</h3>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  {level.plan}
                  {level.planNote && ', ' + level.planNote.toLowerCase()}
                </p>
                {s.ribbon && !s.ribbon.own && (
                  <div className="mt-2">
                    <Ribbon s={s} />
                  </div>
                )}
            </div>
            {i === 0 ? (
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">You arrange hosting and the domain yourself.</p>
            ) : (
              <>
                <p className="mt-4 text-[15px] text-ink/70">{i === 1 ? 'The same site, plus:' : 'Everything in ' + packs[i - 1].title + ', plus:'}</p>
                <ul className="mt-2.5 space-y-2">
                  {level.adds.map((a) => (
                    <li key={a} className="flex items-start gap-2.5 text-[15px] font-semibold text-ink">
                      <Tick className="mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Button variant="ghost" size="sm" className="-ml-3 mt-3" onClick={() => onDetails(s.key)} aria-haspopup="dialog">
              Read more <span className="sr-only">about {s.title}</span>
            </Button>
          </li>
        );
      })}
    </ol>
  );
}

/* The Custom tab's two packages aren't levels of one another, so they stay as cards */
function CustomCard({ s, onDetails }) {
  return (
    <article className="flex flex-col rounded-[24px] border border-ink/10 bg-card p-6 md:p-7">
      <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">{s.title}</h3>
      <p className="mt-1 text-muted-foreground">{s.tagline}</p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {s.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[15px] font-semibold text-ink">
            <Tick className="mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="-ml-3 mt-5 self-start" onClick={() => onDetails(s.key)} aria-haspopup="dialog">
        Read more <span className="sr-only">about {s.title}</span>
      </Button>
    </article>
  );
}

/* One recent build in a browser window, its tour playing only when asked (the mouse over it, or
   the button), with the others of its package a click away */
function ExampleBuild({ list, tab }) {
  const [index, setIndex] = useState(0);
  const ex = list[Math.min(index, list.length - 1)];
  return (
    <div className="grid items-center gap-5 rounded-[24px] border border-ink/10 bg-card p-4 md:grid-cols-[1.25fr_1fr] md:gap-8 md:p-5">
      <TourFrame key={ex.name} name={ex.name} url={ex.url} still={ex.still} tour={ex.tour} hoverPlay />
      <div className="px-2 pb-2 md:px-0 md:pb-0 md:pr-4">
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
                onClick={() => setIndex(i)}
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

/* What any package comes with, whichever tab: beside the page heading */
function Included() {
  return (
    <div className="rounded-[24px] bg-sand/80 p-6 md:p-7">
      <h2 className="font-display text-xl font-bold text-ink">Every package includes</h2>
      <ul className="mt-4 space-y-2.5">
        {INCLUDED.map((x) => (
          <li key={x} className="flex items-start gap-3 font-semibold text-ink">
            <Tick className="mt-0.5" />
            {x}
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-ink/10 pt-4 text-[15px] leading-relaxed text-muted-foreground">
        No fixed price list. Each package is scoped and quoted around your project, and agreed before any work starts.
      </p>
    </div>
  );
}

/* Under the tabs, for every tab: the one booking button */
function NotSure() {
  return (
    <div className="mt-10 flex flex-col gap-4 rounded-[24px] border border-ink/10 bg-card p-6 sm:flex-row sm:items-center sm:justify-between md:mt-12 md:px-8">
      <p className="text-lg leading-relaxed text-ink">
        <span className="font-display font-bold">Not sure which suits you?</span>{' '}
        <span className="text-muted-foreground">Ask in the free consultation.</span>
      </p>
      <Button asChild className="shrink-0 self-start sm:self-auto">
        <Link to="/quote">
          Book a consultation <ArrowRight />
        </Link>
      </Button>
    </div>
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
        aside={<Included />}
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
              const packs = SERVICES.filter((s) => s.category === t.id);
              const builds = EXAMPLES.filter((e) => e.pack === t.id);
              const levelled = packs.every((s) => LEVELS[s.tier]);
              return (
                <TabsContent key={t.id} value={t.id} forceMount className="mt-8 space-y-6 data-[state=inactive]:hidden">
                  {levelled ? (
                    <>
                      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        Every {t.label} package is {SITE[t.id]}, designed for phones first, with a contact form and Google Maps. Here’s what changes between them.
                      </p>
                      <Compare packs={packs} tab={t} onDetails={setModalKey} />
                      <Levels packs={packs} onDetails={setModalKey} />
                    </>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {packs.map((s) => (
                        <CustomCard key={s.key} s={s} onDetails={setModalKey} />
                      ))}
                    </div>
                  )}
                  {builds.length > 0 && <ExampleBuild list={builds} tab={t.id} />}
                </TabsContent>
              );
            })}
          </Tabs>

          <NotSure />
        </div>
      </section>

      <section className="bg-sand/70 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading title="How a project runs, start to finish." />
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
          <SectionHeading tone="dark" title="Tell us about your project." />
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
                <PenLine aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-cream">Send a message</h3>
              <p className="mt-2 flex-1 leading-relaxed text-cream/70">Write down what you need and we’ll reply within 24 hours with next steps.</p>
              <Button asChild variant="outline-light" className="mt-6 self-start">
                <Link to="/contact">Open the contact form</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ServiceDialog service={service} onClose={() => setModalKey(null)} />
    </div>
  );
}
