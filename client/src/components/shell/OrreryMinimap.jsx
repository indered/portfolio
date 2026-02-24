import { motion } from 'motion/react';
import { PERSONAS, PLANET_CONFIG } from '../../lib/constants';
import styles from './OrreryMinimap.module.scss';

const personaIds = Object.keys(PERSONAS);

// Map planet mesh size (0.48–1.05) to dot diameter (5–10px)
function dotSize(id) {
  const s = PLANET_CONFIG[id].size;
  return Math.round(5 + ((s - 0.48) / (1.05 - 0.48)) * 5);
}

export default function OrreryMinimap({ activeId, targetId, onNavigate, isExiting }) {
  return (
    <motion.div
      className={styles.orrery}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.pill}>
        {personaIds.map((id) => {
          const isActive  = id === activeId;
          const isTarget  = id === targetId;
          const sz        = dotSize(id);

          return (
            <button
              key={id}
              className={[
                styles.dot,
                isActive  ? styles.active       : '',
                isTarget  ? styles.transitioning : '',
              ].join(' ')}
              style={{ '--dot-color': PLANET_CONFIG[id].meshColor, '--dot-size': `${sz}px` }}
              onClick={() => !isExiting && !isActive && onNavigate(id)}
              disabled={isExiting || isActive}
              aria-label={PERSONAS[id].title}
            >
              {/* Label — revealed when pill is hovered */}
              <span className={styles.label}>
                <span className={styles.labelIcon}>{PERSONAS[id].icon}</span>
                <span className={styles.labelName}>{PERSONAS[id].title}</span>
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
