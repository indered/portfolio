import { lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { PERSONAS, PLANET_CONFIG, PERSONA_IDS } from '../../lib/constants';
import { useTokens } from '../../context/TokenContext';
import { useMobileSwipe } from '../../hooks/useMobileSwipe';
import { useSEO } from '../../hooks/useSEO';
import styles from './PersonaApp.module.scss';

const PERSONA_COMPONENTS = {
  developer: lazy(() => import('../personas/DeveloperSection')),
  runner:    lazy(() => import('../personas/RunnerSection')),
  blockchain:lazy(() => import('../personas/VenturesSection')),
  dating:    lazy(() => import('../personas/PersonalSection')),
  social:    lazy(() => import('../personas/SocialLinksSection')),
  thinker:   lazy(() => import('../personas/ThinkerSection')),
};

// Use the ordered list from constants
const personaIds = PERSONA_IDS;

export default function PersonaApp({
  personaId,
  onBack,
  onNavigate,
  isExiting  = false,
  direction  = 'right',
  hubLabel   = 'Solar System',
}) {
  const persona          = PERSONAS[personaId];
  const config           = PLANET_CONFIG[personaId];
  const PersonaComponent = PERSONA_COMPONENTS[personaId];
  const { earnTokens }   = useTokens();
  const contentRef       = useRef(null);

  // Update SEO metadata for this section
  useSEO(personaId);

  const currentIndex = personaIds.indexOf(personaId);
  const prevId = currentIndex > 0 ? personaIds[currentIndex - 1] : null;
  const nextId = currentIndex < personaIds.length - 1 ? personaIds[currentIndex + 1] : null;

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

  // Swipe hint for mobile
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'ontouchstart' in window && !localStorage.getItem('swipe_hint_seen')) {
      const t = setTimeout(() => setShowSwipeHint(true), 1500);
      const t2 = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('swipe_hint_seen', '1');
      }, 5000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, []);

  useEffect(() => {
    earnTokens('EXPLORE_SECTION');
    contentRef.current?.scrollTo(0, 0);
  }, [personaId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation: Escape to cosmos, Arrow keys between planets
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isExiting) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      } else if (e.key === 'ArrowLeft' && prevId) {
        e.preventDefault();
        onNavigate(prevId);
      } else if (e.key === 'ArrowRight' && nextId) {
        e.preventDefault();
        onNavigate(nextId);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isExiting, onBack, onNavigate, prevId, nextId]);

  if (!persona || !PersonaComponent) return null;

  const slideX = direction === 'right' ? '100vw' : '-100vw';

  return (
    <motion.div
      className={styles.personaApp}
      data-persona={personaId}
      style={{ '--persona-color': config?.meshColor }}
      ref={contentRef}
      initial={{ x: slideX, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction === 'right' ? '-100vw' : '100vw', opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Planetary atmosphere — persona color bleeds from top */}
      <div className={styles.atmosphereGlow} aria-hidden="true" />

      {/* ── Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.logoLink} onClick={onBack} aria-label="Back to home">
            <img src="/logo.svg" alt="Mahesh Inder" className={styles.headerLogo} />
          </button>
          <button className={styles.backButton} onClick={onBack}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2L4 7l5 5" />
            </svg>
            {hubLabel}
          </button>
        </div>
        <span className={styles.personaTitle}>
          <span className={styles.personaIcon}>{persona.icon}</span> {persona.title}
          <span className={styles.realName}>{config?.realName}</span>
        </span>
        <div className={styles.headerNav}>
          {prevId && (
            <button className={styles.headerNavBtn} onClick={() => !isExiting && onNavigate(prevId)}>
              <span className={styles.navArrow}>&larr;</span>
              <span className={styles.navEmoji}>{PERSONAS[prevId].icon}</span>
            </button>
          )}
          {nextId && (
            <button className={styles.headerNavBtn} onClick={() => !isExiting && onNavigate(nextId)}>
              <span className={styles.navEmoji}>{PERSONAS[nextId].icon}</span>
              <span className={styles.navArrow}>&rarr;</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Position indicator — minimal dots showing current section */}
      <nav className={styles.positionNav} aria-label="Section navigation">
        {personaIds.map((id, idx) => (
          <button
            key={id}
            className={`${styles.positionDot} ${id === personaId ? styles.positionDotActive : ''}`}
            style={{ '--dot-color': PLANET_CONFIG[id]?.meshColor }}
            onClick={() => !isExiting && id !== personaId && onNavigate(id)}
            disabled={isExiting || id === personaId}
            aria-label={PERSONAS[id].title}
            aria-current={id === personaId ? 'page' : undefined}
          />
        ))}
      </nav>

      {/* ── Swipe hint (mobile only, first visit) */}
      {showSwipeHint && (
        <div className={styles.swipeHint} onClick={() => setShowSwipeHint(false)}>
          <span className={styles.swipeArrowLeft}>‹</span>
          <span className={styles.swipeText}>swipe to switch</span>
          <span className={styles.swipeArrowRight}>›</span>
        </div>
      )}

      {/* ── Persona content */}
      <div className={styles.content}>
        <Suspense fallback={null}>
          <PersonaComponent />
        </Suspense>

        {/* ── Escape to cosmos hint */}
        <div className={styles.escapeHint}>
          <button className={styles.escapeBtn} onClick={onBack}>
            <span className={styles.escapeKey}>esc</span>
            <span className={styles.escapeText}>escape to cosmos</span>
          </button>
        </div>

        {/* ── Attribution footer */}
        <footer className={styles.attribution}>
          was building a <span className={styles.attributionHighlight}>cv</span>, ended up building a <span className={styles.attributionHighlight}>solar system</span>
        </footer>
      </div>
    </motion.div>
  );
}
