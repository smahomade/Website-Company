/* Chapters of the home page's 3D scroll story. Order matters: the scene's
   choreography in components/story/storyScene.js keys off each index.
   `side` is where the copy sits on wide screens; the 3D focus takes the
   other half. */
export const STORY_CHAPTERS = [
  {
    id: 'intro',
    rail: 'Intro',
    side: 'left',
    eyebrow: 'Little files. Big ideas.',
    title: 'We’ll build',
    accent: 'your website.',
    body: 'PixelFold designs and builds fast, beautiful websites for small businesses, and explains every step in plain English.',
  },
  {
    id: 'brief',
    rail: 'Brief',
    num: '01',
    side: 'right',
    eyebrow: 'Consultation',
    title: 'To create, we must',
    accent: 'understand.',
    body: 'Every project starts with a conversation, not a form. What do your customers need to see? What makes you stand out? Your answers become the brief.',
  },
  {
    id: 'design',
    rail: 'Design',
    num: '02',
    side: 'left',
    eyebrow: 'Design',
    title: 'From sketch to screen,',
    accent: 'around your brand.',
    body: 'We sketch your layout around the brief first, then design it around your brand: from a template you like, a site you admire, or a blank page. You see it before a line of code is written.',
  },
  {
    id: 'build',
    rail: 'Build',
    num: '03',
    side: 'right',
    eyebrow: 'Build',
    title: 'Built properly,',
    accent: 'pixel by pixel.',
    body: 'Hand-built, fast-loading and fully responsive. We test on real phones, tablets and desktops until every piece is right.',
    points: ['Mobile-first', 'Basic SEO built in', 'Tested on real devices'],
  },
  {
    id: 'launch',
    rail: 'Launch',
    num: '04',
    side: 'left',
    eyebrow: 'Launch',
    title: 'Live, and',
    accent: 'fully yours.',
    body: 'Domain, hosting and SSL handled. Then we walk you through everything, so you’re never left in the dark. Most sites go live in 1\u2060–\u20602\u00a0weeks.', /* word joiners + nbsp keep "1–2 weeks" on one line */
  },
  {
    id: 'work',
    rail: 'Work',
    side: 'left',
    eyebrow: 'Recent work',
    title: 'Already live for businesses',
    accent: 'like yours.',
    body: 'A few of the sites we’ve designed and built. Yours could be next.',
  },
];
