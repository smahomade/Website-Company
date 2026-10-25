import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';

/* The home page ships with the app; every other page is its own chunk, loaded
   when it is first visited (and fetched quietly once the home page has settled,
   so moving around the site stays instant). */
const pages = {
  howItWorks: () => import('./pages/HowItWorks.jsx'),
  services: () => import('./pages/Services.jsx'),
  portfolio: () => import('./pages/Portfolio.jsx'),
  caseStudy: () => import('./pages/CaseStudy.jsx'),
  contact: () => import('./pages/Contact.jsx'),
  register: () => import('./pages/Register.jsx'),
  notFound: () => import('./pages/NotFound.jsx'),
};
const HowItWorks = lazy(pages.howItWorks);
const Services = lazy(pages.services);
const Portfolio = lazy(pages.portfolio);
const CaseStudy = lazy(pages.caseStudy);
const Contact = lazy(pages.contact);
const Register = lazy(pages.register);
const NotFound = lazy(pages.notFound);

/* while a page's chunk arrives: the charcoal its banner starts with, a screen tall */
const page = (Page) => (
  <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
    <Page />
  </Suspense>
);

export default function App() {
  useEffect(() => {
    let idle = 0;
    const timer = setTimeout(() => {
      const fetchAll = () => Object.values(pages).forEach((load) => load().catch(() => {}));
      if (window.requestIdleCallback) idle = window.requestIdleCallback(fetchAll, { timeout: 4000 });
      else fetchAll();
    }, 3000);
    return () => {
      clearTimeout(timer);
      if (idle && window.cancelIdleCallback) window.cancelIdleCallback(idle);
    };
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={page(HowItWorks)} />
        <Route path="services" element={page(Services)} />
        <Route path="portfolio" element={page(Portfolio)} />
        <Route path="portfolio/:id" element={page(CaseStudy)} />
        <Route path="contact" element={page(Contact)} />
        <Route path="register" element={page(Register)} />

        {/* Legacy static-site URLs (also redirected at the CDN via public/_redirects) */}
        <Route path="index.html" element={<Navigate to="/" replace />} />
        <Route path="how-it-works.html" element={<Navigate to="/how-it-works" replace />} />
        <Route path="services.html" element={<Navigate to="/services" replace />} />
        <Route path="portfolio.html" element={<Navigate to="/portfolio" replace />} />
        <Route path="contact.html" element={<Navigate to="/contact" replace />} />
        <Route path="register.html" element={<Navigate to="/register" replace />} />

        <Route path="*" element={page(NotFound)} />
      </Route>
    </Routes>
  );
}
