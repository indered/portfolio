import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function Planet({ persona, config, onClick, onRegister }) {
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

    // Base color
    ctx.fillStyle = config.meshColor;
    ctx.fillRect(0, 0, size, size);

    // Add surface noise/variation
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

    // Add "bands" for gas giants (Jupiter=social, Saturn=fashion, Neptune=blockchain)
    if (['social', 'fashion', 'blockchain'].includes(persona.id)) {
      for (let band = 0; band < 8; band++) {
        const y = (band / 8) * size + Math.random() * 20;
        const bandColor = band % 2 === 0 ? lightColor : darkColor;
        ctx.fillStyle = `rgba(${Math.floor(bandColor.r * 255)}, ${Math.floor(bandColor.g * 255)}, ${Math.floor(bandColor.b * 255)}, 0.15)`;
        ctx.fillRect(0, y, size, 8 + Math.random() * 15);
      }
    }

    // Add polar caps for rocky planets (Earth=developer, Mars=runner, Pluto=thinker)
    if (['developer', 'runner', 'thinker'].includes(persona.id)) {
      const capColor = persona.id === 'developer' ? '#ffffff' : '#e0d8cc';
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

    // Earth gets blue oceans + green continents
    if (persona.id === 'developer') {
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

    // Venus gets thick cloud swirls
    if (persona.id === 'music') {
      for (let i = 0; i < 20; i++) {
        const y = Math.random() * size;
        ctx.strokeStyle = `rgba(255, 220, 150, ${0.1 + Math.random() * 0.15})`;
        ctx.lineWidth = 3 + Math.random() * 5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          size * 0.3, y + (Math.random() - 0.5) * 30,
          size * 0.7, y + (Math.random() - 0.5) * 30,
          size, y + (Math.random() - 0.5) * 20
        );
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [config.meshColor, persona.id]);

  const scrambledSpeedRef = useRef(null);

  useFrame((_, delta) => {
    // Orbit scramble Easter egg — sun click randomises speeds temporarily
    if (window.__sunOrbitScramble && scrambledSpeedRef.current === null) {
      scrambledSpeedRef.current = config.orbitSpeed * (0.3 + Math.random() * 3.5) * (Math.random() > 0.5 ? 1 : -1);
    }
    if (window.__sunOrbitRestore && scrambledSpeedRef.current !== null) {
      scrambledSpeedRef.current = null;
    }

    const speed = scrambledSpeedRef.current ?? config.orbitSpeed;
    angleRef.current += delta * speed;
    const x = Math.cos(angleRef.current) * config.orbitRadius;
    const z = Math.sin(angleRef.current) * config.orbitRadius;
    groupRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Main planet body */}
        <mesh
          ref={meshRef}
          scale={hovered ? 1.15 : 1}
        >
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

        {/* Per-planet point light — creates a warm local glow in the scene */}
        <pointLight
          color={config.meshColor}
          intensity={hovered ? 2.5 : 0.8}
          distance={config.size * 6}
          decay={2}
        />

        {/* Invisible expanded hit sphere — 2.5x visual size for easier clicking */}
        <mesh
          onClick={(e) => { e.stopPropagation(); onClick(persona.id); }}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
        >
          <sphereGeometry args={[config.size * 2.5, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Ring system */}
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

        {/* Hover label */}
        {hovered && (
          <Html
            position={[0, config.size + 0.5, 0]}
            center
            style={{
              color: '#fff',
              fontFamily: 'Space Grotesk, sans-serif',
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
      </Float>
    </group>
  );
}
