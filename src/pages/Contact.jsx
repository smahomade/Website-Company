import { useRef, useState } from 'react';
import { ArrowUpRight, Clock, Mail } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import NextSteps from '@/components/site/NextSteps.jsx';
import { ErrorSummary, Field, Honeypot, PrivacyNote, SendError, SentPanel, SubmitButton, useFormErrors } from '@/components/site/form.jsx';
import { Input, Select, Textarea } from '@/components/ui/input';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { checkFields, sendEnquiry } from '@/lib/enquiry.js';
import { CONTACT, EMAILJS } from '@/lib/site.js';

const SUBJECTS = ['I need a new website', 'I want to redesign my existing site', 'A question about pricing', 'Ongoing maintenance or a managed plan', 'Something else'];

/* The ways to reach us besides the form. WhatsApp first: calls from unknown numbers often get
   lost among spam. */
function Ways() {
  const card = 'flex gap-4 rounded-[22px] border border-ink/10 bg-card p-5';
  const icon = 'grid size-11 shrink-0 place-items-center rounded-xl';
  return (
    <ul className="space-y-3">
      <li className={card}>
        <span className={icon + ' bg-[#25D366]/15 text-[#128C4B]'}><WhatsAppIcon size={22} /></span>
        <div className="min-w-0">
          <p className="font-display font-bold text-ink">WhatsApp or phone</p>
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-ink underline-offset-4 hover:text-orange-ink hover:underline">
            {CONTACT.phone} <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only">(opens WhatsApp)</span>
          </a>
          <p className="text-sm leading-relaxed text-muted-foreground">A WhatsApp message is best: calls often get lost among spam.</p>
        </div>
      </li>
      <li className={card}>
        <span className={icon + ' bg-orange-tint text-orange-ink'}><Mail aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0">
          <p className="font-display font-bold text-ink">Email</p>
          <a href={'mailto:' + CONTACT.email} className="inline-flex min-h-11 items-center break-all font-semibold text-ink underline-offset-4 hover:text-orange-ink hover:underline">
            {CONTACT.email}
          </a>
        </div>
      </li>
      <li className={card}>
        <span className={icon + ' bg-sand text-ink'}><Clock aria-hidden="true" className="size-5" /></span>
        <div>
          <p className="font-display font-bold text-ink">Hours</p>
          <p className="font-semibold text-ink">Flexible: message any time</p>
          <p className="text-sm leading-relaxed text-muted-foreground">No fixed office hours. We reply as soon as we’re free, usually the same day.</p>
        </div>
      </li>
    </ul>
  );
}

export default function Contact() {
  const [status, setStatus] = useState('idle'); /* idle | sending | sent */
  const [sendFailed, setSendFailed] = useState(false);
  const errs = useFormErrors();
  const shownAt = useRef(Date.now());

  /* checks the fields, keeps bots out, sends (lib/enquiry.js), or says what went wrong */
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const problems = checkFields(form);
    errs.show(problems);
    setSendFailed(false);
    if (problems.length) return;
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
          subject: fd.get('subject') || 'General enquiry',
          message: fd.get('message') || '',
          time: new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
        },
      });
      setStatus('sent');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('idle');
      setSendFailed(true);
    }
  };

  return (
    <div className="leading-normal">
      <Seo
        title="Contact — PixelFold"
        description="Get in touch with PixelFold. We build fast, beautiful websites for small businesses. Message us on WhatsApp, email, or fill in our contact form."
        path="/contact"
      />
      <PageHeader
        title="Let’s talk about"
        accent="your website."
        sub="Need a new site, or help with the one you’ve got? Send a message and we’ll reply within 24 hours. Every conversation starts with a free, no-obligation chat."
      />

      <section className="bg-background pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">Other ways to reach us</h2>
            <Ways />
            <NextSteps />
          </div>

          {/* the form first on phones; beside the other ways from lg up */}
          <div className="max-lg:order-first rounded-[28px] border border-ink/10 bg-card p-6 md:p-9">
            {status === 'sent' ? (
              <SentPanel title="Message sent!" text="Thanks for getting in touch. We’ll get back to you within 24 hours, usually the same day." />
            ) : (
              <form noValidate onSubmit={onSubmit} onInput={errs.onInput} className="relative space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">Send us a message</h2>
                  <p className="mt-1.5 text-muted-foreground">
                    Fields marked <span className="text-orange-ink">*</span> are needed.
                  </p>
                </div>
                <ErrorSummary errors={errs.errors} summaryRef={errs.summaryRef} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="contact-name" label="Your name" required error={errs.messageFor('contact-name')}>
                    <Input name="name" autoComplete="name" data-error="Enter your name" />
                  </Field>
                  <Field id="contact-email" label="Email address" required error={errs.messageFor('contact-email')}>
                    <Input type="email" name="email" autoComplete="email" inputMode="email" data-error="Enter your email address" />
                  </Field>
                </div>
                <Field id="contact-subject" label="What’s it about?">
                  <Select name="subject" defaultValue="">
                    <option value="">Choose one…</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
                <Field
                  id="contact-message"
                  label="Your message"
                  required
                  hint="What you do, what you need, and any questions you have."
                  error={errs.messageFor('contact-message')}
                >
                  <Textarea name="message" rows={6} data-error="Tell us a little about what you need" />
                </Field>
                <Honeypot />
                {sendFailed && <SendError />}
                <div className="flex flex-col gap-4">
                  <SubmitButton sending={status === 'sending'}>Send message</SubmitButton>
                  <PrivacyNote />
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
