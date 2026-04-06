import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Sphere({ color, emissive }) {
  const ref = useRef();
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.5;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 3]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.3} roughness={0.6} />
    </mesh>
  );
}

export default function MiniPlanet({ color = '#4a9eff', emissive = '#1a3a80' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 40 }}
      style={{ width: 48, height: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 4]} intensity={1.5} />
      <Sphere color={color} emissive={emissive} />
    </Canvas>
  );
}
