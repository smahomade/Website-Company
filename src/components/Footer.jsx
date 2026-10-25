import { Link } from 'react-router-dom';
import { LOGO, BRAND, CONTACT } from '../lib/site.js';
import { WhatsAppIcon, MailIcon } from './Icons.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand-lockup" aria-label="PixelFold home">
              <img src={LOGO.mark} alt="" className="brand-mark" width="202" height="205" />
              <span className="brand-word" aria-hidden="true">PIXEL<i>FOLD</i></span>
            </Link>
            <p className="footer-tagline">{BRAND.tagline}</p>
            <p>Websites built for small businesses that want to look professional and get more enquiries.</p>
            <div className="social-links">
              <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon size={28} />
              </a>
              <a href={'mailto:' + CONTACT.email} aria-label="Email">
                <MailIcon />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h2 className="footer-heading">Navigate</h2>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/how-it-works">How It Works</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/register">Get a Quote</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h2 className="footer-heading">Contact</h2>
            <ul>
              <li><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
              <li><a href={'mailto:' + CONTACT.email}>{CONTACT.email}</a></li>
              <li>London, UK</li>
            </ul>
          </div>
          <div className="footer-col">
            <h2 className="footer-heading">Services</h2>
            <ul>
              <li>Static Websites</li>
              <li>Dynamic Websites</li>
              <li>E-commerce Stores</li>
              <li>Landing Pages</li>
              <li>Redesigns &amp; Migrations</li>
              <li>Maintenance Plans</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PixelFold. All rights reserved.</p>
          <p>Crafted in the UK.</p>
        </div>
      </div>
    </footer>
  );
}
