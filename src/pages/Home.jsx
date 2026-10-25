import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ScrollStory from '../components/story/ScrollStory.jsx';
import Pricing from '../components/Pricing.jsx';
import Testimonials from '../components/Testimonials.jsx';
import { FolderIcon, PixelSquares } from '../components/BrandIcons.jsx';
import useRevealOnScroll, { useFadeIn } from '../hooks/useRevealOnScroll.js';

const WHY_US = [
  { kind: 'clock', title: 'Fast turnaround', desc: 'Most websites are ready in 1–2 weeks. No lengthy delays, no waiting months to go live.' },
  { kind: 'phone', title: 'Mobile-friendly', desc: 'Every site we build looks great on phones, tablets, and desktops. Your customers browse on mobile — we make sure you look good.' },
  { kind: 'coin', title: 'Honest pricing', desc: 'Every project is scoped and quoted individually, and agreed before we start. No surprise invoices, no hidden extras.' },
  { kind: 'search', title: 'Basic SEO included', desc: 'Every site comes with basic SEO setup so Google can find you. We also help with domain, hosting, and Google Business if you need it.' },
];

export default function Home() {
  const pageRef = useRef(null);
  useFadeIn(pageRef);
  useRevealOnScroll(pageRef, '.hiw-header', { addClass: 'hiw-header--visible', threshold: 0.25 });
  useRevealOnScroll(pageRef, '.hiw-step-card', { addClass: 'hiw-visible', threshold: 0.12 });

  return (
    <div ref={pageRef}>
      <Seo
        title="PixelFold — Little files, big ideas. Websites for small businesses"
        description="PixelFold designs and builds fast, beautiful websites for small businesses, from the first conversation to launch day. Quoted per project and explained in plain English."
        path="/"
      />

      <ScrollStory />

      <div className="home-after">
        <Pricing />
        <Testimonials />

        <section className="how-it-works" id="why-us">
          <div className="container">
            <div className="hiw-header">
              <p className="section-label hiw-label">Why PixelFold?</p>
              <h2 className="hiw-title">
                Everything a small business needs<br /><em>to get online properly.</em>
              </h2>
              <p className="hiw-subtitle">We keep things simple, honest, and affordable — so you can focus on running your business.</p>
            </div>
            <div className="hiw-steps">
              {WHY_US.map((w) => (
                <div className="hiw-step-card pf-folder" key={w.title}>
                  <div className="hiw-icon-box" aria-hidden="true"><FolderIcon kind={w.kind} size={46} /></div>
                  <h3 className="hiw-card-title">{w.title}</h3>
                  <p className="hiw-card-desc">{w.desc}</p>
                </div>
              ))}
            </div>
            <div className="pf-divider" aria-hidden="true"><PixelSquares size={20} /></div>
            <div className="hiw-cta">
              <Link to="/register" className="btn hiw-btn">Start your website</Link>
              <Link to="/contact" className="btn btn-outline hiw-btn-secondary">Contact PixelFold</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
