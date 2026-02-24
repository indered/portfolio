import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './HubMasthead.module.scss';

// Module-level flag — accurate regardless of React render batching timing
let mastheadHasPlayed = false;

// ── Character-by-character reveal ────────────────────────────────────────────
function SplitReveal({ text, startDelay = 0, className }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span key={i} className={styles.charClip}>
          <motion.span
            className={styles.char}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.72,
              delay: startDelay + i * 0.04,
              ease: [0.16, 1, 0.3, 1], // expo-out — each letter snaps into place
            }}
            style={{ willChange: 'transform' }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// First hub visit → play full magazine reveal, then crossfade to compact logo
// Subsequent visits → show compact logo immediately
export default function HubMasthead({ visible }) {
  const [showBig, setShowBig]   = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (mastheadHasPlayed) {
      setShowLogo(true);
      return;
    }
    // Big text plays, then crossfades out as logo fades in
    setShowBig(true);
    const t1 = setTimeout(() => setShowBig(false), 2800);
    const t2 = setTimeout(() => {
      setShowLogo(true);
      mastheadHasPlayed = true;
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  // MAHESH: 6 chars × 0.04s stagger, INDER starts after MAHESH + 0.08s gap
  const surnamDelay = 0.35 + 6 * 0.04 + 0.08;

  return (
    <>
      {/* ── Big magazine masthead ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showBig && (
          <motion.div
            className={styles.mastheadBig}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } }}
            aria-hidden="true"
          >
            <div className={styles.nameBlock}>
              {/* MAHESH — left-aligned */}
              <SplitReveal
                text="MAHESH"
                startDelay={0.3}
                className={styles.line1}
              />
              {/* INDER — right-aligned (editorial asymmetry) */}
              <SplitReveal
                text="INDER"
                startDelay={surnamDelay}
                className={styles.line2}
              />
            </div>

            {/* Subtitle — appears after name is fully revealed */}
            <motion.div
              className={styles.subtitle}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.7, ease: 'easeOut' }}
            >
              <span className={styles.subtitleRule} />
              Full Stack Developer&nbsp;&nbsp;·&nbsp;&nbsp;Dubai, UAE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Compact logo — top right, permanent ──────────────────────────── */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            className={styles.logoCompact}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.logoMark}>MI</span>
            <span className={styles.logoName}>Mahesh Inder</span>
            <span className={styles.logoSub}>Full Stack · Dubai</span>
            <span className={styles.logoRule} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
