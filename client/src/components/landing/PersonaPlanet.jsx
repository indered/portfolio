import { useState } from 'react';
import { motion } from 'motion/react';
import styles from './PersonaPlanet.module.scss';

export default function PersonaPlanet({
  persona,
  size = 60,
  onClick,
  isActive = false,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`${styles.planet} ${isActive ? styles.active : ''}`}
      style={{
        '--planet-size': `${size}px`,
        '--planet-color': persona.color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Navigate to ${persona.title}`}
    >
      <span className={styles.ring} />

      <motion.span
        className={styles.icon}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {persona.icon}
      </motion.span>

      {isActive && <span className={styles.pulse} />}

      {isHovered && (
        <motion.span
          className={styles.tooltip}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {persona.title}
        </motion.span>
      )}
    </motion.button>
  );
}
