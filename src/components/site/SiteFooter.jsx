import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { CONTACT } from '@/lib/site.js';
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

const linkClass = 'rounded-sm text-[15px] text-cream/70 transition-colors hover:text-cream outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45';
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
    <footer className="relative overflow-hidden bg-ink leading-normal text-cream/70">
      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-8 md:px-8 md:pt-20">
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
              <a href={'mailto:' + CONTACT.email} aria-label="Email" className={iconLink}>
                <Mail className="size-5" />
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
              <li><a href={CONTACT.phoneHref} className={linkClass}>{CONTACT.phone}</a></li>
              <li><a href={'mailto:' + CONTACT.email} className={linkClass}>{CONTACT.email}</a></li>
              <li>London, UK</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PixelFold. All rights reserved.</p>
          <p className="flex gap-5">
            <Link to="/privacy" className={linkClass}>Privacy</Link>
            <button type="button" onClick={askAgain} className={linkClass + ' cursor-pointer'}>Cookie settings</button>
          </p>
        </div>
      </div>
      {/* drawn, not typed: it's decoration, and contrast checkers would read faint text as a fault */}
      <svg aria-hidden="true" viewBox="0 0 1000 150" className="-mb-[1.5%] block w-full select-none text-cream/[0.05]">
        <text x="500" y="146" textAnchor="middle" textLength="990" lengthAdjust="spacingAndGlyphs" fill="currentColor" fontFamily="Outfit, sans-serif" fontWeight="800" fontSize="196">
          PIXELFOLD
        </text>
      </svg>
    </footer>
  );
}
