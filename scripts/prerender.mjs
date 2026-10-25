/* After `vite build` (the site) and `vite build --ssr src/entry-server.jsx` (a renderer for it),
   save every page as finished HTML: dist/index.html, dist/services.html, dist/portfolio/<id>.html
   and so on, plus dist/404.html. Each gets its own title, description, canonical link and Open
   Graph tags, and its content already in place; the browser then picks it up (hydrateRoot). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const { render, ROUTES, NOT_FOUND } = ssr;
const SITE_URL = 'https://www.pixelfold.co.uk';
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* swap one tag's content in the template, failing loudly if the template has changed shape */
function swap(html, pattern, replacement, what) {
  if (!pattern.test(html)) throw new Error('prerender: no ' + what + ' in index.html');
  return html.replace(pattern, replacement);
}

function page(rendered, url) {
  const { html, head } = rendered;
  if (!head.title) throw new Error('prerender: ' + url + ' rendered no <Seo>');
  const canonical = SITE_URL + (head.path || url);
  let out = template;
  out = swap(out, /<title>[^<]*<\/title>/, '<title>' + esc(head.title) + '</title>', 'title');
  out = swap(out, /<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="' + esc(head.description) + '" />', 'description');
  out = swap(out, /<link rel="canonical" href="[^"]*" \/>/, '<link rel="canonical" href="' + esc(canonical) + '" />', 'canonical');
  out = swap(out, /<meta property="og:title" content="[^"]*" \/>/, '<meta property="og:title" content="' + esc(head.title) + '" />', 'og:title');
  out = swap(out, /<meta property="og:description" content="[^"]*" \/>/, '<meta property="og:description" content="' + esc(head.description) + '" />', 'og:description');
  out = swap(out, /<meta property="og:url" content="[^"]*" \/>/, '<meta property="og:url" content="' + esc(canonical) + '" />', 'og:url');
  if (head.noindex) out = out.replace('</title>', '</title>\n  <meta name="robots" content="noindex" />');
  return swap(out, /<div id="root"><\/div>/, '<div id="root">' + html + '</div>', 'root');
}

/* The home page puts its loading picture on the 3D folder's spot at first paint, with the same
   maths ScrollStory uses once it runs (storyLayout.js), unless the visitor wants the still
   version or the page opens part way down. */
const placePoster = `<script>(function () {
  var TAN_HALF = ${ssr.TAN_HALF}, FH = ${ssr.FH}, FOLDER_SCALE = ${ssr.FOLDER_SCALE}, POSTERS = ${JSON.stringify(ssr.POSTERS)};
  ${ssr.storyLayout.toString()}
  ${ssr.introFolder.toString()}
  try {
    var choice = null;
    try { choice = localStorage.getItem('pf-story-motion'); } catch (e) {}
    if (choice === 'off' || (choice !== 'on' && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var img = document.querySelector('.story-poster'), section = document.querySelector('.story');
    if (!img || !section || section.getBoundingClientRect().top < -20) return;
    var stage = img.parentElement, w = stage.clientWidth, h = stage.clientHeight;
    var P = storyLayout(w, h).portrait ? POSTERS.tall : POSTERS.wide, f = introFolder(w, h), k = f.h / P.fh;
    if (img.getAttribute('src') !== P.src) img.setAttribute('src', P.src);
    img.style.cssText = 'width:' + P.w * k + 'px;height:' + P.h * k + 'px;left:' + (f.x - P.x * k) + 'px;top:' + (f.y - P.y * k) + 'px;visibility:visible';
  } catch (e) {}
})();</script>`;

/* and starts fetching the right one (upright screens get the tall one) with the page itself */
const posterPreloads = [
  ['tall', '(max-aspect-ratio: 19/20)'],
  ['wide', 'not all and (max-aspect-ratio: 19/20)'],
].map(([k, media]) => `  <link rel="preload" as="image" href="${ssr.POSTERS[k].src}" media="${media}" fetchpriority="high" />`).join('\n');

/* '/' → index.html, '/services' → services.html, '/portfolio/raza-academy' → portfolio/raza-academy.html
   (hosts serve /services from services.html, so the addresses stay as they are) */
const fileFor = (url) => (url === '/' ? 'index.html' : url.slice(1) + '.html');
const write = (file, html) => {
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
  fs.writeFileSync(path.join(dist, file), html);
};

for (const url of ROUTES) {
  let html = page(await render(url), url);
  if (url === '/') html = html.replace('</head>', () => posterPreloads + '\n  </head>').replace('</body>', () => '  ' + placePoster + '\n  </body>');
  write(fileFor(url), html);
  console.log('prerendered', url);
}
write('404.html', page(await render(NOT_FOUND), NOT_FOUND));
console.log('prerendered 404');

/* the sitemap, from the same list of pages */
const priority = (url) => (url === '/' ? '1.0' : url === '/services' ? '0.9' : url.startsWith('/portfolio/') ? '0.7' : url === '/contact' ? '0.6' : '0.8');
const urls = ROUTES.map((url) => `  <url><loc>${SITE_URL}${url}</loc><priority>${priority(url)}</priority></url>`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
console.log('wrote sitemap.xml (' + ROUTES.length + ' pages)');
