import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';
import { HeadContext } from './components/Seo.jsx';
import { PORTFOLIO } from './data/portfolio.js';

/* for the home page's inline script that places the loading picture before any JS arrives */
export { storyLayout, introFolder, POSTERS, TAN_HALF, FH, FOLDER_SCALE } from './components/story/storyLayout.js';

/* Built at build time (vite build --ssr) and run by scripts/prerender.mjs, which saves every
   page below as finished HTML, so link previews and search engines get each page's own title,
   description and words without running any JavaScript. */
export const ROUTES = ['/', '/how-it-works', '/services', '/portfolio', '/contact', '/register', ...PORTFOLIO.map((p) => '/portfolio/' + p.id)];
export const NOT_FOUND = '/404';

/* One page as HTML, and its head tags (from its <Seo>). Waits for lazily loaded pages.
   progressiveChunkSize: React otherwise moves any part over ~12 KB (most of our bigger pages)
   into a hidden block that a script reveals a few hundred ms later, a blank hero on phones. */
export async function render(url) {
  const head = {};
  const { prelude } = await prerenderToNodeStream(
    <HeadContext.Provider value={head}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HeadContext.Provider>,
    { progressiveChunkSize: Infinity }
  );
  let html = '';
  for await (const chunk of prelude) html += chunk;
  return { html, head };
}
