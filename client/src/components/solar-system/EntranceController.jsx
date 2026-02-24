import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Wraps children in a group that smoothly scales from 0→1 when `show` becomes true.
// Uses critically-damped spring for extra smooth, organic feel — no overshoot, no pop.
export default function EntranceController({ show, children }) {
  const groupRef = useRef();
  const scaleRef = useRef(show ? 1 : 0.001);
  const velocityRef = useRef(0);
  const targetRef = useRef(show ? 1 : 0);

  targetRef.current = show ? 1 : 0;

  useFrame((_, delta) => {
    const current = scaleRef.current;
    const target = targetRef.current;
    const diff = target - current;

    if (Math.abs(diff) < 0.0005 && Math.abs(velocityRef.current) < 0.001) {
      if (current !== target) {
        scaleRef.current = target;
        velocityRef.current = 0;
        groupRef.current.scale.setScalar(Math.max(target, 0.001));
        groupRef.current.visible = target > 0;
      }
      return;
    }

    // Critically-damped spring: smooth, no overshoot
    const stiffness = 4;   // lower = slower, more graceful
    const damping = 2 * Math.sqrt(stiffness); // critical damping
    const dt = Math.min(delta, 0.05); // clamp delta

    const springForce = stiffness * diff;
    const dampForce = -damping * velocityRef.current;
    const acceleration = springForce + dampForce;

    velocityRef.current += acceleration * dt;
    scaleRef.current += velocityRef.current * dt;

    const s = Math.max(scaleRef.current, 0.001);
    groupRef.current.scale.setScalar(s);
    groupRef.current.visible = s > 0.01;
  });

  return (
    <group ref={groupRef} visible={show} scale={show ? 1 : 0.001}>
      {children}
    </group>
  );
}
