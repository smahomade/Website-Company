import { Link } from 'react-router-dom';
import { ArrowRight, CodeXml, MessagesSquare, PenTool, Rocket } from 'lucide-react';
import SectionHeading from './SectionHeading.jsx';

/* The four stages a project goes through (the same words the 3D story used) */
const STEPS = [
  {
    icon: MessagesSquare,
    stage: 'Consultation',
    title: 'To create, we must understand.',
    body: 'Every project starts with a conversation, not a form. What do your customers need to see? What makes you stand out? Your answers become the brief.',
  },
  {
    icon: PenTool,
    stage: 'Design',
    title: 'From sketch to screen, around your brand.',
    body: 'We sketch your layout first, then design it around your brand. You see it before a line of code is written.',
  },
  {
    icon: CodeXml,
    stage: 'Build',
    title: 'Built properly, pixel by pixel.',
    body: 'Hand-built, fast-loading and fully responsive. We test on real phones, tablets and desktops until every piece is right.',
    points: ['Mobile-first', 'Basic SEO built in', 'Tested on real devices'],
  },
  {
    icon: Rocket,
    stage: 'Launch',
    title: 'Live, and fully yours.',
    body: 'Domain, hosting and SSL handled. Then we walk you through everything, so you’re never left in the dark.',
  },
];

export default function Process() {
  return (
    <section className="relative overflow-hidden bg-espresso py-24 text-cream md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(255,106,0,0.12),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          tone="dark"
          label="How it works"
          title="From first chat"
          accent="to launch day."
          sub="Four steps, and we explain each one in plain English as we go."
        />
        <ol className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* a dashed thread joining the steps on wide screens */}
          <li aria-hidden="true" className="pointer-events-none absolute inset-x-[12%] top-[52px] hidden border-t border-dashed border-cream/15 lg:block" />
          {STEPS.map(({ icon: Icon, stage, title, body, points }, i) => (
            <li
              key={stage}
              data-reveal
              style={{ '--reveal-i': i }}
              className="relative flex flex-col rounded-2xl border border-cream/10 bg-[#24211d] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-xl bg-primary text-ink">
                  <Icon className="size-6" strokeWidth={2.2} />
                </span>
                <span className="font-display text-sm font-bold tracking-[0.1em] text-cream/40">{'0' + (i + 1)}</span>
              </div>
              <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.16em] text-orange-soft">{stage}</p>
              <h3 className="mt-2 font-display text-xl font-bold leading-snug tracking-[-0.01em] text-cream">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-cream/65">{body}</p>
              {points && (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {points.map((pt) => (
                    <li key={pt} className="rounded-full border border-cream/15 px-2.5 py-1 text-xs font-bold text-cream/80">{pt}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        <Link
          to="/how-it-works"
          className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-md font-display font-semibold text-cream outline-none hover:text-orange-soft focus-visible:ring-[3px] focus-visible:ring-ring/45"
        >
          See how it works in detail <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
