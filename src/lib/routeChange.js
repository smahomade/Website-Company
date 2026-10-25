/* Google Analytics page views for a single-page app: gtag is loaded in
   index.html with send_page_view disabled, so we report each route change. */
export function trackPageView(path, title) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}
