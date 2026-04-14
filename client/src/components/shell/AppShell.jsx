import { useState, useCallback, useEffect, useRef, lazy, Suspense, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import PersonaApp from './PersonaApp';
import TransitionOverlay from './TransitionOverlay';
import MobileHub from './MobileHub';
import HubMasthead from './HubMasthead';
import PlanetDock from './PlanetDock';
import PlanetPreviewCard from './PlanetPreviewCard';
import PaperBurnIntro from '../intro/PaperBurnIntro';
import { PERSONAS, PLANET_CONFIG, PERSONA_IDS } from '../../lib/constants';
import { useTokens } from '../../context/TokenContext';
import { useSEO } from '../../hooks/useSEO';
import { useAnalytics, trackPlanetClick, trackStarClick } from '../../hooks/useAnalytics';
import styles from './AppShell.module.scss';

const SolarSystem = lazy(() => import('../solar-system/SolarSystem'));

// Persona ID to route path mapping
const PERSONA_ROUTES = {
  about: '/about',
  work: '/work',
  connect: '/connect',
  runner: '/runner',
  ventures: '/ventures',
  thoughts: '/thoughts',
};

export default function AppShell({ directPersona = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Reset SEO to default when in hub view (null = default config)
  // Set default SEO only in hub view. Pass false to skip when PersonaApp handles it.
  useSEO(directPersona ? false : null);
  useAnalytics(directPersona ? PERSONA_ROUTES[directPersona] : '/');
  const [view, setView] = useState(directPersona ? 'persona' : 'intro');
  const [introJustFinished, setIntroJustFinished] = useState(false);
  const [activePlanet, setActivePlanet] = useState(directPersona);
  const [targetPlanet, setTargetPlanet] = useState(null);
  const [sourcePlanet, setSourcePlanet] = useState(null);
  const [use3D, setUse3D] = useState(false);

  // Stable travel trigger: ref holds the data, tick triggers the effect
  const travelRef = useRef(null);
  const [travelTick, setTravelTick] = useState(0);

  // Warp flash — radial light burst that fires mid-travel
  const [warpFlashActive, setWarpFlashActive] = useState(false);

  // True while PersonaApp is fading out on back-to-hub — keeps canvas visible
  const [isExitingToHub, setIsExitingToHub] = useState(false);

  // First-visit planet hint — "seven lives. click a planet."
  const [showHint, setShowHint] = useState(false);
  const hintDismissedRef = useRef(false);

  // Star discovery coin arc particles
  const [starCoins, setStarCoins] = useState([]);
  const { earnTokens } = useTokens();

  // ── Gravitational Drift state ──────────────────────────────────────────────
  const [driftMode,     setDriftMode]     = useState(false);
  const [driftIndex,    setDriftIndex]    = useState(0);
  // true only after the camera settles at a planet — controls card visibility
  const [driftSettled,  setDriftSettled]  = useState(false);
  const [showExplorePrompt, setShowExplorePrompt] = useState(false);
  const explorePromptShownRef = useRef(false);

  // Stable refs for event handlers (avoid stale closures)
  const driftModeRef    = useRef(false);
  const driftIndexRef   = useRef(0);
  const driftControlRef = useRef(null); // imperative handle: { goToIndex, resetSettled }
  const handlePlanetClickRef = useRef(null); // set after handlePlanetClick is defined
  useEffect(() => { driftModeRef.current  = driftMode;  }, [driftMode]);
  useEffect(() => { driftIndexRef.current = driftIndex; }, [driftIndex]);

  // Direction of the last inter-persona navigation: 'left' | 'right'
  // Stored in a ref so handleNavigate never has a stale value,
  // and mirrored to state so PersonaApp re-renders with the correct prop.
  const directionRef = useRef('right');
  const [navDirection, setNavDirection] = useState('right');

  // Detect 3D capability — every device that supports WebGL gets the solar system.
  // Mobile phones handle WebGL fine; we only fall back for truly incapable GPUs.
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) setUse3D(true);
    } catch {
      setUse3D(false);
    }
  }, []);

  // Preload the SolarSystem chunk only when entering via hub (not direct persona routes).
  // This avoids loading 1MB+ of Three.js on pages like /work that don't use 3D.
  useEffect(() => {
    if (!directPersona) {
      import('../solar-system/SolarSystem').catch(() => {});
    }
  }, [directPersona]);

  // Force appropriate theme per view
  useEffect(() => {
    if (view === 'intro') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (view === 'hub' || directPersona) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [view, directPersona]);

  // Sync persona color to :root so CursorEffect can use it
  useEffect(() => {
    const color = activePlanet ? PLANET_CONFIG[activePlanet]?.meshColor : null;
    if (color) {
      document.documentElement.style.setProperty('--cursor-color', color);
    } else {
      document.documentElement.style.removeProperty('--cursor-color');
    }
  }, [activePlanet]);

  // Warp flash fires at t=600ms into travel, clears at t=1000ms
  useEffect(() => {
    if (travelTick === 0) return;
    const t1 = setTimeout(() => setWarpFlashActive(true), 600);
    const t2 = setTimeout(() => setWarpFlashActive(false), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [travelTick]);

  const handleIntroComplete = useCallback(() => {
    setIntroJustFinished(true);
    setView('hub');
  }, []);

  // Star discovery — fire coin arc from star screen pos to wallet corner
  const handleStarClick = useCallback(({ x, y }) => {
    earnTokens('DISCOVER_STAR');
    trackStarClick();

    const walletX = window.innerWidth  - 48;
    const walletY = window.innerHeight - 48;
    const deltaX  = walletX - x;
    const deltaY  = walletY - y;

    const count = 7;
    const particles = Array.from({ length: count }, (_, i) => ({
      id:     `star-${Date.now()}-${i}`,
      startX: x,
      startY: y,
      // Arc control point — rise up first, then curve toward wallet
      arcX:   deltaX * 0.4 + (Math.random() - 0.5) * 80,
      arcY:   deltaY * 0.25 - 90 - Math.random() * 70,
      endX:   deltaX,
      endY:   deltaY,
      delay:  i * 0.06,
    }));

    setStarCoins(particles);
    setTimeout(() => setStarCoins([]), 1800);
  }, [earnTokens]);

  // Dismiss planet hint — called on first planet interaction
  const dismissHint = useCallback(() => {
    if (hintDismissedRef.current) return;
    hintDismissedRef.current = true;
    setShowHint(false);
    localStorage.setItem('planet_hint_seen', '1');
  }, []);

  // Show hint after 1.5s in hub — only on first ever visit
  useEffect(() => {
    if (view !== 'hub') return;
    if (hintDismissedRef.current) return;
    if (localStorage.getItem('planet_hint_seen')) {
      hintDismissedRef.current = true;
      return;
    }
    const t1 = setTimeout(() => setShowHint(true), 1500);
    const t2 = setTimeout(() => dismissHint(), 7500); // auto-dismiss after 6s visible
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [view, dismissHint]);

  // Show "press space or scroll to explore" prompt — once, 2.5s after first hub entry
  useEffect(() => {
    if (view !== 'hub' || !use3D) return;
    if (explorePromptShownRef.current) return;
    const t = setTimeout(() => {
      setShowExplorePrompt(true);
      explorePromptShownRef.current = true;
    }, 2500);
    return () => clearTimeout(t);
  }, [view, use3D]);

  // Hide explore prompt once drift activates; never show again
  useEffect(() => {
    if (driftMode) setShowExplorePrompt(false);
  }, [driftMode]);

  // ── Drift helpers ──────────────────────────────────────────────────────────
  const activateDrift = useCallback(() => {
    setShowExplorePrompt(false);
    setDriftSettled(false);
    setDriftMode(true);
    setDriftIndex(0);
  }, []);

  const exitDrift = useCallback(() => {
    setDriftMode(false);
    setDriftIndex(0);
    setDriftSettled(false);
    window.__solarSystemResetCamera?.();
  }, []);

  // CameraController fires this whenever the nearest planet changes (settled=false)
  // or the camera fully arrives at a planet (settled=true → show card).
  // Max ~7 renders for index changes + 7 for settled events across a full drift sweep.
  const handleDriftIndexChanged = useCallback((index, settled) => {
    setDriftIndex(index);
    driftIndexRef.current = index;
    setDriftSettled(settled);
  }, []);

  const driftForward = useCallback(() => {
    const next = driftIndexRef.current + 1;
    if (next < PERSONA_IDS.length) {
      driftControlRef.current?.goToIndex(next);
    }
  }, []);

  const driftBackward = useCallback(() => {
    const prev = driftIndexRef.current - 1;
    if (prev >= 0) {
      driftControlRef.current?.goToIndex(prev);
    } else {
      exitDrift();
    }
  }, [exitDrift]);

  // ── Drift keyboard listener (Space / arrows / Enter / ESC) ────────────────
  useEffect(() => {
    if (view !== 'hub' || !use3D) return;

    function onKeyDown(e) {
      if (['Space', 'ArrowRight', 'ArrowLeft', 'Escape', 'Enter'].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        if (!driftModeRef.current) { activateDrift(); }
        else                        { driftForward(); }
      }
      if (e.code === 'ArrowLeft' && driftModeRef.current) driftBackward();
      if (e.code === 'Escape'    && driftModeRef.current) exitDrift();
      if (e.code === 'Enter'     && driftModeRef.current) {
        handlePlanetClickRef.current?.(PERSONA_IDS[driftIndexRef.current]);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, use3D, activateDrift, driftForward, driftBackward, exitDrift]);

  const handlePlanetClick = useCallback((planetId) => {
    if (view !== 'hub') return;
    dismissHint();
    trackPlanetClick(PERSONA_ROUTES[planetId] || planetId);
    setDriftSettled(false);  // hide preview card immediately
    setTargetPlanet(planetId);
    setView('transitioning');

    if (!use3D) {
      setTimeout(() => {
        setActivePlanet(planetId);
        setView('persona');
        setTargetPlanet(null);
        if (PERSONA_ROUTES[planetId]) navigate(PERSONA_ROUTES[planetId], { replace: true });
      }, 1800);
    }
  }, [view, use3D, navigate]);

  // Keep stable ref for use in keyboard Enter handler
  useEffect(() => { handlePlanetClickRef.current = handlePlanetClick; }, [handlePlanetClick]);

  const handleCameraArrived = useCallback(() => {
    setActivePlanet(targetPlanet);
    setView('persona');
    setTargetPlanet(null);
    if (PERSONA_ROUTES[targetPlanet]) navigate(PERSONA_ROUTES[targetPlanet], { replace: true });
  }, [targetPlanet, navigate]);

  const handleBack = useCallback(() => {
    // Always reset URL to / when going back to hub
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }

    // If opened via direct route (e.g. /work), reload to full hub
    if (directPersona) {
      window.location.href = '/';
      return;
    }

    if (use3D) {
      setIsExitingToHub(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      setDriftSettled(false); // hide card while PersonaApp fades

      if (!driftModeRef.current) {
        window.__solarSystemResetCamera?.();
      }

      setTimeout(() => {
        setIsExitingToHub(false);
        setActivePlanet(null);
        setView('hub');

        if (driftModeRef.current) {
          // Camera is already at drift position — allow settled callback to re-fire
          // so the preview card reappears without needing a new scroll
          driftControlRef.current?.resetSettled();
        }
      }, 700);
    } else {
      setActivePlanet(null);
      setView('hub');
    }
  }, [use3D, directPersona, location.pathname, navigate]);

  // Inter-planet navigation — always a 2D directional pull (user's choice).
  // The 3D camera warp is only used for hub → planet entry, never between planets.
  const handleNavigate = useCallback((planetId) => {
    if (view !== 'persona' || isExitingToHub) return;

    // Compute direction: going to a higher-index planet = right, lower = left
    const fromIdx = PERSONA_IDS.indexOf(activePlanet);
    const toIdx   = PERSONA_IDS.indexOf(planetId);
    const dir     = toIdx > fromIdx ? 'right' : 'left';

    // Write to ref immediately (never stale) and to state (drives PersonaApp prop)
    directionRef.current = dir;
    setNavDirection(dir);

    // Always direct content swap — no solar system revisit, no warp overlay
    setActivePlanet(planetId);
    navigate(PERSONA_ROUTES[planetId] || '/', { replace: true });
  }, [view, activePlanet, isExitingToHub, navigate]);

  // Called when camera has landed at destination planet
  const handleTravelComplete = useCallback(() => {
    setActivePlanet(targetPlanet);
    setSourcePlanet(null);
    setTargetPlanet(null);
    setView('persona');
  }, [targetPlanet]);

  const isTraveling = view === 'traveling';

  return (
    <>
      {/* Retro CRT overlay — subtle scanlines and vignette */}
      {view === 'hub' && <div className={styles.retroOverlay} aria-hidden="true" />}

      {/* Black hole intro */}
      {view === 'intro' && (
        <PaperBurnIntro onComplete={handleIntroComplete} />
      )}

      {/* 3D Solar System — not mounted during intro (prevents WebGL flash);
          module is preloaded above so it is ready the instant intro ends */}
      {use3D && view !== 'intro' ? (
        <Suspense fallback={null}>
          <SolarSystem
            visible={view === 'hub' || view === 'transitioning' || view === 'traveling' || isExitingToHub}
            entering={introJustFinished}
            targetPlanetId={view !== 'traveling' ? targetPlanet : null}
            onPlanetClick={handlePlanetClick}
            onTransitionComplete={handleCameraArrived}
            travelRef={travelRef}
            travelTick={isTraveling ? travelTick : 0}
            onTravelComplete={handleTravelComplete}
            onStarClick={handleStarClick}
            driftMode={driftMode}
            driftIndex={driftIndex}
            onDriftIndexChanged={handleDriftIndexChanged}
            driftControlRef={driftControlRef}
          />
        </Suspense>
      ) : (
        !use3D && view === 'hub' && <MobileHub onPlanetClick={handlePlanetClick} />
      )}

      {/* Hub masthead — big magazine reveal then compact logo */}
      {use3D && (
        <HubMasthead visible={view === 'hub'} />
      )}

      {/* Hub → Planet transition overlay — mobile only; 3D camera fly-in IS the transition */}
      <TransitionOverlay
        active={!use3D && view === 'transitioning'}
        planetId={targetPlanet || activePlanet}
      />

      {/* Planet → Planet warp travel overlay */}
      <AnimatePresence>
        {isTraveling && targetPlanet && (
          <motion.div
            className={styles.warpOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={styles.warpDestination}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              style={{ '--warp-color': PLANET_CONFIG[targetPlanet]?.meshColor }}
            >
              <span className={styles.warpLabel}>travelling to</span>
              <span className={styles.warpIcon}>{PERSONAS[targetPlanet]?.icon}</span>
              <span className={styles.warpName}>{PERSONAS[targetPlanet]?.title}</span>
              <span className={styles.warpPlanet}>{PLANET_CONFIG[targetPlanet]?.realName}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warp flash — radial light burst at the moment of interstellar jump */}
      <AnimatePresence>
        {isTraveling && warpFlashActive && (
          <motion.div
            className={styles.warpFlash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Persona full-screen app — stays mounted during travel and hub-exit for smooth fade */}
      {/* mode='sync': exit and enter animate simultaneously so panels cross mid-screen */}
      <AnimatePresence mode="sync">
        {(view === 'persona' || view === 'traveling' || isExitingToHub) && activePlanet && (
          <PersonaApp
            key={activePlanet}
            personaId={activePlanet}
            onBack={handleBack}
            onNavigate={handleNavigate}
            isExiting={isTraveling || isExitingToHub}
            direction={navDirection}
            hubLabel={use3D ? 'Solar System' : 'Hub'}
          />
        )}
      </AnimatePresence>


      {/* Star discovery — coin arcs fly from star to wallet */}
      <AnimatePresence>
        {starCoins.map((p) => (
          <motion.div
            key={p.id}
            className={styles.starCoin}
            style={{ left: p.startX, top: p.startY }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: [0, p.arcX, p.endX],
              y: [0, p.arcY, p.endY],
              scale: [1, 1.3, 0.4],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.1,
              delay: p.delay,
              ease: 'easeInOut',
              times: [0, 0.45, 1],
            }}
            aria-hidden="true"
          />
        ))}
      </AnimatePresence>

      {/* PlanetDock — magnifying dock, replaces OrreryMinimap */}
      <AnimatePresence>
        {(view === 'persona' || view === 'traveling' || isExitingToHub) && activePlanet && (
          <PlanetDock
            activeId={activePlanet}
            targetId={isTraveling ? targetPlanet : null}
            onNavigate={handleNavigate}
            isExiting={isTraveling || isExitingToHub}
          />
        )}
      </AnimatePresence>

      {/* Explore CTA — always visible in hub when not drifting */}
      <AnimatePresence>
        {view === 'hub' && !driftMode && (
          <motion.button
            className={styles.explorePrompt}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={activateDrift}
          >
            <span className={styles.exploreText}>press space or click here to explore</span>
            <span className={styles.exploreTextMobile}>click here to explore planets</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drift Progress Indicator — 7 dots, right edge of screen */}
      <AnimatePresence>
        {driftMode && (view === 'hub' || isExitingToHub) && (
          <motion.div
            className={styles.driftProgress}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.4 }}
          >
            {PERSONA_IDS.map((id, i) => (
              <button
                key={id}
                className={`${styles.driftDot} ${i === driftIndex ? styles.driftDotActive : i < driftIndex ? styles.driftDotVisited : ''}`}
                style={i === driftIndex ? { background: PLANET_CONFIG[id]?.meshColor, boxShadow: `0 0 8px ${PLANET_CONFIG[id]?.meshColor}` } : undefined}
                onClick={() => driftControlRef.current?.goToIndex(i)}
                aria-label={`Navigate to ${PERSONAS[id]?.title}`}
                aria-current={i === driftIndex ? 'true' : undefined}
                title={PERSONAS[id]?.title}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit drift button — appears 1.5s after drift activates */}
      <AnimatePresence>
        {driftMode && (view === 'hub' || isExitingToHub) && (
          <motion.button
            className={styles.exitDrift}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            onClick={exitDrift}
            aria-label="Exit drift mode"
          >
            × exit explore
          </motion.button>
        )}
      </AnimatePresence>

      {/* Swipe hint — mobile only, persistent during drift */}
      <AnimatePresence>
        {driftMode && view === 'hub' && !isExitingToHub && (
          <motion.div
            className={styles.swipeHint}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <span className={styles.swipeArrow}>‹</span>
            <span className={styles.swipeLabel}>swipe to explore</span>
            <span className={styles.swipeArrow}>›</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile planet heading — just the name above the planet */}
      <AnimatePresence>
        {driftMode && driftSettled && view === 'hub' && !isExitingToHub && (
          <motion.div
            className={styles.mobilePlanetName}
            key={`mobile-${PERSONA_IDS[driftIndex]}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handlePlanetClick(PERSONA_IDS[driftIndex])}
            style={{ '--planet-color': PLANET_CONFIG[PERSONA_IDS[driftIndex]]?.meshColor }}
          >
            <span className={styles.mobilePlanetIcon}>{PERSONAS[PERSONA_IDS[driftIndex]]?.icon}</span>
            <span className={styles.mobilePlanetTitle}>{PERSONAS[PERSONA_IDS[driftIndex]]?.title}</span>
            <span className={styles.mobilePlanetTap}>tap to enter</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planet Preview Card — desktop only */}
      <AnimatePresence>
        {driftMode && driftSettled && view === 'hub' && !isExitingToHub && (
          <PlanetPreviewCard
            key={`${PERSONA_IDS[driftIndex]}-${driftIndex}`}
            planetId={PERSONA_IDS[driftIndex]}
            onEnter={() => handlePlanetClick(PERSONA_IDS[driftIndex])}
            onContinue={driftForward}
            onBack={exitDrift}
          />
        )}
      </AnimatePresence>

    </>
  );
}
