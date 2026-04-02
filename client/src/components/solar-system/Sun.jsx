import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// ─── "MI" sunspot canvas texture ─────────────────────────────────────────────

function createMiTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Photosphere base — deep amber
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(0, 0, size, size);

  // Plasma convection noise
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 16 + 3;
    const b = 0.6 + Math.random() * 0.55;
    ctx.fillStyle = `rgba(255, ${Math.floor(100 * b)}, 0, ${Math.random() * 0.22})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // "MI" sunspot — dark cooler plasma region
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#7a2800';
  ctx.font = 'bold 110px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MI', size / 2, size / 2);

  // Penumbra soft halo
  ctx.globalAlpha = 0.3;
  ctx.shadowColor = '#5a1a00';
  ctx.shadowBlur = 28;
  ctx.fillStyle = '#aa3300';
  ctx.fillText('MI', size / 2, size / 2);

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ─── Name ring SVG ────────────────────────────────────────────────────────────

function SunNameRing() {
  return (
    <Html
      position={[0, 0, 0]}
      center
      distanceFactor={12}
      style={{ pointerEvents: 'none' }}
    >
      <svg
        viewBox="0 0 160 160"
        width="160"
        height="160"
        style={{
          display: 'block',
          overflow: 'visible',
          animation: 'rotateSunRing 32s linear infinite',
        }}
      >
        <defs>
          <path
            id="sunRingPath"
            d="M 80,80 m -64,0 a 64,64 0 1,1 128,0 a 64,64 0 1,1 -128,0"
          />
        </defs>
        <text
          fill="#ffcc44"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="8.5"
          letterSpacing="4"
          opacity="0.36"
        >
          <textPath href="#sunRingPath">
            MAHESH · INDER · DUBAI · UAE · MAHESH · INDER · DUBAI · UAE ·
          </textPath>
        </text>
      </svg>
    </Html>
  );
}

// ─── Orbit scramble Easter egg ────────────────────────────────────────────────
// Clicking the sun randomises each planet's orbital speed + phase for 4 seconds,
// then smoothly restores everything. Planets go haywire, then settle back.

function triggerOrbitScramble(sunMeshRef) {
  if (window.__sunScrambling) return;
  window.__sunScrambling = true;

  // Store original speeds so we can restore them
  const originals = window.__planetOriginalSpeeds || {};

  // Signal planets to scramble — each reads this and randomises itself
  window.__sunOrbitScramble = true;

  // Sun flares briefly
  const proxy = { emissive: 2.0 };
  gsap.to(proxy, {
    emissive: 5.5,
    duration: 0.3,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1,
    onUpdate() {
      if (sunMeshRef.current) {
        sunMeshRef.current.material.emissiveIntensity = proxy.emissive;
      }
    },
  });

  // After 4 seconds, signal restore
  setTimeout(() => {
    window.__sunOrbitScramble = false;
    window.__sunOrbitRestore = true;
    setTimeout(() => {
      window.__sunOrbitRestore = false;
      window.__sunScrambling = false;
    }, 1500);
  }, 4000);
}

// ─── Sun component ────────────────────────────────────────────────────────────

export default function Sun({ hubVisible = true }) {
  const meshRef  = useRef();
  const miTexture = useMemo(() => createMiTexture(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 48, 48]} />
      <meshStandardMaterial
        color="#ffaa00"
        emissive="#ff6600"
        emissiveIntensity={2}
        map={miTexture}
        toneMapped={false}
      />

      {/* Outer corona glow shell */}
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.08} />
      </mesh>

      {/* Expanded invisible hit sphere — easier to click */}
      {hubVisible && (
        <mesh
          onClick={(e) => { e.stopPropagation(); triggerOrbitScramble(meshRef); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'none'; }}
        >
          <sphereGeometry args={[2.2, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Rotating name ring */}
      {hubVisible && <SunNameRing />}
    </mesh>
  );
}
