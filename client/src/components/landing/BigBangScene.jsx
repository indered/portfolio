import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ParticleField from './ParticleField';
import styles from './BigBangScene.module.scss';

const PHASE_TIMINGS = {
  SINGULARITY: 0,
  EXPLOSION: 800,
  TEXT_REVEAL: 2000,
  HOLD: 4500,
  COMPLETE: 5500,
};

export default function BigBangScene({ onComplete }) {
  const [phase, setPhase] = useState('idle');
  const [showAmbient, setShowAmbient] = useState(false);
  const hasPlayed = useRef(false);

  useEffect(() => {
    // Skip animation on revisit
    const played = sessionStorage.getItem('mahesh-bigbang-played');
    if (played) {
      setPhase('complete');
      setShowAmbient(true);
      hasPlayed.current = true;
      onComplete?.();
      return;
    }

    // Phase 1: Singularity (glowing point)
    setPhase('singularity');

    // Phase 2: Explosion
    const t1 = setTimeout(() => setPhase('explosion'), PHASE_TIMINGS.EXPLOSION);

    // Phase 3: Text reveal
    const t2 = setTimeout(() => setPhase('text'), PHASE_TIMINGS.TEXT_REVEAL);

    // Phase 4: Hold — let the title breathe
    const t3 = setTimeout(() => {
      setPhase('complete');
      setShowAmbient(true);
      sessionStorage.setItem('mahesh-bigbang-played', 'true');
    }, PHASE_TIMINGS.HOLD);

    // Phase 5: Transition out
    const t4 = setTimeout(() => {
      onComplete?.();
    }, PHASE_TIMINGS.COMPLETE);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const title = 'The Mahesh Multiverse';

  return (
    <section id="landing" className={styles.scene}>
      {/* Ambient starfield (persistent after animation) */}
      {showAmbient && (
        <div className={styles.ambientLayer}>
          <ParticleField mode="ambient" />
        </div>
      )}

      {/* Phase 1: Singularity - glowing point */}
      <AnimatePresence>
        {(phase === 'singularity' || phase === 'explosion') && (
          <motion.div
            className={styles.singularity}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              phase === 'singularity'
                ? { scale: 1, opacity: 1 }
                : { scale: 8, opacity: 0 }
            }
            exit={{ opacity: 0 }}
            transition={
              phase === 'singularity'
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 0.6, ease: 'easeIn' }
            }
          />
        )}
      </AnimatePresence>

      {/* Phase 2: Particle explosion */}
      {phase === 'explosion' && (
        <div className={styles.explosionLayer}>
          <ParticleField mode="explosion" />
        </div>
      )}

      {/* Phase 3+: Title text */}
      <AnimatePresence>
        {(phase === 'text' || phase === 'complete') && (
          <motion.div
            className={styles.titleContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.title}>
              {title.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              A journey through the dimensions of Mahesh Inder
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 4: Entering indicator */}
      {phase === 'complete' && (
        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.5 }}
        >
          <span className={styles.scrollText}>Entering the Multiverse</span>
        </motion.div>
      )}
    </section>
  );
}
