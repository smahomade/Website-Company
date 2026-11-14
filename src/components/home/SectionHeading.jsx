import { cn } from '@/lib/utils';

/* A section heading and an optional line underneath. No label above it: the heading carries the
   section on its own. `accent` is a quieter second half, kept for the few headings that are two
   halves (a question and its answer, two choices); with `hand` it's written in the handwriting face
   instead, in orange. */
export default function SectionHeading({ title, accent, hand = false, sub, tone = 'light', align = 'left', className, children }) {
  const dark = tone === 'dark';
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}>
      <h2
        className={cn(
          'font-display text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.03em] text-balance',
          dark ? 'text-cream' : 'text-ink'
        )}
      >
        {title}
        {accent &&
          (hand ? (
            <span className="font-hand text-[1.2em] font-bold leading-none tracking-normal text-orange-ink"> {accent}</span>
          ) : (
            <span className={dark ? 'text-cream/55' : 'text-ink/55'}> {accent}</span>
          ))}
      </h2>
      {sub && <p className={cn('mt-5 text-lg leading-relaxed', dark ? 'text-cream/65' : 'text-muted-foreground')}>{sub}</p>}
      {children}
    </div>
  );
}
