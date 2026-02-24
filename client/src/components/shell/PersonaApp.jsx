import { lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { PERSONAS, PLANET_CONFIG } from '../../lib/constants';
import { useTokens } from '../../context/TokenContext';
import { useMobileSwipe } from '../../hooks/useMobileSwipe';
import styles from './PersonaApp.module.scss';

const PERSONA_COMPONENTS = {
  developer: lazy(() => import('../personas/DeveloperSection')),
  runner:    lazy(() => import('../personas/RunnerSection')),
  blockchain:lazy(() => import('../personas/BlockchainAISection')),
  music:     lazy(() => import('../personas/MusicSection')),
  dating:    lazy(() => import('../personas/DatingSection')),
  social:    lazy(() => import('../personas/SocialLinksSection')),
  thinker:   lazy(() => import('../personas/ThinkerSection')),
};

const personaIds = Object.keys(PERSONAS);

function orbitDistance(idA, idB) {
  return Math.abs(PLANET_CONFIG[idA].orbitRadius - PLANET_CONFIG[idB].orbitRadius).toFixed(1);
}

// ─── Warp-travel variants (3D mode) ──────────────────────────────────────────
// Used via animate={isExiting ? 'warpExit' : 'enter'} while the component is
// still mounted (camera is flying between planets).
const warpVariants = {
  enter:    {
    opacity: 1, scale: 1, filter: 'blur(0px)', y: 0,
    transition: { duration: 0.3 },
  },
  // Surface recedes: scale DOWN, subtle upward drift, defocus
  warpExit: {
    opacity: 0, scale: 0.94, filter: 'blur(6px)', y: -12,
    transition: { duration: 0.55, ease: [0.2, 0, 0.6, 1] },
  },
};

// ─── Directional pull variants (2D / mobile inter-persona navigation) ─────────
// Returns the initial / animate / exit objects to be spread onto motion.div.
//
//  Going RIGHT (higher orbital index):
//    Entering panel comes from the LEFT  (x: -100% → 0)
//    Exiting  panel leaves  to the RIGHT (x: 0 → +100%)
//
//  Going LEFT (lower orbital index):
//    Entering panel comes from the RIGHT (x: +100% → 0)
//    Exiting  panel leaves  to the LEFT  (x: 0 → -100%)
//
// Both animate simultaneously (AnimatePresence mode='sync'), crossing midscreen.
function getDirectionalVariants(direction) {
  const isRight = direction === 'right';
  return {
    initial: {
      x: isRight ? '-100%' : '100%',
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x:       { duration: 0.4, ease: [0.16, 1, 0.3, 1] },  // expo-out: snaps in
        opacity: { duration: 0.25, ease: 'easeOut' },
      },
    },
    exit: {
      x: isRight ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x:       { duration: 0.35, ease: 'easeIn' },           // accelerates away
        opacity: { duration: 0.2,  ease: 'easeIn' },
      },
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PersonaApp({
  personaId,
  onBack,
  onNavigate,
  isExiting  = false,
  direction  = 'right',    // 'left' | 'right' — drives the directional slide
  hubLabel   = 'Solar System',
}) {
  const persona          = PERSONAS[personaId];
  const config           = PLANET_CONFIG[personaId];
  const PersonaComponent = PERSONA_COMPONENTS[personaId];
  const { earnTokens }   = useTokens();
  const contentRef       = useRef(null);

  const currentIndex = personaIds.indexOf(personaId);
  const prevId = currentIndex > 0 ? personaIds[currentIndex - 1] : null;
  const nextId = currentIndex < personaIds.length - 1 ? personaIds[currentIndex + 1] : null;

  // Swipe callbacks — stable refs so useMobileSwipe effect never re-runs
  const handleSwipeLeft  = useCallback(() => {
    if (!isExiting && nextId) onNavigate(nextId);
  }, [isExiting, nextId, onNavigate]);

  const handleSwipeRight = useCallback(() => {
    if (!isExiting && prevId) onNavigate(prevId);
  }, [isExiting, prevId, onNavigate]);

  useMobileSwipe({
    enabled:      !isExiting,
    onSwipeLeft:  handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  useEffect(() => {
    earnTokens('EXPLORE_SECTION');
    contentRef.current?.scrollTo(0, 0);
  }, [personaId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!persona || !PersonaComponent) return null;

  // Build direction-aware enter/exit props.
  // When isExiting=true (3D warp travel), the warp variants take over via
  // animate prop; the directional exit is not triggered because AnimatePresence
  // does not unmount the component until the 3D travel completes.
  const dirVariants = getDirectionalVariants(direction);

  return (
    <motion.div
      className={styles.personaApp}
      data-persona={personaId}
      style={{ '--persona-color': config?.meshColor }}

      // ── Directional pull transition (2D path) ─────────────────────────────
      // initial / animate / exit are the direction-aware slide values.
      // When isExiting (3D warp), animate is overridden below to warpExit.
      initial={dirVariants.initial}
      animate={isExiting ? 'warpExit' : dirVariants.animate}
      exit={dirVariants.exit}

      // Warp variants are only used when animate='warpExit'
      variants={warpVariants}

      ref={contentRef}
    >
      {/* ── Planetary atmosphere — persona color bleeds from top, fades into content */}
      <div className={styles.atmosphereGlow} aria-hidden="true" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          {hubLabel}
        </button>
        <span className={styles.personaTitle}>
          {persona.icon} {persona.title}
          <span className={styles.realName}>{config?.realName}</span>
        </span>
        {/* Minimal prev/next in header for keyboard / non-hover users */}
        <div className={styles.headerNav}>
          {prevId && (
            <button className={styles.headerNavBtn} onClick={() => !isExiting && onNavigate(prevId)}>
              ← {PERSONAS[prevId].icon}
            </button>
          )}
          {nextId && (
            <button className={styles.headerNavBtn} onClick={() => !isExiting && onNavigate(nextId)}>
              {PERSONAS[nextId].icon} →
            </button>
          )}
        </div>
      </header>

      {/* ── Left bleed gutter ─ adjacent planet glow ──────────────────────── */}
      {prevId && (
        <button
          className={`${styles.bleedGutter} ${styles.bleedLeft}`}
          style={{ '--glow-color': PLANET_CONFIG[prevId]?.meshColor }}
          onClick={() => !isExiting && onNavigate(prevId)}
          disabled={isExiting}
          aria-label={`Travel to ${PERSONAS[prevId].title}`}
        >
          <span className={styles.bleedArrow}>←</span>
          <span className={styles.bleedOrb} />
          <span className={styles.bleedMeta}>
            <span className={styles.bleedIcon}>{PERSONAS[prevId].icon}</span>
            <span className={styles.bleedName}>{PERSONAS[prevId].title}</span>
            <span className={styles.bleedDist}>{orbitDistance(personaId, prevId)} AU</span>
          </span>
        </button>
      )}

      {/* ── Right bleed gutter ─ adjacent planet glow ─────────────────────── */}
      {nextId && (
        <button
          className={`${styles.bleedGutter} ${styles.bleedRight}`}
          style={{ '--glow-color': PLANET_CONFIG[nextId]?.meshColor }}
          onClick={() => !isExiting && onNavigate(nextId)}
          disabled={isExiting}
          aria-label={`Travel to ${PERSONAS[nextId].title}`}
        >
          <span className={styles.bleedArrow}>→</span>
          <span className={styles.bleedOrb} />
          <span className={styles.bleedMeta}>
            <span className={styles.bleedIcon}>{PERSONAS[nextId].icon}</span>
            <span className={styles.bleedName}>{PERSONAS[nextId].title}</span>
            <span className={styles.bleedDist}>{orbitDistance(personaId, nextId)} AU</span>
          </span>
        </button>
      )}

      {/* ── Persona content ────────────────────────────────────────────────── */}
      <div className={styles.content}>
        <Suspense fallback={null}>
          <PersonaComponent />
        </Suspense>

        {/* ── Attribution footer ──────────────────────────────────────────── */}
        <footer className={styles.attribution}>
          thought by <span className={styles.attributionName}>mahesh inder</span>
          <span className={styles.attributionDot}>·</span>
          built by <span className={styles.attributionClaude}>claude</span>
        </footer>
      </div>
    </motion.div>
  );
}
