/* Folder-based pictograms in the chunky rounded style of the PixelFold logo.
   Every icon is the same yellow folder with a different glyph on its front,
   so icons across the site read as one family. */

const GLYPHS = {
  /* drawn in a 24x24 box, stroke-based, currentColor */
  none: null,
  chat: (
    <>
      <path d="M4 5h16v10H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20l4-1 11-11-3-3L5 16z" />
      <path d="M13 8l3 3" />
    </>
  ),
  code: (
    <>
      <path d="M8 6l-6 6 6 6" />
      <path d="M16 6l6 6-6 6" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 2 5 6 5 10l-2 2H9l-2-2c0-4 2-8 5-10z" />
      <path d="M9 15l-1 4M15 15l1 4M12 21v-3" />
      <circle cx="12" cy="9" r="1.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18h3" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.7 0-2.5 1-2.5 2.2 0 2.8 5 1.6 5 4.3 0 1.2-.9 2.2-2.6 2.2-1.1 0-2.1-.5-2.6-1.5" />
      <path d="M12 6.5v2M12 15.5v2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="14" r="4" />
      <path d="M11 11l9-9M16 6l3 3M13 9l3 3" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.5 1.5A3.3 3.3 0 0 0 7 18z" />
    </>
  ),
  bolt: (
    <>
      <path d="M13 2L5 13h6l-1 9 8-11h-6z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.2 2.2M16.2 16.2l2.2 2.2M5.6 18.4l2.2-2.2M16.2 7.8l2.2-2.2" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.5 4a5 5 0 0 0-4.6 6.9L3 17.8 6.2 21l6.9-6.9A5 5 0 0 0 20 9.5l-3 1-2.5-2.5 1-3z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  stack: (
    <>
      <path d="M4 8h5l2 2h9v10H4z" />
      <path d="M7 5h4l2 2h7v2" />
    </>
  ),
  single: (
    <>
      <circle cx="12" cy="13" r="2.2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 8l9 6 9-6" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
    </>
  ),
  check: (
    <>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </>
  ),
  question: (
    <>
      <path d="M9 9.5a3 3 0 1 1 4.2 2.7c-.8.4-1.2 1-1.2 1.8v.5" />
      <circle cx="12" cy="18" r="1" />
    </>
  ),
};

/**
 * FolderIcon — yellow folder with a glyph on the front.
 * kind: one of GLYPHS keys. size: px. tone: 'yellow' | 'orange' | 'charcoal'.
 */
export function FolderIcon({ kind = 'none', size = 48, tone = 'outline', className = '' }) {
  const glyph = GLYPHS[kind] ?? null;
  const fills = {
    outline: { back: '#E9E5DE', front: '#FFFDF8', ink: '#111111', glyph: '#111111' },
    yellow: { back: '#E6A93A', front: '#FFC83D', ink: '#111111', glyph: '#111111' },
    dark: { back: '#2A2622', front: '#3D3935', ink: '#FFFDF8', glyph: '#FF8A3D' },
    orange: { back: '#D95A00', front: '#FF6A00', ink: '#111111', glyph: '#FFFDF8' },
    charcoal: { back: '#2A2622', front: '#3D3935', ink: '#111111', glyph: '#FFC83D' },
  }[tone];

  return (
    <svg
      className={('pf-folder-icon ' + className).trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      {/* back panel with tab */}
      <path
        d="M8 16h15l6 6h27a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z"
        fill={fills.back}
        stroke={fills.ink}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* front panel */}
      <path
        d="M6 30h52a3 3 0 0 1 3 3l-2 17a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4L3 33a3 3 0 0 1 3-3z"
        fill={fills.front}
        stroke={fills.ink}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* the two little pixels from the logo */}
      <rect x="47" y="45" width="5" height="5" rx="1" fill="#FF6A00" />
      <rect x="52" y="49" width="3.5" height="3.5" rx="0.8" fill="#FF8A3D" />
      {glyph && (
        <g
          transform="translate(20 30) scale(0.95)"
          stroke={fills.glyph}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {glyph}
        </g>
      )}
    </svg>
  );
}

/** Pixel squares motif — used as a decorative divider / bullet. */
export function PixelSquares({ size = 18, className = '' }) {
  return (
    <svg className={('pf-pixels ' + className).trim()} width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <rect x="0" y="0" width="8" height="8" rx="1.5" fill="#FF6A00" />
      <rect x="9" y="5" width="6" height="6" rx="1.2" fill="#FF8A3D" />
      <rect x="3" y="11" width="5" height="5" rx="1" fill="#FFD1B0" />
      <rect x="11" y="12" width="4" height="4" rx="1" fill="#C24E00" />
    </svg>
  );
}
