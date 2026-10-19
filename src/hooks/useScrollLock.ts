import { useEffect } from 'react';

// Pop-ups can be stacked (e.g. booking opened from the patient portal), so the page
// is unlocked only when the last one closes.
let openLocks = 0;

/** Stops the page behind a pop-up from scrolling while `active` is true. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    if (openLocks === 0) {
      // Keep the layout from shifting when the scrollbar disappears.
      const scrollbarWidth = window.innerWidth - root.clientWidth;
      root.style.overflow = 'hidden';
      if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
    }
    openLocks += 1;
    return () => {
      openLocks -= 1;
      if (openLocks === 0) {
        root.style.overflow = '';
        root.style.paddingRight = '';
      }
    };
  }, [active]);
}
