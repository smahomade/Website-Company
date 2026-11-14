/**
 * Pinned steps: 21st.dev "How It Works" by chamaac (https://21st.dev/@chamaac/components/how-it-works).
 * Adapted for PixelFold: brand colours, the site's handwriting face (Caveat) for the numbers, a stage
 * label and optional chips on each note, plain JS, four-step layout, and the dashed thread drawn
 * with CSS instead of the motion library (it creeps slowly and stops for visitors who prefer
 * reduced motion).
 *
 * Notes pinned to a sheet of lined paper, joined by a dashed thread; on phones they stack.
 */
import { cn } from '@/lib/utils';

function Pin({ className }) {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
    </svg>
  );
}

/* every note is on the logo's yellow note paper; the pins and numbers alternate */
const THEMES = {
  orange: { bg: 'bg-note', text: 'text-orange-ink', border: 'border-folder/45', pin: 'text-primary' },
  ink: { bg: 'bg-note', text: 'text-ink', border: 'border-folder/45', pin: 'text-ink' },
};

/* Where each note sits on wide screens, and its tilt; the thread below is drawn to match */
const POSITIONS = [
  { className: 'md:absolute md:top-0 md:left-[12%]', rotate: 'rotate-[2deg] md:rotate-[6deg]' },
  { className: 'md:absolute md:top-[150px] md:right-[12%]', rotate: '-rotate-[2deg] md:-rotate-[6deg]' },
  { className: 'md:absolute md:top-[500px] md:left-[12%]', rotate: 'rotate-[2deg] md:rotate-[6deg]' },
  { className: 'md:absolute md:top-[650px] md:right-[9%]', rotate: '-rotate-[2deg] md:-rotate-[6deg]' },
];
const BOARD_HEIGHT = 1090;
const THREAD = 'M 300 210 C 520 210, 560 360, 700 360 C 860 360, 520 480, 300 700 C 300 800, 560 860, 740 860';

function Note({ number, stage, title, body, points, theme, position }) {
  const t = THEMES[theme] || THEMES.orange;
  return (
    <li className={cn('relative w-full transition-transform duration-300 hover:z-30 hover:scale-[1.03] motion-reduce:transition-none md:w-[310px]', position.rotate, position.className)}>
      <div className="rounded-[25px] border border-ink/[0.06] bg-white p-2 shadow-[0_14px_30px_-10px_rgba(60,40,0,0.28)]">
        <Pin className={cn('mx-auto mb-4 mt-1 size-8', t.pin)} />
        <div className={cn('relative flex flex-col overflow-hidden rounded-[15px] border p-4', t.bg, t.border)}>
          <span aria-hidden="true" className={cn("mb-2 font-hand text-[42px] font-bold leading-none", t.text)}>
            {number}
          </span>
          <p className={cn('font-display text-xs font-bold uppercase tracking-[0.16em]', t.text)}>{stage}</p>
          <h3 className="mt-1.5 font-display text-[22px] font-bold leading-[1.12] tracking-[-0.01em] text-ink">{title}</h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink/70">{body}</p>
          {points && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {points.map((pt) => (
                <li key={pt} className="rounded-full border border-ink/15 bg-white/70 px-2.5 py-1 text-xs font-bold text-ink/80">{pt}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

/* steps: [{ stage, title, body, points? }] (four of them); children sit above the board */
export default function PinnedSteps({ steps, className, children }) {
  return (
    <div className={cn('relative px-5 md:px-8', className)}>
      {/* the lined paper, fading out at the sides */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px)', backgroundSize: '100% 32px', marginTop: '4px' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {children}
        <div className="relative mx-auto mt-10 w-full md:mt-14 max-w-[1000px] md:h-[var(--board-h)]" style={{ '--board-h': BOARD_HEIGHT + 'px' }}>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 hidden h-full w-full md:block"
            viewBox={`0 0 1000 ${BOARD_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <path
              d={THREAD}
              stroke="currentColor"
              className="pf-thread text-ink/25"
              strokeWidth="2"
              strokeDasharray="8 6"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="flex flex-col gap-8 md:block">
            {steps.map((s, i) => (
              <Note
                key={s.stage}
                number={'0' + (i + 1)}
                stage={s.stage}
                title={s.title}
                body={s.body}
                points={s.points}
                theme={i % 2 ? 'ink' : 'orange'}
                position={POSITIONS[i % POSITIONS.length]}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
