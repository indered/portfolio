import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PERSONAS, PLANET_CONFIG } from '../../lib/constants';
import styles from './TransitionOverlay.module.scss';

const LAUNCH_PHRASES = [
  'Initiating launch sequence',
  'Plotting interstellar course',
  'Engaging warp drive',
  'Calculating orbital trajectory',
  'Deploying landing fleet',
  'Locking destination coordinates',
  'Activating hyperspace jump',
];

const FLAVOR_TEXTS = {
  developer: 'Compiling the universe...',
  runner: 'Km 32. Mind takes over.',
  blockchain: 'Connecting to Arc Protocol...',
  music: 'Dropping the beat...',
  dating: 'Calibrating the romance algorithm...',
  social: 'Establishing quantum link...',
  thinker: 'Entering the silence of deep space...',
};

export default function TransitionOverlay({ active, planetId }) {
  const phrase = useMemo(
    () => LAUNCH_PHRASES[Math.floor(Math.random() * LAUNCH_PHRASES.length)],
    [planetId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const persona = planetId ? PERSONAS[planetId] : null;
  const config = planetId ? PLANET_CONFIG[planetId] : null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={styles.overlay}
          style={{ '--transition-color': config?.meshColor || '#58a6ff' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {persona && (
            <div className={styles.content}>
              <div className={styles.planetIcon}>{persona.icon}</div>
              <div className={styles.status}>{phrase}</div>
              <div className={styles.planetName}>{persona.title}</div>
              <div className={styles.flavorText}>
                {FLAVOR_TEXTS[planetId] || 'Approaching destination...'}
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
