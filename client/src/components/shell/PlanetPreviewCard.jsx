import { motion } from 'motion/react';
import { PERSONAS, PLANET_CONFIG, PERSONA_IDS } from '../../lib/constants';
import styles from './PlanetPreviewCard.module.scss';

export default function PlanetPreviewCard({ planetId, onEnter, onContinue, onBack }) {
  const persona = PERSONAS[planetId];
  const config  = PLANET_CONFIG[planetId];
  const isLast  = planetId === PERSONA_IDS[PERSONA_IDS.length - 1];

  if (!persona || !config) return null;

  const color = config.meshColor;

  return (
    <motion.div
      className={styles.card}
      style={{
        border: `1px solid ${color}50`,
        boxShadow: `0 4px 40px rgba(0,0,0,0.55), 0 0 80px ${color}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      {/* Color accent bar at top */}
      <div
        className={styles.accentBar}
        style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }}
      />

      {/* Planet color orb */}
      <div
        className={styles.orb}
        style={{
          background: color,
          boxShadow: `0 0 40px ${color}66, 0 0 80px ${color}28`,
        }}
      >
        <span className={styles.orbIcon}>{persona.icon}</span>
      </div>

      {/* Identity */}
      <div className={styles.identity}>
        <p className={styles.realName}>{config.realName}</p>
        <h2 className={styles.title}>{persona.title}</h2>
        <p className={styles.tagline}>{persona.tagline}</p>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.enterBtn}
          style={{
            background: `${color}28`,
            borderColor: `${color}70`,
            '--hover-bg': `${color}48`,
            '--hover-border': `${color}aa`,
          }}
          onClick={onEnter}
        >
          <span>Enter</span>
          <span className={styles.enterArrow}>↵</span>
        </button>

        {isLast ? (
          <button className={styles.driftBtn} onClick={onBack}>
            ← back to system
          </button>
        ) : (
          <button className={styles.driftBtn} onClick={onContinue}>
            continue →
          </button>
        )}
      </div>

      {/* Keyboard hint — desktop only */}
      <p className={styles.hint}>
        <span className={styles.hintDesktop}>
          <kbd>enter</kbd> to explore · <kbd>space</kbd> to continue · <kbd>esc</kbd> to exit
        </span>
        <span className={styles.hintMobile}>
          swipe left · tap enter to explore
        </span>
      </p>
    </motion.div>
  );
}
