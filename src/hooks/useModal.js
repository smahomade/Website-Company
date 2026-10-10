import { useEffect } from 'react';

/* Lock body scroll while `active`, and call `onClose` on Escape. */
export function useModalBehaviour(active, onClose) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [active, onClose]);
}
