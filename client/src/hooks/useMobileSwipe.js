import { useEffect, useRef } from 'react';

/**
 * useMobileSwipe — detects horizontal swipe gestures on touch devices.
 *
 * Fires onSwipeLeft  when user swipes right → left  (go to next)
 * Fires onSwipeRight when user swipes left  → right (go to prev)
 *
 * Only triggers for predominantly horizontal swipes (|dx| > |dy| * 1.5)
 * so vertical page scrolling is never blocked.
 */
export function useMobileSwipe({
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  threshold = 55,
}) {
  const startRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    function onTouchStart(e) {
      startRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }

    function onTouchEnd(e) {
      if (!startRef.current) return;
      const dx = e.changedTouches[0].clientX - startRef.current.x;
      const dy = e.changedTouches[0].clientY - startRef.current.y;
      startRef.current = null;

      // Must be predominantly horizontal and exceed distance threshold
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      if (dx < 0) onSwipeLeft?.();   // finger moved left  → next persona
      else         onSwipeRight?.();  // finger moved right → prev persona
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend',   onTouchEnd);
    };
  }, [enabled, onSwipeLeft, onSwipeRight, threshold]);
}
