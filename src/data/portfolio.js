import { R2 } from '../lib/site.js';

const RAZA_OLD = R2 + '/screenshots/Raza/FullWebsiteScreenieRaza-old/';
const RAZA_NEW = R2 + '/screenshots/Raza/FullWebsiteScreenieRaza-new/';
const TOP_OLD = R2 + '/screenshots/TopOne/FullWebsiteScreenieTop1One-old/';
const TOP_NEW = R2 + '/screenshots/TopOne/FullWebsiteScreenieTop1One-new/';
const CWT_NEW = R2 + '/screenshots/ChangeWorkTherapies/FullWebsiteScreenieCWT-new/';

/* `type` is the primary category; `types` (optional) lists every filter
   the project should appear under.
   `slides` is either an array of {before, after, label} (opens the
   before/after compare modal) or a flat array of image URLs (opens the
   simple gallery). Cards without slides are "Coming soon" placeholders.
   `caseStudy` is the project's own page (/portfolio/<id>): only what we know
   to be true about the job, no invented figures. Its `shots` names small
   copies of the first three slides, cropped to the top of each page, in
   public/images/case-studies (<shots>-<n>-600.webp and -1000.webp). */
export const PORTFOLIO = [
  {
    id: 'raza-academy',
    type: 'redesign',
    typeLabel: 'Business Build',
    industry: 'Education',
    title: 'Raza Academy',
    desc: 'An 8-page full redesign for a Richmond-based Islamic education provider. New look, cleaner layout and a smoother user journey — covering courses, home-schooling, registration and contact. Completed and live.',
    preview: R2 + '/screenshots/Raza/raza-academy-banner.JPG',
    previewPos: 'center 12%',
    status: 'live',
    liveUrl: 'https://razaacademy.co.uk',
    caseStudy: {
      title: 'Raza Academy,',
      accent: 'redesigned.',
      pages: '8 pages',
      shots: '/images/case-studies/raza-academy',
      summary: 'A full redesign for a Richmond education provider: clearer courses, an easy way to sign up, and a look that matches the quality of the teaching.',
      need: 'Raza Academy offers tuition in maths and Islamic studies, plus home-schooling, from Richmond. Parents needed to see what was on offer and how to sign up without hunting for it, and the site needed to look as good as the teaching is.',
      built: [
        'A full redesign of all eight pages, rebuilt from scratch',
        'Clearer navigation through courses, home-schooling, registration and contact',
        'A registration page parents can reach from anywhere on the site',
        'Mobile-first layouts throughout',
      ],
      result: 'The new site is live at razaacademy.co.uk. Every page’s before and after is a click away below.',
    },
    slides: [
      { before: RAZA_OLD + 'razaacademy.co.uk_.jpg', after: RAZA_NEW + 'razaacademy.co.uk_new.jpg', label: 'Home' },
      { before: RAZA_OLD + 'razaacademy.co.uk_about.jpg', after: RAZA_NEW + 'razaacademy.co.uk_about_new.jpg', label: 'About' },
      { before: RAZA_OLD + 'razaacademy.co.uk_courses.jpg', after: RAZA_NEW + 'razaacademy.co.uk_services_new.jpg', label: 'Services' },
      { before: RAZA_OLD + 'razaacademy.co.uk_home-schooling.jpg', after: RAZA_NEW + 'razaacademy.co.uk_home-schooling_new.jpg', label: 'Home Schooling' },
      { before: RAZA_OLD + 'razaacademy.co.uk_register.jpg', after: RAZA_NEW + 'razaacademy.co.uk_register_new.jpg', label: 'Register' },
      { before: RAZA_OLD + 'razaacademy.co.uk_contact.jpg', after: RAZA_NEW + 'razaacademy.co.uk_contact_new.jpg', label: 'Contact' },
    ],
  },
  {
    id: 'top-one-salon',
    type: 'redesign',
    typeLabel: 'Custom Build',
    industry: 'Beauty & Hair',
    title: 'Top One Salon',
    desc: 'A fully bespoke website built from scratch — 24 core pages covering hair services, beauty treatments, collections, team profiles, pricing, offers, careers and more, plus their existing SEO pages re-created alongside them, for 40+ pages in all. Now live at topone.co.uk.',
    preview: R2 + '/screenshots/TopOne/top-one-banner.JPG',
    status: 'live',
    liveUrl: 'https://topone.co.uk',
    caseStudy: {
      title: 'Top One Salon,',
      accent: 'built from scratch.',
      pages: '40+ pages',
      shots: '/images/case-studies/top-one-salon',
      summary: 'A fully bespoke site for a Richmond hair and beauty salon, with its existing search pages re-created alongside the new ones.',
      need: 'Top One has been Richmond’s hair and beauty salon since 2005. They wanted a premium, fully bespoke site to match the salon, without losing the search rankings their existing pages had built up over the years.',
      built: [
        '24 core pages: hair services, beauty treatments, collections, team profiles, pricing, offers, careers and more',
        'Their existing SEO pages re-created alongside them, for 40+ pages in all, to protect the rankings they had built',
        'A built-in editor, so the salon can update its own pages',
        'Booking that hands straight over to the salon’s booking system',
      ],
      result: 'The site is live at topone.co.uk. Every page’s before and after is a click away below.',
    },
    slides: [
      { before: TOP_OLD + 'topone.co.uk_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_home.jpg', label: 'Home' },
      { before: TOP_OLD + 'topone.co.uk_about-us_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_aboutus.jpg', label: 'About' },
      { before: TOP_OLD + 'topone.co.uk_collection_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_collection.jpg', label: 'Collection' },
      { before: TOP_OLD + 'topone.co.uk_reviews_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_reviews.jpg', label: 'Reviews' },
      { before: TOP_OLD + 'topone.co.uk_services_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_hair.jpg', label: 'Services' },
      { before: TOP_OLD + 'topone.co.uk_special-offers_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_offers.jpg', label: 'Offers' },
      { before: TOP_OLD + 'topone.co.uk_careers_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_careers.jpg', label: 'Careers' },
      { before: TOP_OLD + 'topone.co.uk_contact-us_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_contact-us.jpg', label: 'Contact' },
      { before: TOP_OLD + 'topone.co.uk_our-team_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_explore_our-team.jpg', label: 'Our Team' },
      { before: TOP_OLD + 'topone.co.uk_services_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_beauty.jpg', label: 'Beauty' },
      { before: TOP_OLD + 'topone.co.uk_special-offers_.jpg', after: TOP_NEW + 'top-one-salon-website.vercel.app_pricing.jpg', label: 'Pricing' },
    ],
  },
  {
    id: 'change-work-therapies',
    type: 'static',
    types: ['static', 'redesign'],
    typeLabel: 'Business Build',
    industry: 'Therapy & Wellbeing',
    title: 'Change Work Therapies',
    desc: 'A custom seven-page website for a therapy practice — covering treatments, clinic details, client testimonials and online session booking, wrapped in a calm, trust-led design.',
    preview: R2 + '/screenshots/ChangeWorkTherapies/changeworktherapies-banner.JPG',
    status: 'live',
    liveUrl: 'https://changeworktherapies.com',
    caseStudy: {
      title: 'Change Work Therapies,',
      accent: 'calm and trust-led.',
      pages: '7 pages',
      shots: '/images/case-studies/change-work-therapies',
      summary: 'A seven-page site for a therapy practice, designed to put visitors at ease and make booking a session simple.',
      need: 'People looking at a therapy practice need to feel at ease before they get in touch. The site had to feel calm, explain the treatments clearly and make booking a session simple.',
      built: [
        'Seven pages: home, about, treatments, the clinic, testimonials, booking and contact',
        'Online session booking',
        'Client testimonials on a page of their own',
        'A calm, trust-led design throughout',
      ],
      result: 'The site is live at changeworktherapies.com. Every page is a click away below.',
    },
    slides: [
      CWT_NEW + 'change-work-therapy.pages.dev_.jpg',
      CWT_NEW + 'change-work-therapy.pages.dev_about-me.jpg',
      CWT_NEW + 'change-work-therapy.pages.dev_treatment.jpg',
      CWT_NEW + 'change-work-therapy.pages.dev_clinic.jpg',
      CWT_NEW + 'change-work-therapy.pages.dev_testimonials.jpg',
      CWT_NEW + 'change-work-therapy.pages.dev_book-session.jpg',
      CWT_NEW + 'change-work-therapy.pages.dev_contact.jpg',
    ],
  },
];

export const PORTFOLIO_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'redesign', label: 'Redesign' },
  { id: 'static', label: 'Static' },
  { id: 'dynamic', label: 'Dynamic' },
];
