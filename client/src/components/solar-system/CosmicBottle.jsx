import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';

// ── Position — hidden directly behind the solar system ────────────────────────
// Not visible from default camera [0,8,22]. Requires rotating ~150° to discover.
const ORIGIN = [0, 3, -38];

export default function CosmicBottle({ onNoteOpen, onNoteHide }) {
  const coreRef = useRef();
  const glowRef = useRef();

  const [hovered, setHovered] = useState(false);
  const [opened,  setOpened]  = useState(false);

  // ── Twinkle — two coprime sine waves = organic shimmer ────────────────────────
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const twinkle = 0.72 + 0.28 * Math.sin(t * 3.7) * Math.sin(t * 2.1);
    const base    = hovered ? 6.0 : 3.2;

    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = base * twinkle;
    }
    if (glowRef.current) {
      glowRef.current.intensity = base * twinkle * 1.1;
    }
  });

  // ── Close ─────────────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (!opened) return;
    setOpened(false);
    onNoteHide?.();
  }, [opened, onNoteHide]);

  // ── Click — flash burst, then show note ───────────────────────────────────────
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (opened) return;
    setOpened(true);

    if (coreRef.current) {
      gsap.timeline()
        .to(coreRef.current.scale, { x: 3.5, y: 3.5, z: 3.5, duration: 0.15, ease: 'power2.out' })
        .to(coreRef.current.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.5,  ease: 'elastic.out(1, 0.3)' });
    }

    setTimeout(() => onNoteOpen?.(handleClose), 200);
  }, [opened, handleClose, onNoteOpen]);

  const onOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const onOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'none';
  }, []);

  return (
    <group position={ORIGIN}>
      {/* Point light — casts warm light into the surrounding dark */}
      <pointLight
        ref={glowRef}
        color="#fffae0"
        intensity={3.2}
        distance={12}
        decay={2}
      />

      {/* Core sphere — Bloom does all the work, no geometry spikes needed */}
      <mesh
        ref={coreRef}
        scale={hovered && !opened ? 1.3 : 1.0}
        onClick={handleClick}
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fffae0"
          emissiveIntensity={3.2}
          roughness={0}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* Invisible hit sphere — easier to click */}
      <mesh
        onClick={handleClick}
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
