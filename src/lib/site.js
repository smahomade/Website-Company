export const SITE_URL = 'https://www.pixelfold.co.uk';
export const R2 = 'https://pub-6d3ae22e684b4feaab4ea4d3b9f86c86.r2.dev';
export const BRAND = {
  name: 'PixelFold',
  tagline: 'Your ideas, well folded.',
};
export const LOGO = {
  mark: '/images/brand/pixelfold-mark.png',        /* cat + folder, transparent */
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
  email: 'info@pixelfold.co.uk',
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
