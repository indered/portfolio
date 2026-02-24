import { useMemo } from 'react';
import * as THREE from 'three';

// ─── Procedural Spiral Galaxy Texture ─────────────────────────────────────────
// Draws logarithmic spiral arms with a bright core — looks like a real galaxy
function makeSpiralGalaxy(color, tiltY = 0.55, armCount = 2) {
  const res = 256;
  const canvas = document.createElement('canvas');
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(color);
  const cr = Math.floor(c.r * 255);
  const cg = Math.floor(c.g * 255);
  const cb = Math.floor(c.b * 255);
  const cx = res / 2;
  const cy = res / 2;

  // Outer halo glow
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, res * 0.5);
  halo.addColorStop(0,   `rgba(${cr}, ${cg}, ${cb}, 0.08)`);
  halo.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.04)`);
  halo.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, res, res);

  // Spiral arms — logarithmic spiral with scatter
  const DOTS = 1200;
  for (let arm = 0; arm < armCount; arm++) {
    const phase = (arm / armCount) * Math.PI * 2;
    for (let i = 0; i < DOTS; i++) {
      const t = i / DOTS;
      const angle = phase + t * Math.PI * 3.5;       // 1.75 full rotations per arm
      const r = t * res * 0.44;
      const scatter = t * 28 * (0.5 + Math.random() * 0.5);

      const px = cx + Math.cos(angle) * r + (Math.random() - 0.5) * scatter;
      const py = cy + Math.sin(angle) * r * tiltY + (Math.random() - 0.5) * scatter * 0.6;

      // Stars are denser and brighter near core
      const brightness = Math.pow(1 - t, 0.5);
      const dotR = brightness * 2.5 + 0.5;
      const alpha = brightness * 0.55 + 0.08;

      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Occasional bright hot stars scattered through arms
  for (let i = 0; i < 60; i++) {
    const t = Math.random();
    const arm = Math.floor(Math.random() * armCount);
    const phase = (arm / armCount) * Math.PI * 2;
    const angle = phase + t * Math.PI * 3.5;
    const r = t * res * 0.42;
    const px = cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20;
    const py = cy + Math.sin(angle) * r * tiltY + (Math.random() - 0.5) * 12;
    ctx.fillStyle = `rgba(255, 255, 240, ${(0.4 + Math.random() * 0.4).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(px, py, 0.8 + Math.random() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright galactic core — warm white centre
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, res * 0.13);
  core.addColorStop(0,    'rgba(255, 252, 230, 0.95)');
  core.addColorStop(0.2,  `rgba(${Math.min(cr + 60, 255)}, ${Math.min(cg + 40, 255)}, ${cb}, 0.7)`);
  core.addColorStop(0.55, `rgba(${cr}, ${cg}, ${cb}, 0.25)`);
  core.addColorStop(1,    'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, res, res);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Procedural Nebula / Cloud Texture ────────────────────────────────────────
function makeNebula(color) {
  const res = 256;
  const canvas = document.createElement('canvas');
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext('2d');

  const c = new THREE.Color(color);
  const cr = Math.floor(c.r * 255);
  const cg = Math.floor(c.g * 255);
  const cb = Math.floor(c.b * 255);

  // Multiple overlapping blobs at random positions = cloud nebula
  const blobCount = 7 + Math.floor(Math.random() * 6);
  for (let i = 0; i < blobCount; i++) {
    const bx = res * (0.15 + Math.random() * 0.7);
    const by = res * (0.15 + Math.random() * 0.7);
    const br = res * (0.12 + Math.random() * 0.28);
    const ba = 0.18 + Math.random() * 0.28;
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    grad.addColorStop(0,    `rgba(${cr}, ${cg}, ${cb}, ${ba.toFixed(2)})`);
    grad.addColorStop(0.45, `rgba(${cr}, ${cg}, ${cb}, ${(ba * 0.35).toFixed(2)})`);
    grad.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, res, res);
  }

  // Bright emission core
  const cx = res * (0.35 + Math.random() * 0.3);
  const cy = res * (0.35 + Math.random() * 0.3);
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, res * 0.07);
  coreGrad.addColorStop(0, 'rgba(255,255,255,0.85)');
  coreGrad.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.5)`);
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.fillRect(0, 0, res, res);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ─── Galaxy Catalogue ─────────────────────────────────────────────────────────
// Positions: far enough to be "background" but close enough to be clearly visible
// Types: 'spiral' | 'nebula'
const CATALOGUE = [
  // Hero galaxies — large and prominent, dominate different quadrants of the sky
  { pos: [85, 40, -70], size: 55, color: '#5577ee', opacity: 0.55, type: 'spiral', tilt: 0.45 },
  { pos: [-80, 20, -90], size: 48, color: '#dd4499', opacity: 0.50, type: 'spiral', tilt: 0.65 },
  { pos: [50, -25, -100], size: 42, color: '#8855cc', opacity: 0.45, type: 'spiral', tilt: 0.35 },
  // Large nebulae — colourful cloud structures
  { pos: [-90, 50, 40], size: 38, color: '#33bbcc', opacity: 0.40, type: 'nebula' },
  { pos: [70, 60, 80], size: 32, color: '#ee7733', opacity: 0.38, type: 'nebula' },
  { pos: [-60, -35, 90], size: 35, color: '#5588ff', opacity: 0.38, type: 'nebula' },
  // Medium spiral galaxies in other directions
  { pos: [110, -15, 45], size: 28, color: '#aabbff', opacity: 0.32, type: 'spiral', tilt: 0.28 },
  { pos: [-45, 65, -75], size: 26, color: '#ffaa55', opacity: 0.30, type: 'nebula' },
  { pos: [35, -60, 105], size: 24, color: '#cc88ff', opacity: 0.28, type: 'spiral', tilt: 0.7 },
  { pos: [-105, -20, -55], size: 26, color: '#55aaee', opacity: 0.30, type: 'nebula' },
  // Far-field depth galaxies
  { pos: [75, 85, -35], size: 18, color: '#aaaaee', opacity: 0.22, type: 'nebula' },
  { pos: [-125, 15, 25], size: 20, color: '#ee99bb', opacity: 0.20, type: 'nebula' },
];

export default function DistantGalaxies() {
  const galaxies = useMemo(() =>
    CATALOGUE.map((g) => ({
      ...g,
      texture: g.type === 'spiral'
        ? makeSpiralGalaxy(g.color, g.tilt ?? 0.5)
        : makeNebula(g.color),
    })),
  []);

  return (
    <group>
      {galaxies.map((g, i) => (
        <sprite key={i} position={g.pos} scale={[g.size, g.size, 1]}>
          <spriteMaterial
            map={g.texture}
            transparent
            opacity={g.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}
