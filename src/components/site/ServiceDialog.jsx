import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { FEATURE_ICON, FEATURE_TONE, KIND_ICON, META_ICON } from './packageIcons.js';

/* "Read more" for one package (data/services.js): what it is, who it suits, everything included
   and the small print. `service` is null when closed; the last one stays on screen while the
   dialog fades out. */
export default function ServiceDialog({ service, onClose }) {
  const last = useRef(service);
  if (service) last.current = service;
  const s = last.current;
  const d = s?.modal;
  const Icon = (s && KIND_ICON[s.iconKind]) || KIND_ICON.key;
  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      {d && (
        <DialogContent className="max-w-xl">
          <div className="flex items-start gap-4 pr-10">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-tint text-orange-ink">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-orange-ink">{d.tag}</p>
              <DialogTitle className="mt-1">{d.title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-4">{d.desc}</DialogDescription>

          {d.meta?.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {d.meta.map((m) => {
                const MetaIcon = META_ICON[m.icon];
                return (
                  <li key={m.text} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-sm font-semibold text-ink/80">
                    {MetaIcon && <MetaIcon aria-hidden="true" className="size-4 text-orange-ink" />}
                    {m.text}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-6 font-display text-sm font-bold uppercase tracking-[0.14em] text-ink/65">What’s included</p>
          <ul className="mt-3 space-y-2.5">
            {(d.features || []).map((f) => {
              const FIcon = FEATURE_ICON[f.type] || FEATURE_ICON.standard;
              return (
                <li key={f.text} className="flex items-start gap-3 text-[15px] font-semibold text-ink">
                  <span className={'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ' + (FEATURE_TONE[f.type] || FEATURE_TONE.standard)}>
                    <FIcon aria-hidden="true" className="size-3" strokeWidth={3} />
                  </span>
                  {f.text}
                </li>
              );
            })}
          </ul>

          {d.note && <p className="mt-5 rounded-2xl bg-sand px-4 py-3 text-sm leading-relaxed text-muted-foreground">{d.note}</p>}
          <p className="mt-4 text-sm leading-relaxed text-ink">
            <strong className="font-bold">Quoted per project.</strong> Scope, timeline and price are agreed after a free consultation.
          </p>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
            <Button asChild>
              <Link to="/quote" onClick={onClose}>
                Book a consultation <ArrowRight />
              </Link>
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
