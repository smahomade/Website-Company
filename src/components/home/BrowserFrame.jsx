import { cn } from '@/lib/utils';

/* A plain browser window around a screenshot or video: three dots and the site's address */
export default function BrowserFrame({ url, className, children }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lg', className)}>
      <div className="flex h-8 items-center gap-1.5 border-b border-ink/[0.08] bg-sand px-3" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-ink/15" />
        <span className="size-2.5 rounded-full bg-ink/15" />
        <span className="size-2.5 rounded-full bg-ink/15" />
        {url && (
          <span className="ml-2 min-w-0 truncate rounded-md bg-white px-2.5 py-0.5 text-[11px] font-semibold text-ink/70">{url}</span>
        )}
      </div>
      {children}
    </div>
  );
}
