import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { CONTACT, LOGO } from '@/lib/site.js';
import { askAgain } from '@/lib/consent.js';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import Logo from './Logo.jsx';

const NAVIGATE = [
  ['/', 'Home'],
  ['/how-it-works', 'How it works'],
  ['/services', 'Services'],
  ['/portfolio', 'Portfolio'],
  ['/contact', 'Contact'],
  ['/quote', 'Get a quote'],
];

/* Each opens the Services page on its own package tab */
const SERVICES = [
  ['/services?package=starter#services', 'Starter websites'],
  ['/services?package=business#services', 'Business websites'],
  ['/services?package=custom#services', 'Custom builds'],
  ['/services?package=custom#services', 'Help with your existing site'],
  ['/services?package=starter#services', 'Hosting and care plans'],
];

/* The footer's watermark: the cat from the logo, very faint, rising out of the bottom-right corner,
   and its paw prints wandering across the footer to it. Still, never animated. Positions are
   percentages of the footer so the trail fits any width; the last print lands just short of the
   cat (480px from the right on wide screens, 170px on phones). */
function trail(n, endFromRight, endY) {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const top = 35 + t * (endY - 35) + Math.sin(t * 5) * 12;
    return {
      left: `calc(${(3 * (1 - t)).toFixed(2)}% + ${t.toFixed(3)} * (100% - ${endFromRight}px))`,
      top: top.toFixed(1) + '%',
      transform: `translateY(${i % 2 ? 12 : -12}px) rotate(${(100 + Math.cos(t * 5) * 25 + (i % 2 ? 10 : -10)).toFixed(0)}deg)`,
    };
  });
}
const PAWS_WIDE = trail(14, 480, 65);
const PAWS_PHONE = trail(8, 170, 85);

function Paw({ style, className }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={'absolute ' + className} style={style}>
      <ellipse cx="16" cy="22" rx="8" ry="6.5" />
      <ellipse cx="6.5" cy="13.5" rx="3" ry="4" />
      <ellipse cx="12.5" cy="7.5" rx="3" ry="4" />
      <ellipse cx="19.5" cy="7.5" rx="3" ry="4" />
      <ellipse cx="25.5" cy="13.5" rx="3" ry="4" />
    </svg>
  );
}

function Watermark() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none print:hidden">
      <div className="absolute inset-0 text-cream opacity-[0.06]">
        {PAWS_WIDE.map((s, i) => <Paw key={'w' + i} style={s} className="hidden size-[30px] md:block" />)}
        {PAWS_PHONE.map((s, i) => <Paw key={'p' + i} style={s} className="size-6 md:hidden" />)}
      </div>
      <img
        src={LOGO.watermark}
        alt=""
        width="416"
        height="424"
        loading="lazy"
        decoding="async"
        className="absolute -right-[50px] -bottom-[82px] w-[240px] rotate-[-8deg] opacity-[0.09] md:right-4 md:-bottom-[112px] md:w-[330px] xl:right-10 xl:-bottom-[150px] xl:w-[440px]"
      />
    </div>
  );
}

const linkClass ='rounded-sm text-[15px] text-cream/70 transition-colors hover:text-cream outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45';
const headingClass = 'font-display text-sm font-bold uppercase tracking-[0.14em] text-cream';

function Column({ title, links }) {
  return (
    <div>
      <h2 className={headingClass}>{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map(([to, label]) => (
          <li key={label}>
            <Link to={to} className={linkClass}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  const iconLink = 'grid size-11 place-items-center rounded-full border border-cream/15 text-cream/80 transition-colors hover:border-cream/40 hover:text-cream outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45';
  return (
    <footer className="relative overflow-hidden bg-coal leading-normal text-cream/70 dark:border-t dark:border-cream/10">
      <Watermark />
      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-14 md:px-8 md:pt-20 md:pb-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-[1.5fr_1fr_1.15fr_1.15fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo tone="dark" />
            <p className="mt-5 font-display text-lg font-semibold text-cream">Little files. Big ideas.</p>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed">
              Websites for small businesses that want to look professional and get more enquiries.
            </p>
            <div className="mt-6 flex gap-2">
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={iconLink}>
                <WhatsAppIcon size={20} />
              </a>
              <a href={CONTACT.phoneHref} aria-label="Phone" className={iconLink}>
                <Phone className="size-5" />
              </a>
            </div>
          </div>
          <Column title="Navigate" links={NAVIGATE} />
          <Column title="Services" links={SERVICES} />
          <div>
            <h2 className={headingClass}>Contact</h2>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li><Link to="/contact" className={linkClass}>Send a message</Link></li>
              <li>London, UK</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PixelFold. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacy" className={linkClass}>Privacy</Link>
            <Link to="/privacy#legal" className={linkClass}>Legal details</Link>
            <button type="button" onClick={askAgain} className={linkClass + ' cursor-pointer'}>Cookie settings</button>
          </p>
        </div>
      </div>
    </footer>
  );
}
