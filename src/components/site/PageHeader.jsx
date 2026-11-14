import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/* The top of every inner page, in the home hero's style: the faint dot grid and warm glow, a
   heading with its accent words under an orange highlighter stroke (it wraps
   with the words), a line underneath, ticks, any buttons (children), and an optional picture on
   the right (aside). */
export default function PageHeader({ title, accent, sub, chips = [], aside, className, children }) {
  return (
    <section className={cn('relative isolate overflow-hidden bg-background pb-12 pt-28 leading-normal md:pb-16 md:pt-36', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgba(17,17,17,0.09)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_70%_at_40%_30%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[12%] -top-48 -z-10 h-[560px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgba(255,106,0,0.14),transparent)]"
      />
      <div className={cn('mx-auto max-w-6xl px-5 md:px-8', aside && 'grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]')}>
        <div className="max-w-3xl">
          <h1
            className={cn(
              'font-display font-bold leading-[1.02] tracking-[-0.035em] text-ink text-balance',
              aside ? 'text-[clamp(2.6rem,5vw,3.9rem)]' : 'text-[clamp(2.6rem,6vw,4.6rem)]'
            )}
          >
            {title}
            {accent && (
              <>
                {' '}
                <span className="box-decoration-clone bg-[linear-gradient(transparent_60%,rgba(255,106,0,0.8)_60%,rgba(255,106,0,0.8)_92%,transparent_92%)] px-[0.04em]">
                  {accent}
                </span>
              </>
            )}
          </h1>
          {sub && <p className="mt-6 max-w-[38rem] text-lg leading-relaxed text-muted-foreground md:text-xl">{sub}</p>}
          {chips.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-sm font-semibold text-ink/75">
                  <Check aria-hidden="true" className="size-3.5 text-orange-ink" strokeWidth={3} />
                  {c}
                </li>
              ))}
            </ul>
          )}
          {children && <div className="mt-9 flex flex-wrap gap-3">{children}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}
