import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Layers, LayoutTemplate, Mail, PanelsTopLeft, Puzzle, Wrench } from 'lucide-react';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import NextSteps from '@/components/site/NextSteps.jsx';
import { ErrorSummary, Field, FieldError, Honeypot, PrivacyNote, SendError, SentPanel, SubmitButton, useFormErrors } from '@/components/site/form.jsx';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { WhatsAppIcon } from '@/components/Icons.jsx';
import { checkFields, sendEnquiry } from '@/lib/enquiry.js';
import { CONTACT, EMAILJS, PREFERS_REDUCED_MOTION } from '@/lib/site.js';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'Starter', hint: '1-page site', icon: LayoutTemplate },
  { value: 'Business', hint: '3–6 pages', icon: Layers },
  { value: 'Custom', hint: 'Tailored build', icon: Puzzle },
];

/* The packages under each type; the value is what arrives in the email */
const TIERS = {
  Starter: [
    ['Starter — One-Off Build', 'One-off build (you host it)'],
    ['Starter — We Manage', 'We manage it (hosting included)'],
    ['Starter+ — Priority', 'Starter+ Priority (fast changes)'],
    ['Starter+++ — Backend', 'Starter+++ Backend (login features)'],
  ],
  Business: [
    ['Business — One-Off Build', 'One-off build (you host it)'],
    ['Business — We Manage', 'We manage it (hosting included)'],
    ['Business+ — Priority', 'Business+ Priority (fast changes)'],
    ['Business+++ — Backend', 'Business+++ Backend (login features)'],
  ],
  Custom: [
    ['Custom — Help With Existing Site', 'Help with my existing site (fixes, improvements, support)'],
    ['Custom — Fully Custom Build', 'A fully custom website build'],
  ],
};

/* A row of choice cards (radio buttons underneath, so arrow keys and screen readers work) */
const choiceCard =
  'group relative flex cursor-pointer rounded-2xl border border-ink/12 bg-white p-4 transition-[border-color,box-shadow,background-color] hover:border-ink/30 has-[:checked]:border-ink has-[:checked]:shadow-md has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/45';

function YourDetails({ prefix, errs }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Field id={prefix + '_name'} label="Full name" required error={errs.messageFor(prefix + '_name')}>
        <Input name="full_name" autoComplete="name" data-error="Enter your name" />
      </Field>
      <Field id={prefix + '_biz'} label="Business name">
        <Input name="business_name" autoComplete="organization" />
      </Field>
      <Field id={prefix + '_email'} label="Email address" required error={errs.messageFor(prefix + '_email')}>
        <Input type="email" name="email" autoComplete="email" inputMode="email" data-error="Enter your email address" />
      </Field>
      <Field id={prefix + '_phone'} label="Phone number">
        <Input type="tel" name="phone" autoComplete="tel" inputMode="tel" />
      </Field>
    </div>
  );
}

/* The brief in short steps, one group of questions at a time. Every step stays in the page (the
   ones not showing are hidden), so the whole brief goes in one send. Continue checks only the
   step on screen; Send checks the lot and goes back to any step that needs fixing. */
