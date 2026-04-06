import { useEffect, useLayoutEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Drives the "universe being born" camera pullback + fog reveal.
// Camera starts close to the sun, pulls back to orbital view.
// Fog starts dense (everything hidden), clears as camera retreats.
export default function BirthFogController({ active, onRevealComplete }) {
  const { scene, camera } = useThree();
  const hasRun = useRef(false);

  // useLayoutEffect fires before the browser paints — guarantees fog is installed
  // before the canvas becomes visible (prevents the 1-frame flash on birth)
  useLayoutEffect(() => {
    if (active) {
      scene.fog = new THREE.FogExp2('#050510', 0.4);
      camera.position.set(0, 0.5, 2.5);
      camera.fov = 75;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);
    } else {
      scene.fog = null;
    }
  }, [active, scene, camera]);

  useEffect(() => {
    if (!active || hasRun.current) return;
    hasRun.current = true;

    // Fog and camera already set by useLayoutEffect above

    const tl = gsap.timeline();

    // Camera pulls back to orbital view (smooth, no sudden jump)
    tl.to(camera.position, {
      x: 0,
      y: 8,
      z: 22,
      duration: 5.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        // Gradually narrow FOV as we pull back (wide birth → calm orbit)
        const pullProgress = camera.position.z / 22;
        camera.fov = THREE.MathUtils.lerp(75, 50, Math.min(pullProgress, 1));
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
      },
    }, 0);

    // Fog clears gradually
    const fogProxy = { density: 0.4 };
    tl.to(fogProxy, {
      density: 0,
      duration: 5.0,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (scene.fog) scene.fog.density = fogProxy.density;
      },
    }, 0.4);

    // Cleanup and signal completion
    tl.call(() => {
      scene.fog = null;
      onRevealComplete?.();
    });

  }, [active, scene, camera, onRevealComplete]);

  return null;
}
