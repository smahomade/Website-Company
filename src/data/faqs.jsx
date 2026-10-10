/* FAQ entries for the How It Works page. `a` is JSX-free text; entries
   that need markup provide a `render` function instead. */
export const FAQS = [
  {
    q: 'How long does it take to build a website?',
    render: () => (
      <p>
        Honestly, it varies quite a bit. The number of pages, how many design ideas we go through before landing on the right one, changes mid-build, and how smoothly communication flows between us all play a part. On average, most projects land somewhere between <strong>2–6 weeks</strong>. The more responsive you are with feedback, the faster things move.
      </p>
    ),
  },
  {
    q: 'How much does a website cost?',
    link: { to: '/services', label: 'See the packages →' },
    a: 'There is no fixed price list — every project is scoped and quoted individually after a free consultation, so you only pay for what your site actually needs. Take a look at the packages to see what each one covers. ',
  },
  {
    q: 'What do I need to get started?',
    a: "Not much. A rough idea of what you want and a little info about your business is enough. If you have a logo that's great, but it's not required. We'll guide you through everything else on the first call.",
  },
  {
    q: "Do I own the website when it's done?",
    a: 'Yes — if you choose a one-off build, the website is entirely yours. You get all the files, the source code, and full ownership. If you\'re on a managed plan we look after it for you, but you can leave at any time with no penalty.',
  },
  {
    q: 'Will it work on mobile and tablet?',
    a: 'Every website we build is fully responsive — it looks and works great on phones, tablets, and desktops. Mobile-first design is non-negotiable for us, and it\'s factored into every build from day one.',
  },
  {
    q: 'Can I make changes myself after launch?',
    a: "If we built your website from scratch — then unless you know how to code, making changes yourself isn't really an option. But if we're working with an existing site built on something like Wix or WordPress, those are drag-and-drop platforms, so yes — you can absolutely adjust things yourself without touching any code.",
  },
  {
    q: 'Do you handle hosting and the domain?',
    a: "Yes. We can set up your domain and hosting as part of the project. If you already have them, we'll work with what you've got. Either way, we'll walk you through everything so nothing is left unclear.",
  },
  {
    q: "What if I want changes after it's built?",
    a: "If you're on a managed plan, basic changes are included — just ask. If you took a one-off build, your final revision is the one before we go live. After that, the site is yours to manage. Any additional work beyond that can always be quoted separately.",
  },
  {
    q: "What's the difference between a static and dynamic website?",
    render: () => (
      <p>
        <strong>Static site</strong> — Simple, fast, secure, and cost-effective. Perfect for most businesses. Think of it as a website without a login or registration system — it just presents your business clearly and professionally.
        <br />
        <br />
        <strong>Dynamic site</strong> — More complex. It stores and handles information — things like user accounts, login and register systems, bookings, or e-commerce. Not sure which you need? We'll tell you honestly, and we'll never push you towards more than you actually need.
      </p>
    ),
  },
  {
    q: 'Do I need to write the content myself?',
    a: "Ideally, yes. We can write content for you, but here's the honest truth — you know your business better than anyone. Even when we do write it, there's a good chance you'll want changes because it doesn't quite sound like you. That's completely normal. If you're stuck, we're happy to help shape what you've got. We'll never hold up your build over content we could help with.",
  },
];
