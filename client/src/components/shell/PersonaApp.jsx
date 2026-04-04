import { lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { PERSONAS, PLANET_CONFIG, PERSONA_IDS } from '../../lib/constants';
import { useTokens } from '../../context/TokenContext';
import { useMobileSwipe } from '../../hooks/useMobileSwipe';
import { useSEO } from '../../hooks/useSEO';
import styles from './PersonaApp.module.scss';

const PERSONA_COMPONENTS = {
  developer: lazy(() => import('../personas/DeveloperSection')),
  runner:    lazy(() => import('../personas/RunnerSection')),
  blockchain:lazy(() => import('../personas/FiguringOutSection')),
  dating:    lazy(() => import('../personas/DatingSection')),
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

  return (
    <div
      className={styles.personaApp}
      data-persona={personaId}
      style={{ '--persona-color': config?.meshColor }}
      ref={contentRef}
    >
      {/* ── Planetary atmosphere — persona color bleeds from top */}
      <div className={styles.atmosphereGlow} aria-hidden="true" />

      {/* ── Header */}
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
          thought by <span className={styles.attributionName}>mahesh inder</span>
          <span className={styles.attributionDot}>·</span>
          built by <span className={styles.attributionClaude}>claude</span>
        </footer>
      </div>
    </div>
  );
}
