import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import styles from './CursorEffect.module.scss';

function CursorEffect() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Dot — instant
  const dotX = useSpring(cursorX, { stiffness: 1200, damping: 50 });
  const dotY = useSpring(cursorY, { stiffness: 1200, damping: 50 });

  // Ring — slight lag, much tighter than before
  const ringX = useSpring(cursorX, { stiffness: 550, damping: 38 });
  const ringY = useSpring(cursorY, { stiffness: 550, damping: 38 });

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      document.body.style.cursor = '';
      return;
    }

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.body.style.cursor = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isMobile, cursorX, cursorY, isVisible]);

  if (isMobile) return null;

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      {/* Outer ring — slight lag */}
      <motion.div
        className={styles.glowRing}
        style={{ x: ringX, y: ringY, opacity: isVisible ? 1 : 0 }}
      />
      {/* Center dot — instant */}
      <motion.div
        className={styles.cursorDot}
        style={{ x: dotX, y: dotY, opacity: isVisible ? 1 : 0 }}
      />
    </div>
  );
}

export default CursorEffect;
