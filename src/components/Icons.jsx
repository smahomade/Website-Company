/* Small inline SVG icons reused across pages. */

export function WhatsAppIcon({ size = 22 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.663 4.617 1.817 6.528L4 29l7.698-1.793A12.94 12.94 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10a10.94 10.94 0 0 1-5.39-1.418l-.38-.22-3.94.917.95-3.822-.237-.386A9.953 9.953 0 0 1 6 15c0-5.514 4.486-10 10-10zm-3.3 5.5c-.2 0-.52.074-.793.37-.272.297-1.04 1.016-1.04 2.477s1.065 2.873 1.213 3.072c.149.198 2.066 3.292 5.1 4.484.713.274 1.27.438 1.703.561.716.203 1.368.174 1.883.105.574-.077 1.768-.723 2.018-1.42.25-.698.25-1.296.175-1.42-.074-.124-.273-.198-.572-.347-.298-.148-1.768-.872-2.04-.97-.273-.1-.472-.148-.67.149-.199.297-.77.97-.944 1.168-.173.199-.347.224-.645.075-.298-.149-1.257-.463-2.394-1.477-.885-.788-1.482-1.762-1.655-2.06-.173-.298-.018-.459.13-.607.132-.133.298-.347.447-.52.148-.174.198-.298.297-.497.1-.198.05-.372-.025-.52-.074-.149-.67-1.613-.918-2.208-.241-.578-.486-.5-.67-.51a12.7 12.7 0 0 0-.57-.01z" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function CheckIcon({ size = 13, className, fill = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={fill} className={className} aria-hidden="true">
      <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 20, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 20, strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function CloseIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PlayIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 001.5.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 008 5.5z" />
    </svg>
  );
}

export function PauseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="5.5" y="4.5" width="4.5" height="15" rx="1.2" />
      <rect x="14" y="4.5" width="4.5" height="15" rx="1.2" />
    </svg>
  );
}

export function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function PagesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M1 6l5.5 5.5L12 6l5.5 5.5L23 6" />
      <path d="M1 13l5.5 5.5L12 13l5.5 5.5L23 13" />
    </svg>
  );
}

export function ScreenshotIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6M9 12h6M9 15h4" />
    </svg>
  );
}
