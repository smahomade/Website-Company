import { Link } from 'react-router-dom';
import Seo from '@/components/Seo.jsx';
import { Button } from '@/components/ui/button';
import { LOGO } from '@/lib/site.js';

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-background px-5 pb-20 pt-32 leading-normal">
      <Seo title="Page not found — PixelFold" description="That page isn't in any of our folders." path="/404" noindex />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgba(17,17,17,0.09)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_45%,#000_30%,transparent_100%)]"
      />
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="grid size-40 place-items-center rounded-[40px] bg-orange-tint p-6">
          <img src={LOGO.mark} alt="" width="202" height="205" className="h-auto w-full" />
        </span>
        <p className="mt-8 font-display text-sm font-bold uppercase tracking-[0.16em] text-orange-ink">404</p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-bold leading-[1.05] tracking-[-0.04em] text-ink">
          This folder is{' '}
          <span className="box-decoration-clone bg-[linear-gradient(transparent_60%,rgba(255,106,0,0.8)_60%,rgba(255,106,0,0.8)_92%,transparent_92%)] px-[0.04em]">
            empty.
          </span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">The page you were after isn’t filed anywhere we can find. The cat has had a look too.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/">Back to the front page</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Tell us what you were looking for</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
