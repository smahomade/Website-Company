import { useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

/* An inline before/after slider. Both screenshots are tall full-page captures, so only their tops
   show. An invisible range input on top drives the divider, so mouse, touch and keys all work, and
   the handle shows the keyboard focus. */
export default function BeforeAfter({ before, after, label, caption, className }) {
  const [pct, setPct] = useState(38);
  return (
    <figure className={className}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-ink/10 bg-sand shadow-md">
        <img src={after} alt={label + ', after'} loading="lazy" className="absolute inset-0 size-full object-cover object-top" />
        <img
          src={before}
          alt={label + ', before'}
          loading="lazy"
          className="absolute inset-0 size-full object-cover object-top"
          style={{ clipPath: 'inset(0 ' + (100 - pct) + '% 0 0)' }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-bold text-cream">Before</span>
        <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-ink">After</span>
        <input
          type="range"
          min="4"
          max="96"
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-label={'Compare ' + label + ' before and after'}
          className="peer absolute inset-0 z-10 size-full cursor-ew-resize opacity-0"
        />
        {/* the handle is a sibling's child, so the focus ring reaches it through *: */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-cream shadow-[0_0_0_1px_rgba(17,17,17,0.15)] peer-focus-visible:*:ring-[3px] peer-focus-visible:*:ring-primary"
          style={{ left: pct + '%' }}
        >
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream text-ink shadow-md">
            <ChevronsLeftRight className="size-5" />
          </span>
        </span>
      </div>
      {caption && <figcaption className="mt-3 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
