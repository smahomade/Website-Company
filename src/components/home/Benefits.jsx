import { FileCode2, FileText, FolderOpen, Images } from 'lucide-react';
import { LOGO } from '@/lib/site.js';
import { cn } from '@/lib/utils';
import SectionHeading from './SectionHeading.jsx';

/* The same client site in a browser window and on a phone: real screenshots, not a drawing */
const CWT = '/images/home/site-change-work-therapies';

function ScreensVisual() {
  return (
    <div aria-hidden="true" className="relative h-[220px]">
      <div className="absolute left-0 top-0 w-[82%] overflow-hidden rounded-xl border border-ink/10 bg-white">
        <div className="flex h-6 items-center gap-1 border-b border-ink/[0.08] bg-sand px-2.5">
          <span className="size-1.5 rounded-full bg-ink/20" />
          <span className="size-1.5 rounded-full bg-ink/20" />
          <span className="size-1.5 rounded-full bg-ink/20" />
        </div>
        <img
          src={CWT + '-480.webp'}
          srcSet={CWT + '-480.webp 480w, ' + CWT + '-800.webp 800w'}
          sizes="(min-width: 1024px) 560px, 80vw"
          alt=""
          width="800"
          height="450"
          loading="lazy"
          decoding="async"
          className="h-[176px] w-full object-cover object-top"
        />
      </div>
      <div className="absolute bottom-0 right-[3%] w-24 overflow-hidden rounded-[18px] border-4 border-ink bg-ink shadow-lg">
        <img
          src="/images/home/phone-change-work-therapies.webp"
          alt=""
          width="220"
          height="476"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-[13px]"
        />
      </div>
    </div>
  );
}

function SearchVisual() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-orange-tint">
          <img src={LOGO.mark} alt="" width="202" height="205" className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-ink">PixelFold</p>
          <p className="text-[11px] text-ink/60">https://www.pixelfold.co.uk</p>
        </div>
      </div>
      <p className="mt-2.5 font-display text-[15px] font-semibold leading-snug text-[#2c46b8]">Websites for small businesses | PixelFold</p>
      <p className="mt-1 text-[12.5px] leading-snug text-ink/60">Fast, beautiful websites for small businesses, designed and built in London and explained in plain English.</p>
    </div>
  );
}

function ChatVisual() {
  return (
    <div aria-hidden="true" className="space-y-2.5">
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-sand px-3.5 py-2.5 text-[13.5px] leading-snug text-ink">What does hosting actually mean?</p>
      <div className="flex items-end gap-2">
        <img src={LOGO.mark} alt="" width="202" height="205" className="size-7 shrink-0 rounded-full bg-orange-tint p-0.5" />
        <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-orange-tint px-3.5 py-2.5 text-[13.5px] leading-snug text-ink">
          It’s where your site lives online. We’ll set it up and explain it as we go.
        </p>
      </div>
    </div>
  );
}

/* What a one-off build hands over: the same list as the One-off card in Plans */
const HANDOVER = [
  [FileCode2, 'Source code'],
  [Images, 'Images and project files'],
  [FileText, 'Hosting set-up guide'],
];

function HandoverVisual() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-ink/10 bg-white p-3">
      <p className="flex items-center gap-2 px-1 pb-2.5 font-display text-sm font-semibold text-ink">
        <FolderOpen className="size-4 text-orange-ink" strokeWidth={2.2} />
        your-website
      </p>
      <ul className="space-y-0.5 border-t border-ink/[0.08] pt-2">
        {HANDOVER.map(([Icon, t]) => (
          <li key={t} className="flex items-center gap-2.5 px-1 py-1.5 text-[13px] text-ink/75">
            <Icon className="size-4 shrink-0 text-ink/45" strokeWidth={2} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The parts of a written quote, with no figures in it: every project is priced on its own */
const QUOTE_ROWS = [
  ['Scope', 'What we’ll build'],
  ['Timeline', 'When it goes live'],
  ['Price', 'What it costs'],
];

function QuoteVisual() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm font-bold text-ink">Your quote</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/60">In writing</p>
      </div>
      <dl className="mt-2 divide-y divide-ink/[0.08] text-[13px]">
        {QUOTE_ROWS.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2">
            <dt className="text-ink/60">{k}</dt>
            <dd className="font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const TILES = [
  {
    title: 'Designed for every screen',
    text: 'Designed for phones first, then tablets and desktops, and tested on real devices before anything goes live.',
    visual: <ScreensVisual />,
    wide: true,
  },
  {
    title: 'Set up for search',
    text: 'Page titles, descriptions, a sitemap and help with Google Business, set up properly from day one.',
    visual: <SearchVisual />,
  },
  {
    title: 'Yours to keep',
    text: 'Choose a one-off build and it’s handed over in full: every file, the code, the lot.',
    visual: <HandoverVisual />,
  },
  {
    title: 'Plain English',
    text: 'We explain what’s happening, what’s next and why, without the jargon.',
    visual: <ChatVisual />,
    folder: true, /* the grid's one tile in the logo's yellow */
  },
  {
    title: 'Quoted per project',
    text: 'No price list. Each project gets its own quote, agreed before we start.',
    visual: <QuoteVisual />,
  },
];

export default function Benefits() {
  return (
    <section className="bg-background py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          title="What you get with PixelFold."
          sub="The parts of a website that matter most to a small business, and how we handle them."
        />
        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {TILES.map((t, i) => (
            <div
              key={t.title}
              className={cn(
                'flex flex-col justify-between gap-6 rounded-2xl border p-5 md:gap-8 md:p-7',
                t.folder ? 'border-transparent bg-folder' : 'border-ink/10 bg-card',
                t.wide && 'md:col-span-2'
              )}
            >
              <div>{t.visual}</div>
              <div>
                <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.01em] text-ink">{t.title}</h3>
                <p className={cn('mt-2 leading-relaxed', t.folder ? 'text-ink/80' : 'text-muted-foreground')}>{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
