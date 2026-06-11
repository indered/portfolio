import { useRef, useEffect, useCallback, useState } from 'react';
import gsap from 'gsap';
import styles from './PaperBurnIntro.module.scss';

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

function splitReceiptLines(text) {
  const sentenceParts = text
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((part) => part.trim())
    .filter(Boolean) || [text];

  const baseParts = sentenceParts.length > 1
    ? sentenceParts
    : text.split(/,\s+/).map((part, index, arr) => (
        index < arr.length - 1 ? `${part},` : part
      ));

  return baseParts.flatMap((part) => {
    if (part.length <= 34) return [part];

    const lines = [];
    let line = '';
    for (const word of part.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > 34 && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  });
}

export default function PaperBurnIntro({ onComplete }) {
  const wrapperRef = useRef(null);
  const dotRef = useRef(null);
  const lettersRef = useRef([]);
  const lineInnerRefs = useRef([]);
  const textContainerRef = useRef(null);
  const completedRef = useRef(false);

  const [text] = useState(() => SAYINGS[Math.floor(Math.random() * SAYINGS.length)]);
  const lines = splitReceiptLines(text);
  const letterCount = lines.reduce((sum, line) => sum + line.length, 0);

  // Reset refs array to match current text length
  lettersRef.current.length = letterCount;
  lineInnerRefs.current.length = lines.length;

  const setLetterRef = useCallback((el, i) => {
    if (el) lettersRef.current[i] = el;
  }, []);

  const setLineInnerRef = useCallback((el, i) => {
    if (el) lineInnerRefs.current[i] = el;
  }, []);

  const runAnimation = useCallback(() => {
    const wrapper = wrapperRef.current;
    const letters = lettersRef.current.filter(Boolean);
    const lineInners = lineInnerRefs.current.filter(Boolean);
    const textContainer = textContainerRef.current;
    const dot = dotRef.current;
    if (!wrapper || letters.length === 0 || !dot) return;

    gsap.set(letters, { opacity: 1, x: 0, y: 0, scale: 1, color: '#1a1a2e' });

    // Phase 1: print each receipt row upward, then hand off to the collapse.
    gsap.fromTo(lineInners,
      { opacity: 0, yPercent: 115 },
      {
        opacity: 1,
        yPercent: 0,
        duration: 0.58,
        stagger: 0.16,
        ease: 'power3.out',
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

  useEffect(() => {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => runAnimation());
    });
  }, [runAnimation]);

  let letterIndex = 0;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={textContainerRef} className={styles.textContainer}>
        {lines.map((line, lineIndex) => (
          <div key={`${line}-${lineIndex}`} className={styles.receiptLine}>
            <span
              ref={(el) => setLineInnerRef(el, lineIndex)}
              className={styles.receiptLineInner}
            >
              {line.split('').map((char) => {
                const i = letterIndex;
                letterIndex += 1;
                return (
                  <span
                    key={i}
                    ref={(el) => setLetterRef(el, i)}
                    className={`${styles.letter} ${char === ' ' ? styles.space : ''}`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>
      <div ref={dotRef} className={styles.dot} />
    </div>
  );
}