function BriefSteps({ intent, steps, extraCheck, buildParams, sentText }) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle'); /* idle | sending | sent */
  const [sendFailed, setSendFailed] = useState(false);
  const errs = useFormErrors();
  const shownAt = useRef(Date.now());
  const formRef = useRef(null);
  const last = steps.length - 1;

  const problemsIn = (root) => [...checkFields(root), ...(extraCheck ? extraCheck(root) : [])];

  const goTo = (n) => {
    setStep(n);
    errs.show([]);
    requestAnimationFrame(() => {
      const form = formRef.current;
      if (!form) return;
      if (form.getBoundingClientRect().top < 80) form.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'instant' : 'smooth', block: 'start' });
      form.querySelector('[data-step="' + n + '"] h2')?.focus({ preventScroll: true });
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSendFailed(false);
    if (step < last) {
      /* Continue (or Enter in a field): check this step, then move on */
      const problems = problemsIn(form.querySelector('[data-step="' + step + '"]'));
      if (problems.length) return errs.show(problems);
      return goTo(step + 1);
    }
    const problems = problemsIn(form);
    if (problems.length) {
      const first = form.querySelector('#' + problems[0].id)?.closest('[data-step]');
      const at = first ? Number(first.dataset.step) : step;
      if (at !== step) setStep(at);
      return errs.show(problems.filter((p) => form.querySelector('#' + p.id)?.closest('[data-step]') === first));
    }
    setStatus('sending');
    const fd = new FormData(form);
    const params = {
      intent: intent === 'new' ? 'New Website' : 'Existing Website',
      full_name: fd.get('full_name') || '',
      business_name: fd.get('business_name') || '',
      reply_to: fd.get('email') || '',
      phone: fd.get('phone') || '',
      description: fd.get('description') || '',
      time: new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }),
      pkg_category: '',
      pkg_tier: '',
      industry: '',
      timeline: '',
      website_url: '',
      platform: '',
      help_type: '',
      ...buildParams(fd),
    };
    try {
      await sendEnquiry({ form, shownAt: shownAt.current, template: EMAILJS.quoteTemplate, params, lead: intent === 'new' ? 'quote_new' : 'quote_existing' });
      setStatus('sent');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('idle');
      setSendFailed(true);
    }
  };

  if (status === 'sent') return <SentPanel title="Brief received!" text={sentText} />;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} onInput={errs.onInput} onChange={errs.onInput} className="relative space-y-7">
      {/* progress: which step, and a bar in as many parts as there are steps */}
      <div>
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">
          Step {step + 1} of {steps.length}
          <span aria-hidden="true" className="text-ink/40"> · </span>
          <span className="text-ink">{steps[step].title}</span>
        </p>
        <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.title} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-ink/10')} />
          ))}
        </div>
      </div>

      <ErrorSummary errors={errs.errors} summaryRef={errs.summaryRef} />

      {steps.map((s, i) => (
        <fieldset key={s.title} data-step={i} hidden={i !== step} className="space-y-6">
          <legend className="sr-only">{s.title}</legend>
          <div>
            <h2 tabIndex={-1} className="font-display text-2xl font-bold tracking-[-0.02em] text-ink outline-none">{s.heading}</h2>
            {s.intro && <p className="mt-1.5 text-muted-foreground">{s.intro}</p>}
          </div>
          {s.content(errs)}
        </fieldset>
      ))}

      <Honeypot />
      {sendFailed && <SendError />}

      <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => goTo(step - 1)} className="self-start">
            <ArrowLeft /> Back
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {step < last ? (
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Continue <ArrowRight />
          </Button>
        ) : (
          <SubmitButton sending={status === 'sending'}>Send my brief</SubmitButton>
        )}
      </div>
      {step === last && <PrivacyNote />}
    </form>
  );
}

