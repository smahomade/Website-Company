import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { META_ICON } from './packageIcons.js';

/* "Read more" for one package (data/services.js): what it is, who it suits, everything included
   and the small print. `service` is null when closed; the last one stays on screen while the
   dialog fades out. */
export default function ServiceDialog({ service, onClose }) {
  const last = useRef(service);
  if (service) last.current = service;
  const s = last.current;
  const d = s?.modal;
  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      {d && (
        <DialogContent className="max-w-xl">
          <DialogTitle className="pr-10">{d.title}</DialogTitle>
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

          <h3 className="mt-6 font-display text-lg font-bold text-ink">What’s included</h3>
          <ul className="mt-3 space-y-2.5">
            {(d.features || []).map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-[15px] font-semibold text-ink">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ink text-cream">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {f.text}
              </li>
            ))}
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
