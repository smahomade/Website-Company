import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* The face of one card in the project deck (scroll-stacking-cards.jsx), kept apart from it so the
   still list below needs no animation library. From 21st.dev "Scroll Stacking Cards" by Aakash
   Mehra. */

export const host = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

/* A whole site, edge to edge, with its name set into a corner cut out of the card. The corner
   opens our case study; the case study links on to the live site. */
export function DeckFace({ p, ground, children }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] shadow-[0_50px_90px_-35px_rgba(0,0,0,0.75)]" style={{ background: ground }}>
      <img
        src={p.image}
        srcSet={p.srcSet}
        sizes="(min-width: 1280px) 1180px, 92vw"
        alt={'The ' + host(p.url) + ' home page'}
        width="1280"
        height="720"
        loading="lazy"
        decoding="async"
        className="block aspect-[16/9] w-full object-cover object-top"
      />
      <Visit p={p} ground={ground} />
      {children}
    </div>
  );
}

function Visit({ p, ground }) {
  const R = 18;
  const corner = (
    <svg aria-hidden="true" width={R} height={R} viewBox={`0 0 ${R} ${R}`} className="block">
      <path d={`M${R} 0 V${R} H0 A${R} ${R} 0 0 0 ${R} 0 Z`} fill={ground} />
    </svg>
  );
  return (
    /* on phones the bar sits under the picture, full width; from sm up it's set into the corner */
    <div className="relative sm:absolute sm:bottom-0 sm:right-0 sm:z-10">
      <div className="absolute bottom-full right-0 max-sm:hidden">{corner}</div>
      <div className="absolute bottom-0 right-full max-sm:hidden">{corner}</div>
      <Link
        to={'/portfolio/' + p.id}
        className="group flex items-center gap-4 py-3 pl-4 pr-3 text-cream outline-none max-sm:justify-between sm:gap-5 sm:rounded-tl-[20px] sm:py-4 sm:pl-7 sm:pr-1"
        style={{ background: ground }}
      >
        <span className="flex flex-col leading-tight">
          <span className="font-display text-[16px] font-bold tracking-[-0.015em] sm:text-[19px]">{p.name}</span>
          <span className="text-[13px] text-cream/70 underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-[15px]">
            {host(p.url)} · case study
          </span>
        </span>
        <span className="grid size-11 place-items-center rounded-full bg-primary text-ink transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-active:scale-90 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary max-sm:size-10 sm:size-[52px]">
          <ArrowRight className="size-5 sm:size-6" strokeWidth={2.2} />
        </span>
      </Link>
    </div>
  );
}

/* The same cards as a plain column: for visitors who prefer reduced motion, and while the deck's
   code is still on its way */
export function StaticDeck({ projects, ground, className }) {
  return (
    <ul aria-label="Projects" className={cn('mx-auto grid max-w-6xl gap-8 px-5 py-14 md:px-8', className)}>
      {projects.map((p) => (
        <li key={p.id} aria-label={p.name + ': ' + p.summary}>
          <DeckFace p={p} ground={ground} />
        </li>
      ))}
    </ul>
  );
}
