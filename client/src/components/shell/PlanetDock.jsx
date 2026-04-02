import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PERSONAS, PLANET_CONFIG, PERSONA_IDS } from '../../lib/constants';
import styles from './PlanetDock.module.scss';

// ─── Constants ───────────────────────────────────────────────────────────────
// PERSONA_IDS imported from constants (curated list)
const BASE_SIZE     = 52;                              // px, resting diameter
const MAX_SCALE     = 1.65;                            // → ~86px at hover apex
const SPRING_CONFIG = { type: 'spring', stiffness: 500, damping: 30, mass: 0.5 };

// ─── Scale helper ────────────────────────────────────────────────────────────

/**
 * Only the hovered item scales up. No cascade to neighbors.
 */
function getScale(index, hoveredIndex) {
  if (hoveredIndex === null) return 1;
  return index === hoveredIndex ? MAX_SCALE : 1;
}

// ─── Sphere gradient helper ───────────────────────────────────────────────────

/**
 * Generates a radial-gradient that simulates a 3-D lit sphere.
 * The highlight is off-centre top-left (same as PersonaApp's .bleedOrb).
 */
function sphereGradient(color) {
  return [
    `radial-gradient(`,
    `  circle at 34% 30%,`,
    `  rgba(255,255,255,0.82) 0%,`,
    `  ${color} 32%,`,
    `  rgba(0,0,0,0.18) 68%,`,
    `  transparent 100%`,
    `)`,
  ].join('');
}

// ─── Single dock item ─────────────────────────────────────────────────────────

function DockItem({ id, index, hoveredIndex, isActive, isTarget, isExiting, onHover, onLeave, onNavigate }) {
  const persona  = PERSONAS[id];
  const config   = PLANET_CONFIG[id];
  const scale    = getScale(index, hoveredIndex);
  const isHovered = index === hoveredIndex;

  const handleClick = useCallback(() => {
    if (isExiting || isActive) return;
    onNavigate(id);
  }, [isExiting, isActive, id, onNavigate]);

  return (
    <div className={styles.itemWrapper}>
      {/* ── Label — slides up when this item is hovered ───────────────────── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={styles.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <span className={styles.labelIcon}>{persona.icon}</span>
            <span className={styles.labelName}>{persona.title}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sphere button ─────────────────────────────────────────────────── */}
      <motion.button
        className={styles.sphere}
        data-active={isActive || undefined}
        data-target={isTarget || undefined}
        style={{
          '--sphere-color': config.meshColor,
          '--sphere-size': `${BASE_SIZE}px`,
          background: sphereGradient(config.meshColor),
          boxShadow: isHovered
            ? `0 0 24px 8px ${config.meshColor}cc, inset 0 0 10px rgba(0,0,0,0.25)`
            : isActive
              ? `0 0 18px 5px ${config.meshColor}, inset 0 0 10px rgba(0,0,0,0.25)`
              : `0 0 8px 2px ${config.meshColor}44, inset 0 0 10px rgba(0,0,0,0.25)`,
        }}
        animate={{ scale }}
        transition={SPRING_CONFIG}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={onLeave}
        onClick={handleClick}
        disabled={isExiting || isActive}
        aria-label={`Navigate to ${persona.title}`}
        aria-current={isActive ? 'true' : undefined}
      >
        <span className={styles.icon}>{persona.icon}</span>
      </motion.button>

      {/* ── Active dot indicator ──────────────────────────────────────────── */}
      <motion.span
        className={styles.activeDot}
        animate={{
          opacity: isActive ? 1 : 0,
          scale:   isActive ? 1 : 0.4,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
    </div>
  );
}

// ─── Dock ─────────────────────────────────────────────────────────────────────

/**
 * PlanetDock — macOS-style magnifying dock for inter-persona navigation.
 *
 * Props:
 *   activeId   — currently displayed persona id
 *   targetId   — destination persona id during travel (for visual feedback)
 *   onNavigate — (id: string) => void
 *   isExiting  — disables all interactions during transition
 */
export default function PlanetDock({ activeId, targetId, onNavigate, isExiting }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const leaveTimerRef = useRef(null);

  // Small debounce on leave prevents flicker when cursor crosses item gaps
  const handleHover = useCallback((index) => {
    clearTimeout(leaveTimerRef.current);
    setHoveredIndex(index);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => setHoveredIndex(null), 60);
  }, []);

  return (
    <motion.div
      className={styles.dock}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      // Reset magnification when cursor leaves the whole dock
      onMouseLeave={handleLeave}
    >
      <div className={styles.pill}>
        {PERSONA_IDS.map((id, index) => (
          <DockItem
            key={id}
            id={id}
            index={index}
            hoveredIndex={hoveredIndex}
            isActive={id === activeId}
            isTarget={id === targetId}
            isExiting={isExiting}
            onHover={handleHover}
            onLeave={handleLeave}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </motion.div>
  );
}
