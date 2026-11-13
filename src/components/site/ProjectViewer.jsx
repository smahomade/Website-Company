import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const START = 30; /* the divider starts 30% across: mostly "after" */
const clamp = (p) => Math.min(96, Math.max(4, p));

/* One page, before and after: "before" shows left of the divider, "after" right of it. The two
   full-page screenshots can differ in length, so a band marks where the shorter one ends. */
function ComparePage({ slide, pct, onDrag }) {
  const wrapRef = useRef(null);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  const [layout, setLayout] = useState({ height: null, beforeEnd: null, afterEnd: null });

  const measure = useCallback(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!before?.naturalWidth || !after?.naturalWidth) return;
    const w = wrapRef.current?.offsetWidth || 900;
    const bh = (before.naturalHeight / before.naturalWidth) * w;
    const ah = (after.naturalHeight / after.naturalWidth) * w;
    setLayout({ height: Math.max(bh, ah), beforeEnd: bh < ah - 4 ? bh : null, afterEnd: ah < bh - 4 ? ah : null });
  }, []);
  /* the pictures may already be loaded before onLoad is attached */
  useEffect(() => measure(), [measure, slide]);

  /* drag on the picture itself moves the divider too */
  const dragFrom = (e) => {
    if (e.button > 0) return;
    const r = wrapRef.current.getBoundingClientRect();
    const at = (x) => onDrag(clamp(((x - r.left) / r.width) * 100));
    at(e.clientX);
    const move = (ev) => at(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const band = 'pointer-events-none absolute flex h-9 items-center justify-center bg-ink/80 text-xs font-bold uppercase tracking-[0.12em] text-cream';
  return (
    <div ref={wrapRef} className="relative cursor-ew-resize touch-pan-y select-none" onPointerDown={dragFrom}>
      <div style={layout.height ? { height: layout.height } : { minHeight: 400 }} />
      {/* behind the screenshots, which cover it once they've arrived */}
      <p className="absolute inset-x-0 top-32 text-center text-sm font-semibold text-muted-foreground">Loading the page…</p>
      <img ref={afterRef} src={slide.after} alt="After" onLoad={measure} draggable="false" className="absolute inset-x-0 top-0 w-full" style={{ clipPath: 'inset(0 0 0 ' + pct + '%)' }} />
      <img ref={beforeRef} src={slide.before} alt="Before" onLoad={measure} draggable="false" className="absolute inset-x-0 top-0 w-full" style={{ clipPath: 'inset(0 ' + (100 - pct) + '% 0 0)' }} />
      {layout.beforeEnd != null && (
        <div className={band} style={{ top: layout.beforeEnd, left: 0, right: 100 - pct + '%' }}>Before ends here</div>
      )}
      {layout.afterEnd != null && (
        <div className={band} style={{ top: layout.afterEnd, left: pct + '%', right: 0 }}>After ends here</div>
      )}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-primary" style={{ left: pct + '%' }} />
    </div>
  );
}

/* Every page of a project, in a dialog: before/after pairs (with a divider to drag) or plain
   screenshots. Arrow keys and the buttons move between pages; only the page on screen is loaded.
   `project` is null when closed; the last one stays while the dialog fades out. */
export default function ProjectViewer({ project, onClose }) {
  const last = useRef(project);
  if (project) last.current = project;
  const p = last.current;
  const [current, setCurrent] = useState(0);
  const [pct, setPct] = useState(START);
  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const touchX = useRef(null);

  const slides = p?.slides || [];
  const compare = slides.length > 0 && typeof slides[0] === 'object';
  const count = slides.length;
  const labelOf = (s, i) => (typeof s === 'object' && s.label) || 'Page ' + (i + 1);

  useEffect(() => {
    if (project) {
      setCurrent(0);
      setPct(START);
    }
  }, [project]);

  const goTo = useCallback(
    (i) => {
      if (!count) return;
      setCurrent(((i % count) + count) % count);
      setPct(START);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    },
    [count]
  );

  useEffect(() => {
    if (!project) return undefined;
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input')) return; /* the divider slider has its own arrows */
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [project, current, goTo]);

  const slide = slides[current];
  const navBtn = 'grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-ink/15 bg-white text-ink outline-none transition-colors hover:border-ink/40 focus-visible:ring-[3px] focus-visible:ring-ring/45';

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      {p && (
        <DialogContent
          ref={contentRef}
          /* focus starts on the dialog itself, so the arrow keys turn pages; Tab reaches the slider */
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            contentRef.current?.focus();
          }}
          closeLabel="Close the pages"
          className="h-[calc(100dvh-24px)] max-w-6xl grid-rows-[auto_1fr_auto] gap-0 overflow-hidden p-0 md:p-0"
        >
          <div className="border-b border-ink/10 px-5 pb-4 pt-5 pr-16 md:px-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{p.typeLabel}</Badge>
              <DialogTitle className="text-xl md:text-2xl">
                {p.title}
                <span className="text-ink/45"> · {slide && labelOf(slide, current)}</span>
              </DialogTitle>
            </div>
            <DialogDescription className="sr-only">
              {compare ? 'Each page before and after the redesign. Drag the divider to compare.' : 'Each page of the site.'}
            </DialogDescription>
            {compare && (
              <label className="mt-4 flex items-center gap-3 text-sm font-bold">
                <span className="text-ink/60">Before</span>
                <input
                  type="range"
                  min="4"
                  max="96"
                  value={pct}
                  onChange={(e) => setPct(Number(e.target.value))}
                  aria-label="Move the divider between before and after"
                  className="h-11 flex-1 cursor-ew-resize accent-[#ff6a00]"
                />
                <span className="text-orange-ink">After</span>
                <ChevronsLeftRight aria-hidden="true" className="hidden size-4 text-ink/40 sm:block" />
              </label>
            )}
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 overflow-y-auto overscroll-contain bg-sand"
            onTouchStart={(e) => (touchX.current = compare ? null : e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(dx) > 40) goTo(current + (dx > 0 ? 1 : -1));
            }}
          >
            <div className="mx-auto max-w-5xl bg-white">
              {slide &&
                (compare ? (
                  <ComparePage key={current} slide={slide} pct={pct} onDrag={setPct} />
                ) : (
                  <>
                    <div className="relative min-h-[400px]">
                      <p className="absolute inset-x-0 top-32 text-center text-sm font-semibold text-muted-foreground">Loading the page…</p>
                      <img key={current} src={slide} alt={p.title + ', ' + labelOf(slide, current)} className="relative block w-full" />
                    </div>
                    <p className="bg-ink/80 py-2.5 text-center text-xs font-bold uppercase tracking-[0.12em] text-cream">End of page</p>
                  </>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-ink/10 px-4 py-3 md:px-6">
            <button type="button" onClick={() => goTo(current - 1)} aria-label="Previous page" className={navBtn} disabled={count < 2}>
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1" role="group" aria-label="Pages">
              {slides.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  aria-current={i === current ? 'page' : undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    'min-h-10 shrink-0 cursor-pointer rounded-full px-3.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/45',
                    i === current ? 'bg-ink text-cream' : 'text-ink/65 hover:bg-ink/5 hover:text-ink'
                  )}
                >
                  {compare ? labelOf(s, i) : i + 1}
                </button>
              ))}
            </div>
            <span className="hidden shrink-0 text-sm font-semibold text-muted-foreground sm:block">
              {current + 1} / {count}
            </span>
            <button type="button" onClick={() => goTo(current + 1)} aria-label="Next page" className={navBtn} disabled={count < 2}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
