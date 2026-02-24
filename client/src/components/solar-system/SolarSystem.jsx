import { useRef, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import Sun from './Sun';
import Planet from './Planet';
import OrbitRing from './OrbitRing';
import ShootingStars from './ShootingStars';
import DistantGalaxies from './DistantGalaxies';
import CameraController from './CameraController';
import BirthFogController from './BirthFogController';
import CosmicBottle from './CosmicBottle';
import { PERSONAS, PLANET_CONFIG } from '../../lib/constants';
import styles from './SolarSystem.module.scss';

const personaList = Object.values(PERSONAS);

// ── Star note overlay — transparent glass, neon text, rendered OUTSIDE Canvas ──
function BottleNote({ onClose }) {
  const glow = 'rgba(255, 250, 224, 0.9)';
  const glowDim = 'rgba(255, 250, 224, 0.45)';
  const glowFaint = 'rgba(255, 250, 224, 0.22)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2, 2, 12, 0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        userSelect: 'none',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '1.6rem',
          maxWidth: 400, width: '90vw',
          padding: '3.2rem 2.5rem 2.5rem',
          background: 'rgba(5, 5, 22, 0.4)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 250, 224, 0.1)',
          borderRadius: 3,
          boxShadow: '0 0 100px rgba(255, 250, 224, 0.04), 0 4px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          textAlign: 'center',
        }}
      >
        {/* Eyebrow */}
        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '0.68rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: glowFaint,
          margin: 0,
          textShadow: `0 0 12px ${glowFaint}`,
        }}>
          you weren&rsquo;t supposed to find this
        </p>

        {/* Main lines */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontStyle: 'italic',
          fontWeight: 600,
          color: glow,
          margin: 0,
          lineHeight: 1.4,
          maxWidth: '20ch',
          textShadow: `0 0 18px ${glow}, 0 0 50px ${glowDim}, 0 0 100px ${glowFaint}`,
        }}>
          most people never look behind the sun.
        </p>

        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
          fontStyle: 'italic',
          fontWeight: 700,
          color: glow,
          margin: 0,
          textShadow: `0 0 24px ${glow}, 0 0 70px ${glowDim}, 0 0 140px ${glowFaint}`,
          letterSpacing: '-0.01em',
        }}>
          you did.
        </p>

        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          fontStyle: 'italic',
          color: glowDim,
          margin: 0,
          textShadow: `0 0 14px ${glowDim}`,
        }}>
          that&rsquo;s the whole thing.
        </p>

        {/* Coordinates */}
        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '0.68rem',
          letterSpacing: '0.2em',
          color: glowFaint,
          margin: '0.25rem 0 0',
          textShadow: `0 0 8px ${glowFaint}`,
        }}>
          25.2048&deg;&nbsp;N &middot; 55.2708&deg;&nbsp;E &middot; DUBAI
        </p>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '0.1rem', padding: '0.45rem 1.4rem',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '0.82rem', fontStyle: 'italic', letterSpacing: '0.1em',
            color: glowFaint,
            background: 'transparent',
            border: '1px solid rgba(255, 250, 224, 0.12)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = glow;
            e.currentTarget.style.borderColor = 'rgba(255, 250, 224, 0.35)';
            e.currentTarget.style.textShadow = `0 0 12px ${glowDim}`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = glowFaint;
            e.currentTarget.style.borderColor = 'rgba(255, 250, 224, 0.12)';
            e.currentTarget.style.textShadow = 'none';
          }}
        >
          return to the stars
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── SolarSystem ───────────────────────────────────────────────────────────────
export default function SolarSystem({ visible, targetPlanetId, onPlanetClick, onTransitionComplete, entering, travelRef, travelTick, onTravelComplete }) {
  const planetRefs = useRef({});
  const [revealComplete, setRevealComplete] = useState(!entering);

  // Note overlay state — managed here (outside Canvas) to avoid reconciler mismatch
  const [showBottleNote, setShowBottleNote] = useState(false);
  const bottleCloseRef = useRef(null); // holds CosmicBottle's close animation callback

  const handleRegister = useCallback((id, groupObj) => {
    planetRefs.current[id] = groupObj;
  }, []);

  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
  }, []);

  // Called by CosmicBottle when the note should appear; receives the close callback
  const handleNoteOpen = useCallback((closeCallback) => {
    bottleCloseRef.current = closeCallback;
    setShowBottleNote(true);
  }, []);

  // Called by CosmicBottle after the close animation fully completes
  const handleNoteHide = useCallback(() => {
    setShowBottleNote(false);
  }, []);

  // Called when user dismisses the note (button / backdrop click)
  const handleNoteClose = useCallback(() => {
    bottleCloseRef.current?.(); // trigger 3D close animation in CosmicBottle
    // Note remains visible until CosmicBottle calls handleNoteHide (after anim completes)
    // But hide immediately for snappier feel — the 3D animation continues behind
    setShowBottleNote(false);
  }, []);

  return (
    <div className={`${styles.canvas} ${!visible ? styles.hidden : ''}`}>
      <Canvas
        camera={{ position: entering ? [0, 0.5, 2.5] : [0, 8, 22], fov: entering ? 75 : 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene, camera: cam }) => {
          gl.setClearColor('#050510');
          if (entering) {
            scene.fog = new THREE.FogExp2('#050510', 0.4);
            cam.position.set(0, 0.5, 2.5);
            cam.fov = 75;
            cam.updateProjectionMatrix();
          }
        }}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#ffaa44" distance={50} decay={2} />

        {/* Background click-catcher — clicking blank space shoots a star */}
        {visible && (
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              window.__userStarQueue = window.__userStarQueue || [];
              const count = 1 + Math.floor(Math.random() * 2);
              for (let i = 0; i < count; i++) {
                window.__userStarQueue.push({
                  x: e.point.x + (Math.random() - 0.5) * 4,
                  y: e.point.y + (Math.random() - 0.5) * 4,
                  z: e.point.z + (Math.random() - 0.5) * 4,
                });
              }
            }}
          >
            <sphereGeometry args={[120, 16, 16]} />
            <meshBasicMaterial side={1} transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

        <BirthFogController active={entering} onRevealComplete={handleRevealComplete} />

        <Sun hubVisible={visible} />

        {personaList.map((persona) => (
          <group key={persona.id}>
            <OrbitRing
              radius={PLANET_CONFIG[persona.id].orbitRadius}
              personaId={persona.id}
              onClick={onPlanetClick}
            />
            <Planet
              persona={persona}
              config={PLANET_CONFIG[persona.id]}
              onClick={onPlanetClick}
              onRegister={handleRegister}
            />
          </group>
        ))}

        <Stars radius={80}  depth={40}  count={5000} factor={5} saturation={0.3} fade speed={0.5} />
        <Stars radius={200} depth={100} count={3000} factor={3} saturation={0.1} fade speed={0.2} />
        <ShootingStars />
        <DistantGalaxies />

        {/* Easter egg — discovered when rotating to the back of the solar system */}
        <CosmicBottle onNoteOpen={handleNoteOpen} onNoteHide={handleNoteHide} />

        <EffectComposer>
          <Bloom intensity={entering ? 3.0 : 0.8} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>

        <CameraController
          targetPlanetId={revealComplete ? targetPlanetId : null}
          planetRefs={planetRefs}
          onTransitionComplete={onTransitionComplete}
          birthRevealActive={!revealComplete}
          travelRef={travelRef}
          travelTick={travelTick}
          onTravelComplete={onTravelComplete}
        />
      </Canvas>

      {/* Note overlay — rendered in DOM context, outside R3F Canvas */}
      <AnimatePresence>
        {showBottleNote && <BottleNote key="bottle-note" onClose={handleNoteClose} />}
      </AnimatePresence>
    </div>
  );
}
