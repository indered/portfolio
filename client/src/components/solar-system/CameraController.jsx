import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// ── Constants ─────────────────────────────────────────────────────────────────
const PHI_INIT         = Math.asin(8 / 22);   // ~0.374 rad — matches original y=8, r=22
const PHI_MIN          = 0.12;                 // floor: camera stays above planet plane
const PHI_MAX          = Math.PI * 0.48;       // ceiling: ~86° overhead
const RADIUS_DEFAULT   = 22;
const RADIUS_MIN       = 12;
const RADIUS_MAX       = 38;
const DRAG_SPEED       = 0.006;                // rad/px
const WHEEL_SCALE_PX   = 0.003;               // rad/px for trackpad (deltaMode 0)
const WHEEL_SCALE_LINE = 0.05;                // rad/px for mouse wheel (deltaMode 1+)
const INERTIA_DECAY    = 0.88;                 // per-frame velocity multiplier
const AUTO_RESUME_MS   = 2800;                 // ms of inactivity before auto-rotate resumes
const AUTO_ROTATE_SPD  = 0.035;               // rad/s

function getPlanetCloseUp(planetPos) {
  return {
    x: planetPos.x * 0.7,
    y: planetPos.y + 2,
    z: planetPos.z * 0.7,
  };
}

export default function CameraController({
  targetPlanetId,
  planetRefs,
  onTransitionComplete,
  birthRevealActive,
  travelRef,
  travelTick,
  onTravelComplete,
}) {
  const { camera, gl } = useThree();
  const isAnimating    = useRef(false);
  const activeTl       = useRef(null);

  // Spherical coordinate state — replaces autoRotateAngle
  const orbit = useRef({
    theta:    0,
    phi:      PHI_INIT,
    radius:   RADIUS_DEFAULT,
    dTheta:   0,
    dPhi:     0,
    userActive: false,
    resumeTimer: null,
  });

  // Keep birthReveal accessible inside DOM event handlers without stale closure
  const birthRevealRef = useRef(birthRevealActive);
  useEffect(() => { birthRevealRef.current = birthRevealActive; }, [birthRevealActive]);

  // ── Frame loop — orbit / auto-rotate ───────────────────────────────────────
  useFrame((_, delta) => {
    if (birthRevealActive) return;
    if (isAnimating.current || targetPlanetId || travelTick) return;

    const o = orbit.current;

    if (o.userActive) {
      // Apply inertia
      o.theta += o.dTheta;
      o.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, o.phi + o.dPhi));
      o.dTheta *= INERTIA_DECAY;
      o.dPhi   *= INERTIA_DECAY;
    } else {
      // Auto-rotate: advance theta from wherever user left off (no jump)
      o.theta += delta * AUTO_ROTATE_SPD;
    }

    camera.position.x = Math.sin(o.theta) * Math.cos(o.phi) * o.radius;
    camera.position.y = Math.sin(o.phi) * o.radius;
    camera.position.z = Math.cos(o.theta) * Math.cos(o.phi) * o.radius;
    camera.lookAt(0, 0, 0);
  });

  // ── DOM event handlers for drag / wheel / pinch ────────────────────────────
  useEffect(() => {
    const el = gl.domElement;
    const o  = orbit.current;

    function scheduleResume() {
      o.userActive = true;
      clearTimeout(o.resumeTimer);
      o.resumeTimer = setTimeout(() => { o.userActive = false; }, AUTO_RESUME_MS);
    }

    // ── Pointer drag (mouse) ──────────────────────────────────────────────────
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    function onMouseDown(e) {
      if (birthRevealRef.current) return;
      if (isAnimating.current) return;
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      o.dTheta = 0;
      o.dPhi   = 0;
      scheduleResume();
    }

    function onMouseMove(e) {
      if (!isDragging || isAnimating.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      o.dTheta = -dx * DRAG_SPEED;
      o.dPhi   =  dy * DRAG_SPEED;
      o.theta += o.dTheta;
      o.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, o.phi + o.dPhi));
      scheduleResume();
    }

    function onMouseUp() { isDragging = false; }

    // ── Wheel (two-finger trackpad swipe on macOS = wheel events) ────────────
    function onWheel(e) {
      if (birthRevealRef.current || isAnimating.current) return;
      e.preventDefault();
      const scale = e.deltaMode === 0 ? WHEEL_SCALE_PX : WHEEL_SCALE_LINE;
      o.dTheta = -e.deltaX * scale;
      o.dPhi   =  e.deltaY * scale;
      o.theta += o.dTheta;
      o.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, o.phi + o.dPhi));
      scheduleResume();
    }

    // ── Touch (single-finger drag + two-finger pinch) ─────────────────────────
    let lastTouchX = 0;
    let lastTouchY = 0;
    let lastPinchDist = null;
    let isTouchDragging = false;

    function getTouchDist(e) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e) {
      if (birthRevealRef.current || isAnimating.current) return;
      if (e.touches.length === 2) {
        isTouchDragging = false;
        lastPinchDist = getTouchDist(e);
      } else {
        isTouchDragging = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        o.dTheta = 0;
        o.dPhi   = 0;
      }
      scheduleResume();
    }

    function onTouchMove(e) {
      if (birthRevealRef.current || isAnimating.current) return;
      if (e.touches.length === 2 && lastPinchDist !== null) {
        e.preventDefault();
        const dist  = getTouchDist(e);
        const delta = lastPinchDist - dist; // pinch in = zoom out
        o.radius     = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, o.radius + delta * 0.06));
        lastPinchDist = dist;
        scheduleResume();
      } else if (isTouchDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        o.dTheta = -dx * DRAG_SPEED;
        o.dPhi   =  dy * DRAG_SPEED;
        o.theta += o.dTheta;
        o.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, o.phi + o.dPhi));
        scheduleResume();
      }
    }

    function onTouchEnd() {
      isTouchDragging = false;
      lastPinchDist   = null;
    }

    el.addEventListener('mousedown',  onMouseDown, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup',   onMouseUp,   { passive: true });
    el.addEventListener('wheel',      onWheel,     { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('mousedown',  onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
      el.removeEventListener('wheel',      onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
      clearTimeout(o.resumeTimer);
    };
  }, [gl]); // gl is stable

  // ── Hub → Planet fly-in ───────────────────────────────────────────────────
  useEffect(() => {
    if (birthRevealActive) return;
    if (!targetPlanetId || travelTick) return;

    const planetGroup = planetRefs.current?.[targetPlanetId];
    if (!planetGroup) return;

    isAnimating.current = true;
    const planetPos    = planetGroup.position.clone();
    const targetCamPos = getPlanetCloseUp(planetPos);

    gsap.to(camera.position, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate:   () => camera.lookAt(planetPos.x, planetPos.y, planetPos.z),
      onComplete: () => {
        isAnimating.current = false;
        onTransitionComplete?.();
      },
    });
  }, [targetPlanetId, camera, planetRefs, onTransitionComplete, birthRevealActive, travelTick]);

  // ── Planet → Planet cinematic travel ─────────────────────────────────────
  useEffect(() => {
    if (!travelTick || !travelRef?.current) return;
    const { sourcePlanetId, targetPlanetId: destId } = travelRef.current;

    const sourceGroup = planetRefs.current?.[sourcePlanetId];
    const targetGroup = planetRefs.current?.[destId];
    if (!sourceGroup || !targetGroup) {
      console.warn('[CameraController] Travel refs not ready:', sourcePlanetId, destId);
      return;
    }

    if (activeTl.current) activeTl.current.kill();
    isAnimating.current = true;

    const sourcePos    = sourceGroup.position.clone();
    const targetPos    = targetGroup.position.clone();
    const closeUpStart = getPlanetCloseUp(sourcePos);
    const overview     = { x: 0, y: 18, z: 28 };
    const closeUpEnd   = getPlanetCloseUp(targetPos);

    camera.position.set(closeUpStart.x, closeUpStart.y, closeUpStart.z);
    camera.lookAt(sourcePos.x, sourcePos.y, sourcePos.z);

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        onTravelComplete?.();
      },
    });

    // Phase 1: Escape from source
    const p1Proxy = { t: 0 };
    tl.to(p1Proxy, {
      t: 1, duration: 0.7, ease: 'power4.out',
      onUpdate: () => {
        const lerpT = Math.min(p1Proxy.t * 1.8, 1);
        camera.lookAt(
          THREE.MathUtils.lerp(sourcePos.x, 0, lerpT),
          THREE.MathUtils.lerp(sourcePos.y, 0, lerpT),
          THREE.MathUtils.lerp(sourcePos.z, 0, lerpT),
        );
      },
    }, 0);
    tl.to(camera.position, {
      x: overview.x, y: overview.y, z: overview.z,
      duration: 0.7, ease: 'power4.out',
    }, 0);

    // Phase 2: Bezier arc through void
    const midPoint = new THREE.Vector3(
      (overview.x + closeUpEnd.x) / 2 + (targetPos.z - sourcePos.z) * 0.3,
      overview.y * 0.55,
      (overview.z + closeUpEnd.z) / 2 - (targetPos.x - sourcePos.x) * 0.3,
    );
    const approachPoint = new THREE.Vector3(
      closeUpEnd.x * 1.6, closeUpEnd.y + 2, closeUpEnd.z * 1.6,
    );
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(overview.x, overview.y, overview.z),
      midPoint,
      approachPoint,
    );
    const p2Proxy = { t: 0 };
    tl.to(p2Proxy, {
      t: 1, duration: 0.9, ease: 'power2.inOut',
      onUpdate: () => {
        const pt    = curve.getPoint(p2Proxy.t);
        camera.position.set(pt.x, pt.y, pt.z);
        const lookT = Math.max(0, (p2Proxy.t - 0.4) / 0.6);
        camera.lookAt(
          THREE.MathUtils.lerp(0, targetPos.x, lookT),
          THREE.MathUtils.lerp(0, targetPos.y, lookT),
          THREE.MathUtils.lerp(0, targetPos.z, lookT),
        );
      },
    });

    // Phase 3: Gravitational approach
    tl.to(camera.position, {
      x: closeUpEnd.x, y: closeUpEnd.y, z: closeUpEnd.z,
      duration: 0.8, ease: 'power2.in',
      onUpdate: () => camera.lookAt(targetPos.x, targetPos.y, targetPos.z),
    });

    // Phase 4: Orbital micro-settle
    tl.to(camera.position, {
      x: closeUpEnd.x * 0.97, y: closeUpEnd.y - 0.4, z: closeUpEnd.z * 0.97,
      duration: 0.65, ease: 'power1.out',
      onUpdate: () => camera.lookAt(targetPos.x, targetPos.y, targetPos.z),
    });

    activeTl.current = tl;
    return () => { tl.kill(); isAnimating.current = false; };
  }, [travelTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset camera (called from outside via window.__solarSystemResetCamera) ──
  const resetCamera = useCallback(() => {
    if (activeTl.current) activeTl.current.kill();
    isAnimating.current = true;
    gsap.to(camera.position, {
      x: 0, y: 8, z: 22,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(0, 0, 0),
      onComplete: () => {
        isAnimating.current = false;
        const o    = orbit.current;
        o.theta    = 0;
        o.phi      = PHI_INIT;
        o.radius   = RADIUS_DEFAULT;
        o.dTheta   = 0;
        o.dPhi     = 0;
        o.userActive = false;
        clearTimeout(o.resumeTimer);
      },
    });
  }, [camera]);

  useEffect(() => {
    window.__solarSystemResetCamera = resetCamera;
    return () => { delete window.__solarSystemResetCamera; };
  }, [resetCamera]);

  return null;
}
