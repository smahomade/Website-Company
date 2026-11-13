import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { CONTACT, LOGO } from '@/lib/site.js';

/* The page's one big orange moment: a folder (tab and all) asking for the enquiry */
export default function CtaBand() {
  return (
    <section className="bg-background px-3 pb-20 pt-6 md:px-5 md:pb-28">
      <div data-reveal className="relative mx-auto max-w-6xl pt-7">
        <div aria-hidden="true" className="absolute left-0 top-0 h-10 w-[38%] max-w-[300px] rounded-t-[22px] bg-primary" />
        <div className="relative overflow-hidden rounded-[28px] rounded-tl-none bg-primary px-7 py-14 md:px-14 md:py-20">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.035em] text-ink text-balance">
              Got an idea? Let’s fold it into a website.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink">
              Tell us about your business and what you need. The first conversation is free, and you’ll get a clear quote in writing.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="dark">
                <Link to="/quote">
                  Get a free quote <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline-dark">
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon size={18} /> WhatsApp us
                </a>
              </Button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 -right-4 hidden w-[230px] rotate-[-8deg] rounded-[34px] bg-cream p-4 shadow-lg md:block lg:right-10 lg:w-[260px]"
          >
            <img src={LOGO.mark} alt="" width="202" height="205" className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
