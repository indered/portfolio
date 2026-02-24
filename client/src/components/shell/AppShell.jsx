import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PersonaApp from './PersonaApp';
import TransitionOverlay from './TransitionOverlay';
import MobileHub from './MobileHub';
import HubMasthead from './HubMasthead';
import PlanetDock from './PlanetDock';
import PaperBurnIntro from '../intro/PaperBurnIntro';
import { PERSONAS, PLANET_CONFIG } from '../../lib/constants';
import styles from './AppShell.module.scss';

// Ordered list of persona IDs — used for direction calculation
const PERSONA_IDS = Object.keys(PERSONAS);

const SolarSystem = lazy(() => import('../solar-system/SolarSystem'));

export default function AppShell() {
  const [view, setView] = useState('intro');
  const [introJustFinished, setIntroJustFinished] = useState(false);
  const [activePlanet, setActivePlanet] = useState(null);
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

  // Force appropriate theme per view
  useEffect(() => {
    if (view === 'intro') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (view === 'hub') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [view]);

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

  const handlePlanetClick = useCallback((planetId) => {
    if (view !== 'hub') return;
    setTargetPlanet(planetId);
    setView('transitioning');

    if (!use3D) {
      setTimeout(() => {
        setActivePlanet(planetId);
        setView('persona');
        setTargetPlanet(null);
      }, 1800);
    }
  }, [view, use3D]);

  const handleCameraArrived = useCallback(() => {
    setActivePlanet(targetPlanet);
    setView('persona');
    setTargetPlanet(null);
  }, [targetPlanet]);

  const handleBack = useCallback(() => {
    if (use3D) {
      // Fade PersonaApp out, reveal canvas, camera resets — no loading screen
      setIsExitingToHub(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      window.__solarSystemResetCamera?.();
      setTimeout(() => {
        setIsExitingToHub(false);
        setActivePlanet(null);
        setView('hub');
      }, 700);
    } else {
      setActivePlanet(null);
      setView('hub');
    }
  }, [use3D]);

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
  }, [view, activePlanet, isExitingToHub]);

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
      {/* Black hole intro */}
      {view === 'intro' && (
        <PaperBurnIntro onComplete={handleIntroComplete} />
      )}

      {/* 3D Solar System — always mounted on desktop, visibility toggled */}
      {use3D ? (
        <Suspense fallback={
          <div className={styles.loading}>
            <div className={styles.loadingText}>Initializing the Multiverse...</div>
          </div>
        }>
          <SolarSystem
            visible={view === 'hub' || view === 'transitioning' || view === 'traveling' || isExitingToHub}
            entering={introJustFinished}
            targetPlanetId={view !== 'traveling' ? targetPlanet : null}
            onPlanetClick={handlePlanetClick}
            onTransitionComplete={handleCameraArrived}
            travelRef={travelRef}
            travelTick={isTraveling ? travelTick : 0}
            onTravelComplete={handleTravelComplete}
          />
        </Suspense>
      ) : (
        view === 'hub' && <MobileHub onPlanetClick={handlePlanetClick} />
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

    </>
  );
}
