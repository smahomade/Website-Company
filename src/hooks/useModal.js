import { useEffect } from 'react';

/* Lock page scroll while `active`, and call `onClose` on Escape.
   The lock goes on <html>, which is what scrolls here. Putting it on <body>
   doesn't stop the page scrolling and turns body into a scroll container,
   which unpins every position: sticky element (the home story's stage, the
   Services aside). The stable gutter keeps the page from shifting sideways
   when the scrollbar goes. */
export function useModalBehaviour(active, onClose) {
  useEffect(() => {
    if (!active) return undefined;
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    root.style.overflow = 'hidden';
    root.style.scrollbarGutter = 'stable';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev.overflow;
      root.style.scrollbarGutter = prev.gutter;
      document.removeEventListener('keydown', onKey);
    };
  }, [active, onClose]);
}
