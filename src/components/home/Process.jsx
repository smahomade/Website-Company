import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PinnedSteps from '@/components/ui/how-it-works.jsx';
import SectionHeading from './SectionHeading.jsx';

/* The four stages a project goes through (the same words the 3D story used) */
const STEPS = [
  {
    stage: 'Consultation',
    title: 'To create, we must understand.',
    body: 'Every project starts with a conversation, not a form. What do your customers need to see? What makes you stand out? Your answers become the brief.',
  },
  {
    stage: 'Design',
    title: 'From sketch to screen, around your brand.',
    body: 'We sketch your layout first, then design it around your brand. You see it before a line of code is written.',
  },
  {
    stage: 'Build',
    title: 'Built properly, pixel by pixel.',
    body: 'Hand-built, fast-loading and fully responsive. We test it on real phones, tablets and desktops before launch.',
    points: ['Mobile-first', 'Basic SEO built in', 'Tested on real devices'],
  },
  {
    stage: 'Launch',
    title: 'Live, and fully yours.',
    body: 'Domain, hosting and SSL handled. Then we walk you through how it all works.',
  },
];

export default function Process() {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-32">
      <PinnedSteps steps={STEPS}>
        <SectionHeading
          align="center"
          title="From first chat"
          accent="to launch day."
          sub="Four steps, and we explain each one in plain English as we go."
        />
      </PinnedSteps>
      <p className="relative z-10 mt-12 text-center">
        <Link
          to="/how-it-works"
          className="inline-flex min-h-11 items-center gap-2 rounded-md font-display font-semibold text-ink outline-none hover:text-orange-ink focus-visible:ring-[3px] focus-visible:ring-ring/45"
        >
          See how it works in detail <ArrowRight className="size-4" />
        </Link>
      </p>
    </section>
  );
}
