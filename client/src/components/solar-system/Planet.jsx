import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// ── DriftHighlight ─────────────────────────────────────────────────────────────
// Rendered only on the active drift planet. Contains:
//   • Two neon rings (inner pulses, outer breathes dimly)
//   • 3 gyroscope revolving lines at different inclinations + speeds
//   • 16 particles orbiting on varied tilted planes
//   • A pulsing point light that lifts the whole scene
//   • Everything fades in smoothly on mount
const PARTICLE_COUNT = 16;

// Three revolving orbital lines at different tilt angles and speeds
const ORBIT_LINES = [
  { tiltX: 0.3,  tiltZ: 0,    speed:  0.55, radiusMul: 2.1,  width: 0.016, opacity: 0.72 },
  { tiltX: 1.05, tiltZ: 0.4,  speed: -0.38, radiusMul: 2.35, width: 0.013, opacity: 0.55 },
  { tiltX: 1.65, tiltZ: 0.9,  speed:  0.28, radiusMul: 2.6,  width: 0.010, opacity: 0.42 },
];

function DriftHighlight({ config }) {
  const innerMatRef   = useRef();
  const outerMatRef   = useRef();
  const pulseLightRef = useRef();
  const orbitGroupRefs = useRef([]);   // one group ref per revolving line
  const orbitMatRefs   = useRef([]);   // material refs for fade-in
  const particleMats   = useRef([]);
  const particleMeshes = useRef([]);
  const timeRef  = useRef(0);
  const fadeRef  = useRef(0);
  const anglesRef = useRef([]);

  // Bake particle params once
  const particles = useMemo(() => (
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      radius:      config.size * (1.95 + (i % 5) * 0.14),
      speed:       (0.38 + (i % 7) * 0.09) * (i % 2 === 0 ? 1 : -1),
      angle0:      (i / PARTICLE_COUNT) * Math.PI * 2,
      yBase:       ((i % 3) - 1) * config.size * 0.22,
      yAmp:        config.size * (0.05 + (i % 4) * 0.05),
      yFreq:       0.55 + (i % 5) * 0.22,
      size:        0.028 + (i % 6) * 0.009,
      baseOpacity: 0.5 + (i % 5) * 0.1,
    }))
  ), [config.size]);

  useEffect(() => {
    anglesRef.current = particles.map(p => p.angle0);
  }, [particles]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    fadeRef.current  = Math.min(1, fadeRef.current + delta * 1.4);
    const fade = fadeRef.current;

    // Inner ring pulse
    if (innerMatRef.current) {
      innerMatRef.current.emissiveIntensity = 2.2 + Math.sin(timeRef.current * 2.4) * 0.9;
      innerMatRef.current.opacity = fade * 0.92;
    }
    // Outer ring breath (opposite phase)
    if (outerMatRef.current) {
      outerMatRef.current.emissiveIntensity = 1.0 + Math.sin(timeRef.current * 1.8 + Math.PI) * 0.4;
      outerMatRef.current.opacity = fade * 0.38;
    }
    // Pulse light
    if (pulseLightRef.current) {
      pulseLightRef.current.intensity = fade * (1.8 + Math.sin(timeRef.current * 2.4) * 0.6);
    }

    // Revolving gyroscope lines — each group spins on its own axis
    ORBIT_LINES.forEach((line, i) => {
      const grp = orbitGroupRefs.current[i];
      const mat = orbitMatRefs.current[i];
      if (grp) grp.rotation.y += delta * line.speed;
      if (mat) mat.opacity = line.opacity * fade;
    });

    // Particles
    particles.forEach((p, i) => {
      anglesRef.current[i] += delta * p.speed;
      const mesh = particleMeshes.current[i];
      const mat  = particleMats.current[i];
      if (!mesh) return;
      const a = anglesRef.current[i];
      mesh.position.set(
        Math.cos(a) * p.radius,
        p.yBase + Math.sin(a * p.yFreq) * p.yAmp,
        Math.sin(a) * p.radius,
      );
      if (mat) {
        mat.opacity = p.baseOpacity * fade;
        mat.emissiveIntensity = 2.8 + Math.sin(timeRef.current * 3.5 + i * 0.9) * 1.0;
      }
    });
  });

  return (
    <>
      {/* Pulsing point light */}
      <pointLight
        ref={pulseLightRef}
        color={config.meshColor}
        intensity={0}
        distance={config.size * 11}
        decay={2}
      />

      {/* Equatorial neon rings */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[config.size * 1.48, config.size * 1.62, 96]} />
          <meshStandardMaterial
            ref={innerMatRef}
            color={config.meshColor}
            emissive={config.meshColor}
            emissiveIntensity={2.2}
            transparent opacity={0}
            side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
        <mesh>
          <ringGeometry args={[config.size * 1.88, config.size * 1.96, 96]} />
          <meshStandardMaterial
            ref={outerMatRef}
            color={config.meshColor}
            emissive={config.meshColor}
            emissiveIntensity={1.0}
            transparent opacity={0}
            side={THREE.DoubleSide} depthWrite={false}
          />
        </mesh>
      </group>

      {/* Gyroscope revolving lines — three tilted orbital arcs that spin */}
      {ORBIT_LINES.map((line, i) => {
        const r = config.size * line.radiusMul;
        const w = config.size * line.width;
        return (
          <group
            key={i}
            ref={el => { orbitGroupRefs.current[i] = el; }}
            rotation={[line.tiltX, 0, line.tiltZ]}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - w, r + w, 128]} />
              <meshStandardMaterial
                ref={el => { orbitMatRefs.current[i] = el; }}
                color={config.meshColor}
                emissive={config.meshColor}
                emissiveIntensity={1.8}
                transparent opacity={0}
                side={THREE.DoubleSide} depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* Particle halo — 16 orbiting dust motes */}
      {particles.map((p, i) => (
        <mesh key={i} ref={el => { particleMeshes.current[i] = el; }}>
          <sphereGeometry args={[p.size, 5, 5]} />
          <meshStandardMaterial
            ref={el => { particleMats.current[i] = el; }}
            color={config.meshColor}
            emissive={config.meshColor}
            emissiveIntensity={2.8}
            transparent opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

// ── Planet ─────────────────────────────────────────────────────────────────────
export default function Planet({ persona, config, onClick, onRegister, driftMode, driftPosition, isActiveDriftPlanet }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    if (groupRef.current && onRegister) {
      onRegister(persona.id, groupRef.current);
    }
  }, [persona.id, onRegister]);

  // Procedural surface texture via canvas
  const surfaceTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = config.meshColor;
    ctx.fillRect(0, 0, size, size);

    const baseColor = new THREE.Color(config.meshColor);
    const darkColor = baseColor.clone().multiplyScalar(0.6);
    const lightColor = baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.2);

    for (let i = 0; i < 800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 12 + 2;
      const opacity = Math.random() * 0.3;
      const useLight = Math.random() > 0.5;
      const c = useLight ? lightColor : darkColor;
      ctx.fillStyle = `rgba(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)}, ${opacity})`;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    if (['connect', 'fashion', 'ventures'].includes(persona.id)) {
      for (let band = 0; band < 8; band++) {
        const y = (band / 8) * size + Math.random() * 20;
        const bandColor = band % 2 === 0 ? lightColor : darkColor;
        ctx.fillStyle = `rgba(${Math.floor(bandColor.r * 255)}, ${Math.floor(bandColor.g * 255)}, ${Math.floor(bandColor.b * 255)}, 0.15)`;
        ctx.fillRect(0, y, size, 8 + Math.random() * 15);
      }
    }

    if (['work', 'runner', 'thoughts'].includes(persona.id)) {
      const capColor = persona.id === 'work' ? '#ffffff' : '#e0d8cc';
      ctx.fillStyle = capColor;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(size / 2, 10, size / 2.5, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(size / 2, size - 10, size / 2.5, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (persona.id === 'work') {
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * size;
        const y = 30 + Math.random() * (size - 60);
        ctx.fillStyle = `rgba(26, 138, 58, ${0.15 + Math.random() * 0.2})`;
        ctx.beginPath();
        const w = 20 + Math.random() * 40;
        const h = 15 + Math.random() * 30;
        ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [config.meshColor, persona.id]);

  const scrambledSpeedRef = useRef(null);
  const idleTimeRef = useRef(Math.random() * Math.PI * 2);

  const driftModeRef = useRef(false);
  useEffect(() => { driftModeRef.current = driftMode; }, [driftMode]);

  // Snap planets into drift lineup + scale down; restore on exit
  useEffect(() => {
    if (!groupRef.current) return;
    if (driftMode && driftPosition) {
      groupRef.current.position.set(driftPosition[0], driftPosition[1], driftPosition[2]);
      gsap.to(groupRef.current.scale, {
        x: 0.65, y: 0.65, z: 0.65,
        duration: 0.35,
        ease: 'power2.out',
      });
    } else if (!driftMode) {
      gsap.killTweensOf(groupRef.current.scale);
      gsap.to(groupRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [driftMode, driftPosition]);

  // Scale active drift planet up — pops forward from the lineup
  useEffect(() => {
    if (!groupRef.current || !driftMode) return;
    const s = isActiveDriftPlanet ? 0.88 : 0.65;
    gsap.to(groupRef.current.scale, {
      x: s, y: s, z: s,
      duration: 0.45,
      ease: 'back.out(1.6)',
    });
  }, [isActiveDriftPlanet, driftMode]);

  useFrame((_, delta) => {
    if (window.__sunOrbitScramble && scrambledSpeedRef.current === null) {
      scrambledSpeedRef.current = config.orbitSpeed * (0.3 + Math.random() * 3.5) * (Math.random() > 0.5 ? 1 : -1);
    }
    if (window.__sunOrbitRestore && scrambledSpeedRef.current !== null) {
      scrambledSpeedRef.current = null;
    }

    if (!driftModeRef.current) {
      const speed = scrambledSpeedRef.current ?? config.orbitSpeed;
      angleRef.current += delta * speed;
      const x = Math.cos(angleRef.current) * config.orbitRadius;
      const z = Math.sin(angleRef.current) * config.orbitRadius;
      groupRef.current.position.set(x, 0, z);
    }

    meshRef.current.rotation.y += delta * 0.3;

    if (!hovered && meshRef.current?.material) {
      idleTimeRef.current += delta * 1.1;
      meshRef.current.material.emissiveIntensity = 0.55 + Math.sin(idleTimeRef.current) * 0.12;
    }
  });

  const planetContent = (
    <>
      {/* Main planet body */}
      <mesh ref={meshRef} scale={hovered ? 1.15 : 1}>
        <sphereGeometry args={[config.size, 64, 64]} />
        <meshStandardMaterial
          map={surfaceTexture}
          emissive={config.emissive}
          emissiveIntensity={hovered ? 1.8 : 0.55}
          roughness={config.roughness ?? 0.5}
          metalness={config.metalness ?? 0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Per-planet point light */}
      <pointLight
        color={config.meshColor}
        intensity={hovered ? 2.5 : 0.8}
        distance={config.size * 6}
        decay={2}
      />

      {/* Expanded invisible hit sphere */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(persona.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
      >
        <sphereGeometry args={[config.size * 2.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Ring system (Saturn-style) */}
      {config.hasRing && (
        <mesh rotation={[Math.PI / 2.2, 0.1, 0]}>
          <ringGeometry args={[config.size * 1.4, config.size * 2.0, 64]} />
          <meshBasicMaterial
            color={config.ringColor}
            transparent
            opacity={config.ringOpacity ?? 0.4}
            side={2}
          />
        </mesh>
      )}

      {/* Atmosphere glow */}
      {config.hasAtmosphere && (
        <mesh scale={1.2}>
          <sphereGeometry args={[config.size, 32, 32]} />
          <meshBasicMaterial
            color={config.atmosphereColor}
            transparent
            opacity={hovered ? config.atmosphereOpacity * 2.5 : config.atmosphereOpacity}
          />
        </mesh>
      )}

      {/* Active drift highlight — pulsing rings + particle halo */}
      {isActiveDriftPlanet && <DriftHighlight config={config} />}

      {/* Hover label */}
      {hovered && (
        <Html
          position={[0, config.size + 0.5, 0]}
          center
          style={{
            color: '#fff',
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textShadow: '0 0 12px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div>{persona.icon} {persona.title}</div>
            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>{config.realName}</div>
          </div>
        </Html>
      )}
    </>
  );

  return (
    <group ref={groupRef}>
      {/* Float disabled in drift — ±0.2 unit bobbing breaks the horizontal lineup */}
      {driftMode ? (
        <group>{planetContent}</group>
      ) : (
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
          {planetContent}
        </Float>
      )}
    </group>
  );
}
