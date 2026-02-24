import { useState } from 'react';
import * as THREE from 'three';

export default function OrbitRing({ radius, personaId, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Visual ring — thin and decorative */}
      <mesh>
        <ringGeometry args={[radius - (hovered ? 0.08 : 0.02), radius + (hovered ? 0.08 : 0.02), 128]} />
        <meshBasicMaterial
          color={hovered ? '#aaddff' : '#ffffff'}
          transparent
          opacity={hovered ? 0.22 : 0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Invisible fat torus for hit detection — 0.35 tube radius gives ~0.7 unit wide clickable band */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick?.(personaId); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
      >
        <torusGeometry args={[radius, 0.4, 8, 128]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
