import { Link } from 'react-router-dom';
import { LOGO } from '@/lib/site.js';
import { cn } from '@/lib/utils';

/* The cat mark + PIXELFOLD wordmark, linking home. tone="dark" for charcoal backgrounds. */
export default function Logo({ tone = 'light', className }) {
  return (
    <Link
      to="/"
      aria-label="PixelFold home"
      className={cn('flex shrink-0 items-center gap-2 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45', className)}
    >
      <img src={LOGO.mark} alt="" width="202" height="205" className="h-9 w-auto" />
      <span
        aria-hidden="true"
        className={cn('font-display text-[19px] font-extrabold tracking-[0.01em]', tone === 'dark' ? 'text-cream' : 'text-ink')}
      >
        PIXEL<span className="text-primary">FOLD</span>
      </span>
    </Link>
  );
}