/* ── New website ── */
function NewWebsiteBrief() {
  const [category, setCategory] = useState('');
  const [unsure, setUnsure] = useState(false);

  const steps = [
    { title: 'Your details', heading: 'First, who are we talking to?', intro: 'So we know who to reply to.', content: (errs) => <YourDetails prefix="new" errs={errs} /> },
    {
      title: 'Package',
      heading: 'What kind of site?',
      intro: 'A rough idea is fine. We’ll help you pick properly on the call.',
      content: (errs) => (
        <div className="space-y-5">
          <div role="radiogroup" aria-labelledby="pkg-label" aria-describedby={errs.messageFor('pkg_starter') ? 'pkg-error' : undefined}>
            <p id="pkg-label" className="mb-3 font-display text-[15px] font-semibold text-ink">
              Package type{!unsure && <span aria-hidden="true" className="text-orange-ink"> *</span>}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CATEGORIES.map(({ value, hint, icon: Icon }) => (
                <label key={value} className={cn(choiceCard, 'flex-col items-start gap-3', unsure && 'opacity-50')}>
                  <input
                    type="radio"
                    name="pkg_category"
                    value={value}
                    id={'pkg_' + value.toLowerCase()}
                    data-error-for="pkg_starter"
                    checked={category === value}
                    disabled={unsure}
                    onChange={() => setCategory(value)}
                    className="sr-only"
                  />
                  <span className="grid size-10 place-items-center rounded-xl bg-orange-tint text-orange-ink">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-bold text-ink">{value}</span>
                    <span className="block text-sm text-muted-foreground">{hint}</span>
                  </span>
                  <Check aria-hidden="true" className="absolute right-3 top-3 size-5 rounded-full bg-ink p-1 text-cream opacity-0 transition-opacity group-has-[:checked]:opacity-100" strokeWidth={3} />
                </label>
              ))}
            </div>
            {errs.messageFor('pkg_starter') && (
              <div className="mt-3">
                <FieldError id="pkg-error">{errs.messageFor('pkg_starter')}</FieldError>
              </div>
            )}
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-semibold text-ink">
            <input
              type="checkbox"
              name="pkg_unsure"
              data-error-for="pkg_starter"
              checked={unsure}
              onChange={(e) => setUnsure(e.target.checked)}
              className="size-5 cursor-pointer rounded accent-[#ff6a00]"
            />
            I’m not sure yet: just get in touch
          </label>

          {category && !unsure && (
            <Field key={category} id="pkg_tier" label={category === 'Custom' ? 'What do you need?' : 'Which ' + category + ' package?'} required error={errs.messageFor('pkg_tier')}>
              <Select name="pkg_tier" defaultValue="" data-error="Choose a package">
                <option value="">Choose one…</option>
                {TIERS[category].map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      ),
    },
    {
      title: 'Your project',
      heading: 'Tell us about the project',
      intro: 'The more you share, the sharper the quote.',
      content: (errs) => (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="new_timeline" label="When would you like it?">
            <Select name="timeline" defaultValue="">
              <option value="">Choose one…</option>
              <option value="As soon as possible">As soon as possible</option>
              <option value="Within 1 month">Within a month</option>
              <option value="2–3 months">In 2–3 months</option>
              <option value="Flexible">I’m flexible</option>
            </Select>
          </Field>
          <Field id="new_industry" label="Your industry">
            <Input name="industry" placeholder="e.g. hair salon, tutoring" />
          </Field>
          <Field
            id="new_desc"
            label="What do you need?"
            required
            hint="What you do, who your customers are, and anything you’d like the site to have."
            error={errs.messageFor('new_desc')}
            className="sm:col-span-2"
          >
            <Textarea name="description" rows={5} data-error="Tell us a little about the project" />
          </Field>
        </div>
      ),
    },
  ];

  /* the package type: one of the cards, or the "not sure" tick */
  const extraCheck = (root) =>
    root.querySelector('[name="pkg_category"]') && !category && !unsure ? [{ id: 'pkg_starter', message: 'Choose a package type, or tick “I’m not sure yet”' }] : [];

  return (
    <BriefSteps
      intent="new"
      steps={steps}
      extraCheck={extraCheck}
      buildParams={(fd) => ({
        pkg_category: unsure ? 'Not sure yet' : category,
        pkg_tier: category && !unsure ? fd.get('pkg_tier') || '' : '',
        industry: fd.get('industry') || '',
        timeline: fd.get('timeline') || '',
      })}
      sentText="We’ll look over your project and come back within 24 hours with next steps and a quote."
    />
  );
}

/* ── Existing website ── */
function ExistingWebsiteBrief() {
  const steps = [
    { title: 'Your details', heading: 'First, who are we talking to?', intro: 'So we know who to reply to.', content: (errs) => <YourDetails prefix="ex" errs={errs} /> },
    {
      title: 'Your website',
      heading: 'Which site is it?',
      content: (errs) => (
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="ex_url" label="Website address" required error={errs.messageFor('ex_url')} className="sm:col-span-2">
            <Input type="url" name="website_url" inputMode="url" autoComplete="url" placeholder="yourbusiness.co.uk" data-error="Enter your website’s address" />
          </Field>
          <Field id="ex_platform" label="What is it built with?">
            <Select name="platform" defaultValue="">
              <option value="">Choose one…</option>
              <option>WordPress</option>
              <option>Squarespace</option>
              <option>Wix</option>
              <option>Custom / hand-coded</option>
              <option>Not sure</option>
            </Select>
          </Field>
          <Field id="ex_help" label="What do you need help with?">
            <Select name="help_type" defaultValue="">
              <option value="">Choose one…</option>
              <option>Bug fixes / technical issues</option>
              <option>Design refresh / redesign</option>
              <option>Speed &amp; performance</option>
              <option>Adding new pages or features</option>
              <option>Ongoing maintenance</option>
              <option>Something else</option>
            </Select>
          </Field>
        </div>
      ),
    },
    {
      title: 'Tell us more',
      heading: 'What’s going on?',
      content: (errs) => (
        <Field id="ex_desc" label="Tell us more" required hint="What’s not working, or what you’d like to change." error={errs.messageFor('ex_desc')}>
          <Textarea name="description" rows={6} data-error="Tell us what’s going on with the site" />
        </Field>
      ),
    },
  ];

  return (
    <BriefSteps
      intent="existing"
      steps={steps}
      buildParams={(fd) => ({
        website_url: fd.get('website_url') || '',
        platform: fd.get('platform') || '',
        help_type: fd.get('help_type') || '',
      })}
      sentText="We’ll take a look and come back to you within 24 hours with next steps."
    />
  );
}

const INTENTS = [
  { value: 'new', title: 'A new website', text: 'Built from scratch, around your business.', icon: PanelsTopLeft },
  { value: 'existing', title: 'Help with my site', text: 'Fixes, a refresh or new features.', icon: Wrench },
];

export default function Quote() {
  const [intent, setIntent] = useState('new');

  return (
    <div className="leading-normal">
      <Seo
        title="Get a Free Quote — PixelFold"
        description="Get a free, no-obligation quote from PixelFold. Tell us about your project and we'll get back to you within 24 hours."
        path="/quote"
      />
      <PageHeader
        label="Free quote"
        title="Tell us about"
        accent="your project."
        sub="A short brief, about two minutes. We’ll come back within 24 hours with a clear scope, timeline and quote. No obligation."
        chips={['100% free', 'Quoted per project', 'Reply within 24 hours', 'No commitment']}
      />

      <section className="bg-background pb-24 md:pb-32">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-12">
          <div className="space-y-5">
            {/* what the brief is about; both briefs stay in the page so nothing typed is lost */}
            <fieldset>
              <legend className="mb-3 font-display text-[15px] font-semibold text-ink">What do you need?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {INTENTS.map(({ value, title, text, icon: Icon }) => (
                  <label key={value} className={cn(choiceCard, 'items-center gap-4 p-5')}>
                    <input type="radio" name="intent" value={value} checked={intent === value} onChange={() => setIntent(value)} className="sr-only" />
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-orange-tint text-orange-ink">
                      <Icon aria-hidden="true" className="size-6" />
                    </span>
                    <span>
                      <span className="block font-display text-lg font-bold text-ink">{title}</span>
                      <span className="block text-sm text-muted-foreground">{text}</span>
                    </span>
                    <Check aria-hidden="true" className="absolute right-3 top-3 size-5 rounded-full bg-ink p-1 text-cream opacity-0 transition-opacity group-has-[:checked]:opacity-100" strokeWidth={3} />
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rounded-[28px] border border-ink/10 bg-card p-6 shadow-sm md:p-9">
              <div hidden={intent !== 'new'}>
                <NewWebsiteBrief />
              </div>
              <div hidden={intent !== 'existing'}>
                <ExistingWebsiteBrief />
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <NextSteps title="After you send your brief" />
            <div className="rounded-[24px] border border-ink/10 bg-card p-6 shadow-sm">
              <p className="font-display text-lg font-bold text-ink">Rather talk it through?</p>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">Send a message and we’ll arrange a quick call when it suits you.</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon size={18} /> WhatsApp us
                  </a>
                </Button>
                <Button asChild variant="ghost">
                  <a href={'mailto:' + CONTACT.email}>
                    <Mail /> {CONTACT.email}
                  </a>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
