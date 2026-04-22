import { motion } from 'motion/react';
import { PERSONAS, PLANET_CONFIG, PERSONA_IDS } from '../../lib/constants';
import styles from './MobileHub.module.scss';

const personaList = PERSONA_IDS.map(id => PERSONAS[id]);

// Same sphere gradient helper as PlanetDock — consistent 3-D planet look
function sphereGradient(color) {
  return [
    `radial-gradient(`,
    `  circle at 34% 30%,`,
    `  rgba(255,255,255,0.82) 0%,`,
    `  ${color} 32%,`,
    `  rgba(0,0,0,0.22) 68%,`,
    `  transparent 100%`,
    `)`,
  ].join('');
}

export default function MobileHub({ onPlanetClick }) {
  return (
    <div className={styles.hub}>
      {/* Starfield */}
      <div className={styles.stars} aria-hidden="true" />

      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className={styles.name}>Mahesh Inder</h1>
        <p className={styles.sub}>Select a world to explore</p>
      </motion.div>

      {/* Planet list */}
      <ul className={styles.list} role="list">
        {personaList.map((persona, i) => {
          const config = PLANET_CONFIG[persona.id];
          return (
            <motion.li
              key={persona.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.38,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                className={styles.card}
                style={{ '--planet-color': config.meshColor }}
                onClick={() => onPlanetClick(persona.id)}
              >
                {/* Sphere visual */}
                <span
                  className={styles.sphere}
                  style={{
                    background: sphereGradient(config.meshColor),
                    boxShadow: `0 0 16px 4px ${config.meshColor}66`,
                  }}
                  aria-hidden="true"
                />

                {/* Info */}
                <span className={styles.info}>
                  <span className={styles.title}>
                    <span className={styles.icon}>{persona.icon}</span>
                    {persona.title}
                  </span>
                  <span className={styles.realName}>{config.realName}</span>
                  <span className={styles.tagline}>{persona.tagline}</span>
                </span>

                {/* Chevron */}
                <svg
                  className={styles.chevron}
                  viewBox="0 0 10 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 2l6 7-6 7" />
                </svg>
              </button>
            </motion.li>
          );
        })}
      </ul>

      {/* Footer attribution */}
      <p className={styles.attribution}>
        thought by <span className={styles.attrName}>mahesh inder</span>
        {' · '}
        built by <span className={styles.attrClaude}>claude</span>
      </p>
    </div>
  );
}
