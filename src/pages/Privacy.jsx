import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo.jsx';
import PageHeader from '@/components/site/PageHeader.jsx';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/site.js';
import { askAgain, getChoice, GA_ID, onChoiceChange } from '@/lib/consent.js';

const UPDATED = '30 October 2026';

/* What this site collects, why, for how long, and the visitor's rights, in plain English. Keep it
   in step with the code: the forms (lib/enquiry.js), analytics (lib/consent.js) and anything the
   site keeps in the browser. */
export default function Privacy() {
  /* read after the first render: the prebuilt page can't know this browser's answer */
  const [choice, setChoice] = useState(undefined);
  useEffect(() => {
    const read = () => setChoice(getChoice());
    read();
    return onChoiceChange(read);
  }, []);
  const mail = <a href={'mailto:' + CONTACT.email}>{CONTACT.email}</a>;

  return (
    <article className="leading-normal">
      <Seo
        title="Privacy and cookies — PixelFold"
        description="What PixelFold collects through this website, why, how long it is kept, and how to change your cookie choice."
        path="/privacy"
      />
      <PageHeader
        title="Your details,"
        accent="handled properly."
        sub="What PixelFold collects through this website, why, and what you can do about it. If anything here is unclear, email us and we’ll explain."
      />
      {/* the text below is styled from here: headings, paragraphs, lists, links and the table */}
      <div className="mx-auto max-w-6xl px-5 pb-24 md:px-8 md:pb-32">
      <div className="max-w-3xl [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-orange-ink [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_p]:mt-4 [&_p]:text-[17px] [&_p]:leading-relaxed [&_p]:text-ink/80 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-[17px] [&_ul]:leading-relaxed [&_ul]:text-ink/80 [&_ul]:marker:text-orange-ink">
        <p className="!mt-0 text-sm !text-muted-foreground">Last updated {UPDATED}</p>

        <div className="mt-6 flex flex-col gap-4 rounded-[24px] border border-ink/10 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="!mt-0 !text-xl">Your cookie choice</h2>
            <p className="!mt-1.5 !text-[15px]">
              {choice === 'yes'
                ? 'Analytics is on: you said yes to Google Analytics in this browser.'
                : choice === 'no'
                  ? 'Analytics is off: you said no in this browser, so nothing is sent to Google Analytics.'
                  : 'You haven’t chosen yet, so Google Analytics isn’t running.'}
            </p>
          </div>
          <Button variant="outline" onClick={askAgain} className="shrink-0">
            Change cookie settings
          </Button>
        </div>

        <h2>Who we are</h2>
        <p>
          PixelFold is a web design studio based in London, UK. We are responsible for the personal information described on
          this page (the “controller”, in data protection terms). You can reach us at {mail} or on{' '}
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
        </p>

        <h2>When you send us an enquiry</h2>
        <p>
          The <Link to="/quote">quote form</Link> asks for your name, email address, phone number, business name, industry, your
          current website if you have one, and what you need. The <Link to="/contact">contact form</Link> asks for your name,
          email address, a subject and your message.
        </p>
        <p>
          We use these details to reply, to prepare a quote, and, if you go ahead, to run your project. Both forms are delivered
          to our inbox by EmailJS, an email sending service. We rely on taking the steps you’ve asked for before any agreement,
          and on our legitimate interest in answering the people who contact us.
        </p>

        <h2>When you email, call or message us</h2>
        <p>
          We use what you send in the same way. WhatsApp messages go through WhatsApp, which is run by Meta under its own
          privacy policy.
        </p>

        <h2>Analytics, only if you say yes</h2>
        <p>
          With your permission we use Google Analytics to see which pages are visited, how people found the site (a search or
          a link, for example), roughly where they are (town or country), what kind of device and browser they use, and which
          steps they take, such as opening the quote form or sending a form. It never sees what you type into a form.
        </p>
        <p>
          It works by setting cookies, so nothing loads from Google Analytics until you say yes, and you can change your mind
          at any time with the button above. Google handles this data for us and may process it outside the UK.
        </p>

        <h2>Cookies and what the site remembers</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-ink/10 bg-card">
          <table className="w-full min-w-[540px] text-left text-[15px] [&_code]:rounded [&_code]:bg-sand [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_td]:border-t [&_td]:border-ink/10 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:text-ink/80 [&_th]:bg-sand/70 [&_th]:px-4 [&_th]:py-3 [&_th]:font-display [&_th]:font-bold [&_th]:text-ink">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">What it’s for</th>
                <th scope="col">How long</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>_ga</code>, <code>{'_ga_' + GA_ID.replace(/^G-/, '')}</code></td>
                <td>Google Analytics cookies, set only if you say yes, to tell one visit from the next.</td>
                <td>Up to 2 years</td>
              </tr>
              <tr>
                <td><code>pf-analytics</code></td>
                <td>Remembers your answer to the cookie question. Kept in your browser, never sent to us.</td>
                <td>Until you clear it</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>There are no advertising cookies on this site.</p>

        <h2>Other services the site relies on</h2>
        <p>
          Cloudflare hosts this website and its images and videos. Like any web host, it handles your IP address to deliver
          pages and to keep the site secure. The site’s fonts come from Google Fonts, so your browser fetches them from
          Google’s servers, which also see your IP address.
        </p>

        <h2>How long we keep things</h2>
        <ul>
          <li>Enquiries that don’t become a project: deleted within 12 months.</li>
          <li>
            Client projects: kept while we work together, and invoices and accounts for as long as UK tax law requires
            (normally six years).
          </li>
          <li>Google Analytics visit data: no longer than 14 months.</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          We don’t sell or rent your details. They are shared only with the services named on this page, which work on our
          instructions, or where the law requires it.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask for a copy of what we hold about you, ask us to correct or delete it, object to how we use it or ask us
          to limit it, ask for it in a form you can take elsewhere, and withdraw your consent to analytics at any time. Email{' '}
          {mail} and we’ll reply within one month.
        </p>
        <p>
          If you’re unhappy with how we’ve handled your information, you can complain to the Information Commissioner’s Office
          at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or on
          0303 123 1113. We’d appreciate the chance to put things right first.
        </p>

        <h2>Changes to this page</h2>
        <p>If we change how we handle your details, we’ll update this page and the date at the top.</p>
      </div>
      </div>
    </article>
  );
}
