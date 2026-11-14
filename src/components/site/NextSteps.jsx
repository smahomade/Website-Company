import { cn } from '@/lib/utils';

/* What happens after someone gets in touch. The same three lines everywhere, so the promise is
   the same across the site. */
const STEPS = [
  { t: 'We reply within 24 hours', d: 'Usually the same day. A real person, not an auto-responder.' },
  { t: 'A quick chat, your way', d: 'WhatsApp, a call or email, whichever suits you.' },
  { t: 'Scope, timeline and quote in writing', d: 'Agreed before any work starts. No obligation.' },
];

export default function NextSteps({ title = 'What happens next', className }) {
  return (
    <div className={cn('rounded-[24px] border border-ink/10 bg-sand/70 p-6 md:p-7', className)}>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <ol className="mt-5 space-y-5">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex gap-4">
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-cream">
              {i + 1}
            </span>
            <div>
              <p className="font-display font-bold leading-snug text-ink">{s.t}</p>
              <p className="mt-0.5 text-[15px] leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
