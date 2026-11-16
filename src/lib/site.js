export const SITE_URL = 'https://www.pixelfold.co.uk';
export const R2 = 'https://pub-6d3ae22e684b4feaab4ea4d3b9f86c86.r2.dev';
export const BRAND = {
  name: 'PixelFold',
  tagline: 'Your ideas, well folded.',
};
export const LOGO = {
  mark: '/images/brand/pixelfold-mark.webp',       /* cat + folder, transparent (.png: the original) */
  lockup: '/images/brand/pixelfold-lockup.png',    /* horizontal mark + wordmark */
  stacked: '/images/brand/pixelfold-stacked.png',  /* stacked mark + wordmark */
  icon: '/images/brand/pixelfold-icon.png',        /* rounded app icon */
  mono: '/images/brand/pixelfold-mono.png',
  strip: '/images/brand/pixelfold-strip.jpg',      /* footer brand strip */
};
export const CONTACT = {
  phone: '+44 7469 469 061',
  phoneHref: 'tel:+447469469061',
  whatsapp: 'https://wa.me/447469469061',
  /* no email address on the site, to keep it off spam lists: the forms (EmailJS) and WhatsApp
     instead (the one exception is the legal details, see LEGAL). The phone number is never shown
     as text either, only behind the WhatsApp and phone links and icons. */
};
/* The legal details a business website has to show (Electronic Commerce Regulations 2002,
   reg. 6): who runs it, where, and an email address. They live in one place, the privacy page's
   "Legal details" (#legal), linked from every footer. The email is the one exception to "no email
   on the site", and it's put together in the browser so it isn't sitting in the prebuilt HTML for
   address-harvesting bots. Only the town is shown: the business is run from home. */
export const LEGAL = {
  owner: 'Safee Mahomade',
  status: 'sole trader',
  place: 'London, United Kingdom',
  email: ['info', 'pixelfold.co.uk'],
};
/* live chat (components/site/ChatButton.jsx): the ids from tawk.to's embed code, which is public */
export const TAWK = {
  property: '6af9fffed9f7b63c46b292dd',
  widget: 'default',
};
export const EMAILJS = {
  publicKey: 'lIvXq3M_cI0eN71RJ',
  service: 'service_wpmt56n',
  quoteTemplate: 'template_64k892h',
  contactTemplate: 'template_g0ddwvl',
};
export const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
