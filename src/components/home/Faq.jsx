import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { FAQS } from '@/data/faqs.jsx';
import { CONTACT } from '@/lib/site.js';
import SectionHeading from './SectionHeading.jsx';

/* The questions people ask before they buy, picked from the full list in data/faqs.jsx */
const PICK = [
  'How much does a website cost?',
  'How long does it take to build a website?',
  'What do I need to get started?',
  "Do I own the website when it's done?",
  'Do you handle hosting and the domain?',
  "What if I want changes after it's built?",
];
const ITEMS = PICK.map((q) => FAQS.find((f) => f.q === q)).filter(Boolean);

/* The answers as structured data, so search engines can read them while they're folded away */
const FAQ_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ITEMS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.text || f.a } })),
}).replace(/</g, '\\u003c');

export default function Faq() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading title="Questions," accent="answered." sub="Can’t see yours? Ask us directly. We reply within 24 hours, usually the same day." />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={18} /> WhatsApp us
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a href={'mailto:' + CONTACT.email}>
                <Mail /> {CONTACT.email}
              </a>
            </Button>
          </div>
        </div>

        <div data-reveal className="rounded-[28px] border border-ink/10 bg-card px-6 py-2 md:px-8">
          <Accordion type="single" collapsible defaultValue="faq-0">
            {ITEMS.map((f, i) => (
              <AccordionItem key={f.q} value={'faq-' + i}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent className="[&_strong]:font-bold [&_strong]:text-ink">
                  {f.render ? f.render() : <p>{f.a}</p>}
                  {f.link && (
                    <Link to={f.link.to} className="mt-2 inline-flex min-h-11 items-center font-display font-semibold text-orange-ink hover:underline">
                      {f.link.label}
                    </Link>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_SCHEMA }} />
    </section>
  );
}
