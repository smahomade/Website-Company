# PixelFold — website

React single-page app built with Vite and React Router.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build for production

```bash
npm run build      # outputs static files to dist/
npm run preview    # serves dist/ locally
```

## Deploying (Cloudflare Pages / Netlify / any static host)

- Build command: `npm run build`
- Output directory: `dist`
- The host must serve `index.html` for unknown paths (SPA fallback). Cloudflare
  Pages does this automatically when there is no `404.html`.
- `public/_redirects` permanently redirects the old `*.html` URLs
  (e.g. `/services.html`) to the new clean routes (`/services`).

## Project layout

```
index.html            Vite entry (fonts, Google Analytics tag)
public/               Static assets copied as-is (logos, robots.txt, sitemap.xml, _redirects)
src/
  main.jsx            React root + BrowserRouter
  App.jsx             Routes (incl. legacy .html redirects)
  styles.css          Global stylesheet (unchanged from the static site)
  lib/site.js         Site-wide constants: R2 CDN base, logo paths, contact details, EmailJS IDs
  lib/analytics.js    Page-view tracking for route changes
  components/         Navbar, Footer, Seo, PageHero, modals, hero reel, icons
  hooks/              Scroll-reveal, typewriter and modal behaviour hooks
  data/               Content: service packages, portfolio projects, hero reel cards, FAQs
  pages/              One component per route
```

## Editing content

- Prices / packages: `src/data/services.js` (also used by the "View Details" modal).
- Portfolio projects and before/after screenshots: `src/data/portfolio.js`.
- Hero reel cards on the home page: `src/data/heroCards.js`.
- FAQ entries: `src/data/faqs.jsx`.
- Contact details, EmailJS service/template IDs: `src/lib/site.js`.
