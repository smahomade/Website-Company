import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileText, MapPin, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOGO } from '@/lib/site.js';
import BrowserFrame from './BrowserFrame.jsx';

const TOUR = {
  src: '/videos/top-one-salon-tour.mp4',
  poster: '/videos/top-one-salon-tour.webp',
  url: 'topone.co.uk',
};

/* Top One's site in a browser window. The click-through video only loads, and only plays, when
   the visitor asks; the same button pauses it. */
function TourWindow({ className }) {
  const [state, setState] = useState('idle');
  const videoRef = useRef(null);
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return setState('playing');
    if (v.paused) {
      v.play();
      setState('playing');
    } else {
      v.pause();
      setState('paused');
    }
  };
  return (
    <BrowserFrame url={TOUR.url} className={className}>
      <div className="relative aspect-video bg-sand">
        {state === 'idle' ? (
          <img
            src="/images/home/site-top-one-salon-800.webp"
            srcSet={'/images/home/site-top-one-salon-480.webp 480w, /images/home/site-top-one-salon-800.webp 800w, ' + TOUR.poster + ' 1280w'}
            sizes="(min-width: 1024px) 450px, 80vw"
            alt="Top One Salon's website, designed and built by PixelFold"
            width="1280"
            height="720"
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={TOUR.src}
            poster={TOUR.poster}
            autoPlay
            muted
            loop
            playsInline
            aria-label="A click-through of Top One Salon's website"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-cream/95 pl-3 pr-4 font-display text-[13px] font-semibold text-ink shadow-md backdrop-blur transition-colors outline-none hover:bg-white focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          {state === 'playing' ? <Pause className="size-4" /> : <Play className="size-4" />}
          {state === 'playing' ? 'Pause tour' : 'Watch the tour'}
        </button>
      </div>
    </BrowserFrame>
  );
}

/* The brand's folder, flat: two client sites filed inside, the PIXELFOLD wordmark pressed into
   the front, and the cat as a sticker on top. */
function HeroFolder() {
  return (
    <div className="relative mx-auto aspect-[1.08] w-full max-w-[560px]">
      {/* back of the folder and its tab */}
      <div aria-hidden="true" className="absolute left-0 top-[8%] h-[14%] w-[40%] rounded-t-[22px] bg-[#E85D04]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[15%] rounded-[26px] rounded-tl-none bg-[#E85D04]" />

      {/* the sites filed inside */}
      <BrowserFrame url="changeworktherapies.com" className="absolute left-[5%] top-[3%] z-10 w-[72%] -rotate-[5deg] shadow-md">
        <img
          src="/images/home/hero-change-work-therapies-800.webp"
          srcSet="/images/home/hero-change-work-therapies-480.webp 480w, /images/home/hero-change-work-therapies-800.webp 800w, /images/story/shot-change-work-therapies.webp 1217w"
          sizes="(min-width: 1024px) 400px, 72vw"
          alt=""
          width="1217"
          height="631"
          fetchPriority="high"
          className="aspect-[1217/631] w-full object-cover object-top"
        />
      </BrowserFrame>
      <TourWindow className="absolute right-[4%] top-[14%] z-20 w-[80%] rotate-[2deg]" />

      {/* front of the folder */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-30 h-[40%] rounded-[26px] bg-gradient-to-b from-[#FF7A1F] to-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_-18px_40px_-24px_rgba(60,30,0,0.65)]"
      >
        <p className="absolute bottom-[14%] left-[7%] font-display text-[clamp(30px,7.4vw,48px)] font-extrabold leading-none tracking-[-0.02em]">
          <span className="text-cream [text-shadow:0_1px_0_rgba(120,50,0,0.35)]">PIXEL</span>
          <span className="text-ink">FOLD</span>
        </p>
      </div>
      <div
        aria-hidden="true"
        className="absolute right-[7%] top-[51%] z-40 w-[clamp(76px,19%,108px)] rotate-6 rounded-[22px] border border-ink/5 bg-cream p-2.5 shadow-md"
      >
        <img src={LOGO.mark} alt="" width="202" height="205" className="h-auto w-full" />
      </div>
    </div>
  );
}

const TRUST = [
  { icon: Check, text: 'Three client sites live' },
  { icon: MapPin, text: 'Based in London' },
  { icon: FileText, text: 'Quoted per project, in writing' },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-background pb-20 pt-32 md:pb-28 md:pt-40">
      {/* a faint dot grid and a warm glow, both fading out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgba(17,17,17,0.09)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_35%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[12%] -top-48 -z-10 h-[620px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(255,106,0,0.16),transparent)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-12">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 py-1 pl-1 pr-3.5 font-display text-sm font-semibold text-ink shadow-sm backdrop-blur">
            <img src={LOGO.mark} alt="" width="202" height="205" className="size-7 rounded-full bg-orange-tint object-contain p-0.5" />
            Little files. Big ideas.
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.9rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-ink">
            We’ll build
            <br />
            <span className="relative inline-block whitespace-nowrap">
              <span aria-hidden="true" className="absolute inset-x-[-0.06em] bottom-[0.08em] -z-10 h-[0.34em] rounded-[0.12em] bg-primary/80" />
              your website.
            </span>
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-muted-foreground md:text-xl">
            PixelFold designs and builds fast, beautiful websites for small businesses, and explains the process in plain English.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/quote">
                Get a free quote <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#work">See our work</a>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[15px] font-semibold text-ink/70">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-orange-tint text-orange-ink">
                  <Icon className="size-3.5" strokeWidth={2.6} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <HeroFolder />
      </div>
    </section>
  );
}
