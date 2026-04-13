import { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import styles from './PaperBurnIntro.module.scss';

const LETTER_FADE_IN = 600;
const HOLD = 1800;
const MERGE_DURATION = 1.8;
const EXPAND_DURATION = 1.2;
const SETTLE = 300;

const SAYINGS = [
  'asked her out. she said maybe. still running.',
  'was writing a cv, ended up making a solar system.',
  'she wanted red flags. i only had green commits.',
  'dubai. 28 degrees. 5am. single.',
  'the only thing faster than my code is how quickly they stop replying.',
];

export default function PaperBurnIntro({ onComplete }) {
  const wrapperRef = useRef(null);
  const dotRef = useRef(null);
  const lettersRef = useRef([]);
  const textContainerRef = useRef(null);
  const completedRef = useRef(false);

  const [text] = useState(() => SAYINGS[Math.floor(Math.random() * SAYINGS.length)]);

  // Reset refs array to match current text length
  lettersRef.current.length = text.length;

  const setLetterRef = useCallback((el, i) => {
    if (el) lettersRef.current[i] = el;
  }, []);

  useEffect(() => {
    // Wait for fonts + next frame to ensure all refs are populated
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => runAnimation());
    });
  }, [runAnimation]);

  const runAnimation = useCallback(() => {
    const wrapper = wrapperRef.current;
    const letters = lettersRef.current;
    const textContainer = textContainerRef.current;
    const dot = dotRef.current;
    if (!wrapper || letters.length === 0 || !dot) return;

    // Phase 1: Fade in letters
    gsap.fromTo(letters,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.025,
        ease: 'power2.out',
        onComplete: () => {
          gsap.delayedCall(HOLD / 1000, () => startMerge());
        }
      }
    );

    function startMerge() {
      const containerRect = textContainer.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;

      // Show the dot immediately at center — it starts as a tiny seed
      // that the letters are collapsing into
      gsap.set(dot, { opacity: 0, scale: 0 });

      // Single GSAP timeline for the entire merge→dot→expand sequence
      const tl = gsap.timeline();

      // All letters converge to center simultaneously
      letters.forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        const dx = centerX - (rect.left + rect.width / 2);
        const dy = centerY - (rect.top + rect.height / 2);

        // Letters fly in, shrink, and darken — all in one smooth motion
        tl.to(letter, {
          x: dx,
          y: dy,
          scale: 0,
          color: '#000000',
          duration: MERGE_DURATION,
          ease: 'power3.in', // accelerating — gravitational pull
        }, 0); // all start at same time
      });

      // The black dot grows from nothing as letters arrive
      // It starts growing at 60% through the merge — letters feed into it
      tl.to(dot, {
        opacity: 1,
        scale: 1.5,  // small dot first (15px diameter)
        duration: MERGE_DURATION * 0.5,
        ease: 'power2.in',
      }, MERGE_DURATION * 0.55);

      // Hide letters at the end of merge (they're scale:0 but still in DOM)
      tl.set(letters, { opacity: 0 }, MERGE_DURATION);

      // Now expand the dot to fill the screen — fast and decisive
      const maxSize = Math.hypot(window.innerWidth, window.innerHeight) * 1.3;
      const targetScale = maxSize / 10; // dot is 10px base

      tl.to(dot, {
        scale: targetScale,
        duration: EXPAND_DURATION,
        ease: 'power3.in', // fast acceleration — like an explosion in reverse
      }, MERGE_DURATION + 0.05); // tiny gap for the dot to "sit" before expanding

      // Complete
      tl.call(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          // Small settle in darkness, then hand off
          gsap.delayedCall(SETTLE / 1000, () => onComplete?.());
        }
      }, null, `>+${SETTLE / 1000}`);
    }
  }, [onComplete]);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={textContainerRef} className={styles.textContainer}>
        {text.split('').map((char, i) => (
          <span
            key={i}
            ref={(el) => setLetterRef(el, i)}
            className={`${styles.letter} ${char === ' ' ? styles.space : ''}`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  );
}
