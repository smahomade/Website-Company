import { FileText, KeyRound } from 'lucide-react';
import { LOGO } from '@/lib/site.js';
import { cn } from '@/lib/utils';
import SectionHeading from './SectionHeading.jsx';

/* A tiny page drawn in blocks: three columns on the desktop, stacked on the phone */
function MiniSite({ phone }) {
  return (
    <div className="flex h-full flex-col gap-1.5 p-2">
      <div className="flex items-center justify-between">
        <span className="h-1.5 w-6 rounded-full bg-ink/70" />
        {phone ? (
          <span className="h-1.5 w-3 rounded-full bg-ink/25" />
        ) : (
          <span className="flex gap-1">
            <span className="h-1 w-4 rounded-full bg-ink/20" />
            <span className="h-1 w-4 rounded-full bg-ink/20" />
            <span className="h-1 w-4 rounded-full bg-ink/20" />
          </span>
        )}
      </div>
      <div className="rounded-md bg-orange-tint p-2">
        <span className="block h-1.5 w-3/4 rounded-full bg-ink/70" />
        <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-ink/30" />
        <span className="mt-2 block h-2.5 w-8 rounded-full bg-primary" />
      </div>
      <div className={cn('grid gap-1.5', phone ? 'grid-cols-1' : 'grid-cols-3')}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn('rounded-md bg-sand', phone ? 'h-5' : 'h-9')} />
        ))}
      </div>
    </div>
  );
}

function ScreensVisual() {
  return (
    <div aria-hidden="true" className="relative h-[210px]">
      <div className="absolute left-0 top-2 w-[74%] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-md">
        <div className="flex h-6 items-center gap-1 border-b border-ink/[0.08] bg-sand px-2.5">
          <span className="size-1.5 rounded-full bg-ink/20" />
          <span className="size-1.5 rounded-full bg-ink/20" />
          <span className="size-1.5 rounded-full bg-ink/20" />
        </div>
        <div className="h-[150px]"><MiniSite /></div>
      </div>
      <div className="absolute bottom-0 right-[6%] w-[23%] min-w-[92px] overflow-hidden rounded-[18px] border-[5px] border-ink bg-white shadow-lg">
        <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-ink/80" />
        <div className="h-[150px]"><MiniSite phone /></div>
      </div>
    </div>
  );
}

function SearchVisual() {
  return (
    <div aria-hidden="true" className="rounded-xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-orange-tint">
          <img src={LOGO.mark} alt="" width="202" height="205" className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-ink">PixelFold</p>
          <p className="text-[11px] text-ink/50">https://www.pixelfold.co.uk</p>
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

function IconVisual({ icon: Icon }) {
  return (
    <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-orange-tint text-orange-ink">
      <Icon className="size-7" strokeWidth={2} />
    </span>
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
    visual: <IconVisual icon={KeyRound} />,
  },
  {
    title: 'Plain English',
    text: 'We explain what’s happening, what’s next and why, without the jargon.',
    visual: <ChatVisual />,
  },
  {
    title: 'Quoted per project',
    text: 'No price list. Each project gets its own quote, agreed before we start.',
    visual: <IconVisual icon={FileText} />,
  },
];

export default function Benefits() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          label="Why PixelFold"
          title="What you get"
          accent="with PixelFold."
          sub="The parts of a website that matter most to a small business, and how we handle them."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TILES.map((t, i) => (
            <div
              key={t.title}
              data-reveal
              style={{ '--reveal-i': i % 3 }}
              className={cn(
                'flex flex-col justify-between gap-8 rounded-2xl border border-ink/10 bg-card p-6 shadow-sm md:p-7',
                t.wide && 'md:col-span-2'
              )}
            >
              <div>{t.visual}</div>
              <div>
                <h3 className="font-display text-xl font-bold leading-snug tracking-[-0.01em] text-ink">{t.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
