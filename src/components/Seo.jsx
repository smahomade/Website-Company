import { createContext, useContext, useEffect } from 'react';
import { SITE_URL } from '../lib/site.js';

/* While the build renders each page to HTML (entry-server.jsx), this collects the page's head
   tags so scripts/prerender.mjs can write them into that page's <head>. */
export const HeadContext = createContext(null);

function setMeta(attr, key, content) {
  let el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/* Per-page <head> tags: title, description, canonical and Open Graph. */
export default function Seo({ title, description, path = '/', noindex = false }) {
  const head = useContext(HeadContext);
  if (head) Object.assign(head, { title, description, path, noindex });
  useEffect(() => {
    const url = SITE_URL + path;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, path]);
  return null;
}
