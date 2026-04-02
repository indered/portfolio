import { useState } from 'react';
import * as THREE from 'three';

export default function OrbitRing({ radius, personaId, onClick, driftMode }) {
  const [hovered, setHovered] = useState(false);

  // Fade rings out in drift mode — planets have left their orbits
  const opacity = driftMode ? 0 : (hovered ? 0.22 : 0.04);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {/* Visual ring */}
      <mesh>
        <ringGeometry args={[radius - (hovered && !driftMode ? 0.08 : 0.02), radius + (hovered && !driftMode ? 0.08 : 0.02), 128]} />
        <meshBasicMaterial
          color={hovered && !driftMode ? '#aaddff' : '#ffffff'}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hit torus — disabled in drift */}
      {!driftMode && (
        <mesh
          onClick={(e) => { e.stopPropagation(); onClick?.(personaId); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
        >
          <torusGeometry args={[radius, 0.4, 8, 128]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
