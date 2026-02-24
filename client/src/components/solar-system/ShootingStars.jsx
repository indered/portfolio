import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 18;

// Color palette for shooting stars — some are white, some slightly tinted
const STAR_COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ccddff', '#ffeedd', '#ddeeff', '#ffe8cc'];
// User-summoned stars are special — gold/rose shimmer
const USER_STAR_COLORS = ['#ffdd88', '#ffcc55', '#ff99cc', '#ffaaff', '#ffe0aa'];

function randomStar() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 50 + Math.random() * 70;
  const y = (Math.random() - 0.5) * 80;

  const dx = -Math.cos(angle) + (Math.random() - 0.5) * 0.6;
  const dy = (Math.random() - 0.5) * 0.4;
  const dz = -Math.sin(angle) + (Math.random() - 0.5) * 0.6;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return {
    start: [Math.cos(angle) * dist, y, Math.sin(angle) * dist],
    dir: [dx / len, dy / len, dz / len],
    speed: 12 + Math.random() * 35,
    life: 0,
    maxLife: 1.2 + Math.random() * 2.5,
    delay: Math.random() * 5,
    tailLength: 1.5 + Math.random() * 5,
    active: false,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    headSize: 1,
    isUserStar: false,
  };
}

/**
 * Creates a star that shoots from a clicked world point.
 * Direction: outward/diagonal from the click origin at a random angle.
 */
function userStar(point) {
  // Direction: start at click point, shoot toward opposite hemisphere + slight randomness
  const dx = (Math.random() - 0.5) * 2;
  const dy = 0.3 + Math.random() * 0.7;   // generally upward
  const dz = (Math.random() - 0.5) * 2;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

  return {
    start: [point.x, point.y, point.z],
    dir: [dx / len, dy / len, dz / len],
    speed: 28 + Math.random() * 20,
    life: 0,
    maxLife: 1.6 + Math.random() * 1.0,
    delay: 0,
    tailLength: 4 + Math.random() * 6,
    active: true,
    color: USER_STAR_COLORS[Math.floor(Math.random() * USER_STAR_COLORS.length)],
    headSize: 1.8,   // bigger head
    isUserStar: true,
  };
}

export default function ShootingStars() {
  // slots 0..STAR_COUNT-1 are auto stars; extra slots hold user-triggered stars
  const starsData = useRef(Array.from({ length: STAR_COUNT }, randomStar));
  const meshRefs  = useRef([]);
  const trailRefs = useRef([]);

  // Trail geometry — a thin stretched cone
  const trailGeo = useMemo(() => new THREE.ConeGeometry(0.02, 1, 4), []);
  const headGeo  = useMemo(() => new THREE.SphereGeometry(0.04, 8, 8), []);

  const headMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    toneMapped: false,
  }), []);

  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#aaccff',
    transparent: true,
    toneMapped: false,
  }), []);

  useFrame((_, delta) => {
    // ── Drain user-star queue ─────────────────────────────────────────────────
    const queue = window.__userStarQueue;
    if (queue && queue.length > 0) {
      const point = queue.shift();
      // Find a free slot (expired auto star or completed user star)
      const freeIdx = starsData.current.findIndex(
        (s) => s.life > s.maxLife || (!s.active && s.delay <= 0)
      );
      if (freeIdx >= 0) {
        starsData.current[freeIdx] = userStar(point);
      }
    }

    // ── Animate all stars ─────────────────────────────────────────────────────
    starsData.current.forEach((star, i) => {
      if (star.delay > 0) {
        star.delay -= delta;
        return;
      }

      if (!star.active) {
        star.active = true;
        star.life = 0;
      }

      star.life += delta;

      if (star.life > star.maxLife) {
        // Reset auto stars; let user stars be replaced by next spawn
        if (!star.isUserStar) {
          starsData.current[i] = randomStar();
          starsData.current[i].delay = 0.5 + Math.random() * 3;
        }
        if (meshRefs.current[i])  meshRefs.current[i].visible = false;
        if (trailRefs.current[i]) trailRefs.current[i].visible = false;
        return;
      }

      const t = star.life;
      const x = star.start[0] + star.dir[0] * star.speed * t;
      const y = star.start[1] + star.dir[1] * star.speed * t;
      const z = star.start[2] + star.dir[2] * star.speed * t;

      const fadeIn  = Math.min(t * 6, 1);
      const fadeOut = Math.max(1 - (t - star.maxLife + 0.5) * 2, 0);
      const opacity = Math.min(fadeIn, fadeOut);

      // Head
      if (meshRefs.current[i]) {
        const head = meshRefs.current[i];
        head.position.set(x, y, z);
        head.visible = true;
        head.material.color.set(star.color);
        head.material.opacity = opacity;
        const s = star.headSize ?? 1;
        head.scale.setScalar(s);
      }

      // Trail
      if (trailRefs.current[i]) {
        const trail = trailRefs.current[i];
        const tailL = star.tailLength;
        trail.position.set(
          x - star.dir[0] * tailL * 0.5,
          y - star.dir[1] * tailL * 0.5,
          z - star.dir[2] * tailL * 0.5,
        );
        trail.scale.set(star.headSize ?? 1, tailL, star.headSize ?? 1);
        trail.visible = true;
        trail.material.color.set(star.color);
        trail.material.opacity = opacity * (star.isUserStar ? 0.55 : 0.4);

        const dir = new THREE.Vector3(star.dir[0], star.dir[1], star.dir[2]);
        const up  = new THREE.Vector3(0, 1, 0);
        trail.quaternion.setFromUnitVectors(up, dir);
      }
    });
  });

  return (
    <group>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => { meshRefs.current[i] = el; }}
            geometry={headGeo}
            material={headMat.clone()}
            visible={false}
          />
          <mesh
            ref={(el) => { trailRefs.current[i] = el; }}
            geometry={trailGeo}
            material={trailMat.clone()}
            visible={false}
          />
        </group>
      ))}
    </group>
  );
}
