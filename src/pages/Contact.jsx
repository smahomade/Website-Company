import { useRef, useState } from 'react';
import Seo from '../components/Seo.jsx';
import PageHero from '../components/PageHero.jsx';
import { WhatsAppIcon } from '../components/Icons.jsx';
import { useFadeIn } from '../hooks/useRevealOnScroll.js';
import { CONTACT, EMAILJS } from '../lib/site.js';
import Mascot from '../components/Mascot.jsx';
import NextSteps from '../components/NextSteps.jsx';
import { FormError, Honeypot } from '../components/EnquiryBits.jsx';
import { checkFields, sendEnquiry } from '../lib/enquiry.js';

export default function Contact() {
  const pageRef = useRef(null);
  const [status, setStatus] = useState('idle'); /* idle | sending | sent */
  const [error, setError] = useState(null);
  const shownAt = useRef(Date.now());
  useFadeIn(pageRef);

  /* checks the fields, keeps bots out, sends (lib/enquiry.js), or says what went wrong */
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const problem = checkFields(form);
    setError(problem);
    if (problem) return;
    const fd = new FormData(form);
    setStatus('sending');
    try {
      await sendEnquiry({
        form,
        shownAt: shownAt.current,
        template: EMAILJS.contactTemplate,
        lead: 'contact',
        params: {
          full_name: fd.get('name') || '',
          reply_to: fd.get('email') || '',
          phone: '',
          subject: fd.get('subject') || 'General Enquiry',
          message: fd.get('message') || '',
          time: new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
        },
      });
      setStatus('sent');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('idle');
      setError('send');
    }
  };

  return (
    <div ref={pageRef}>
      <Seo
        title="Contact — PixelFold"
        description="Get in touch with PixelFold. We build fast, beautiful websites for small businesses. Message us on WhatsApp, email, or fill in our contact form."
        path="/contact"
      />

      <PageHero
        label="Get in Touch"
        title="Get in"
        accent="Touch"
        sub="Need a website for your business? Contact PixelFold and we'll help you get online. Every conversation starts with a free, no-obligation chat."
        badges={['24 hr response', 'No obligation', 'Free consultation']}
        art="plane"
        tab="Contact"
        filed
      />

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* LEFT — Info */}
            <div className="contact-info">
              <h2 className="contact-info-title">Let's talk.</h2>
              <p className="contact-info-sub">Whether you want a brand-new site or need help with an existing one, start with a message. There is no pressure and no obligation.</p>

              <div className="contact-info-cards">
                <div className="contact-info-card">
                  <span className="contact-info-icon">✉️</span>
                  <div>
                    <strong>Email</strong>
                    <a href={'mailto:' + CONTACT.email}>{CONTACT.email}</a>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="contact-info-icon"><WhatsAppIcon size={22} /></span>
                  <div>
                    <strong>Phone &amp; WhatsApp</strong>
                    <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">{CONTACT.phone}</a>
                    <small style={{ display: 'block', opacity: 0.55, fontSize: '0.72rem', marginTop: 3 }}>
                      We prefer WhatsApp texts — gets lost in spam calls otherwise!
                    </small>
                  </div>
                </div>
                <div className="contact-info-card">
                  <span className="contact-info-icon">🕐</span>
                  <div>
                    <strong>Hours</strong>
                    <span>Flexible — message any time</span>
                    <small style={{ display: 'block', opacity: 0.55, fontSize: '0.72rem', marginTop: 3 }}>
                      No fixed office hours. We reply as soon as we're free, usually the same day.
                    </small>
                  </div>
                </div>
              </div>

              <NextSteps />
            </div>

            {/* RIGHT — Form */}
            <div className="contact-form-wrap pf-folder">
              {status !== 'sent' ? (
                <form className="contact-form" onSubmit={onSubmit} noValidate>
                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label htmlFor="contact-name">Your name</label>
                      <input type="text" id="contact-name" name="name" placeholder="Jane Smith" autoComplete="name" required />
                    </div>
                    <div className="contact-form-group">
                      <label htmlFor="contact-email">Email address</label>
                      <input type="email" id="contact-email" name="email" placeholder="jane@example.com" autoComplete="email" required />
                    </div>
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="contact-subject">Subject</label>
                    <select id="contact-subject" name="subject" defaultValue="">
                      <option value="" disabled>What's this about?</option>
                      <option value="new-website">I need a new website</option>
                      <option value="redesign">I want to redesign my existing site</option>
                      <option value="pricing">Pricing question</option>
                      <option value="maintenance">Ongoing maintenance / managed plan</option>
                      <option value="other">Something else</option>
                    </select>
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="contact-message">Your message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="6"
                      placeholder="Tell us a bit about your project — what you do, what you need, and any questions you have…"
                      required
                    />
                  </div>
                  <Honeypot />
                  <FormError error={error} />
                  <button type="submit" className="btn btn-primary contact-submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send it over →'}
                  </button>
                </form>
              ) : (
                <div className="register-success" id="contactSuccess" style={{ display: 'flex' }}>
                  <Mascot variant="success" size={110} />
                  <h3>Message sent!</h3>
                  <p>Thanks for reaching out — we'll get back to you within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
