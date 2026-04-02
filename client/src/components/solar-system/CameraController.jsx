import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { DRIFT_CAM_XS, DRIFT_MIN_X, DRIFT_MAX_X } from '../../lib/constants';

// ── Constants ─────────────────────────────────────────────────────────────────
const PHI_INIT         = Math.asin(8 / 22);
const PHI_MIN          = 0.12;
const PHI_MAX          = Math.PI * 0.48;
const RADIUS_DEFAULT   = 22;
const RADIUS_MIN       = 12;
const RADIUS_MAX       = 38;
const DRAG_SPEED       = 0.006;
const WHEEL_SCALE_PX   = 0.003;
const WHEEL_SCALE_LINE = 0.05;
const INERTIA_DECAY    = 0.88;
const AUTO_RESUME_MS   = 2800;
const AUTO_ROTATE_SPD  = 0.035;

// Drift — proportional scroll drag. No thresholds, no React round-trips.
const DRIFT_DRAG_SENSITIVITY = 0.022;
const DRIFT_SNAP_DELAY_MS    = 220;  // ms of scroll-silence before snapping to nearest planet
const DRIFT_LERP_K           = 10;  // exponential stiffness (higher = snappier)

// Return the index of the planet whose camera X is nearest to `x`
function getNearestPlanetIndex(x) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < DRIFT_CAM_XS.length; i++) {
    const d = Math.abs(DRIFT_CAM_XS[i] - x);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

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
  driftMode,
  onDriftIndexChanged, // (index: number, settled: boolean) => void
  driftControlRef,     // ref object — we write { goToIndex, resetSettled } into .current
}) {
  const { camera, gl } = useThree();
  const isAnimating    = useRef(false);
  const activeTl       = useRef(null);

  const orbit = useRef({
    theta:    0,
    phi:      PHI_INIT,
    radius:   RADIUS_DEFAULT,
    dTheta:   0,
    dPhi:     0,
    userActive: false,
    resumeTimer: null,
  });

  const birthRevealRef = useRef(birthRevealActive);
  useEffect(() => { birthRevealRef.current = birthRevealActive; }, [birthRevealActive]);

  const driftModeRef = useRef(false);
  useEffect(() => { driftModeRef.current = driftMode; }, [driftMode]);

  // ── Self-contained drift state ─────────────────────────────────────────────
  // All hot-path drift math lives in refs — zero React state in the scroll→camera path.
  const driftTargetXRef      = useRef(DRIFT_CAM_XS[0]); // live camera target X (updated on every scroll event)
  const driftLookAtXRef      = useRef(DRIFT_CAM_XS[0]); // smoothly interpolated look-at X
  const driftLocalIndexRef   = useRef(0);                // nearest planet index (for dot indicator)
  const driftSettledFiredRef = useRef(-1);               // which index we last fired settled=true for
  const driftSnapTimerRef    = useRef(null);             // setTimeout → snap to nearest after scroll pause

  const onDriftIndexChangedRef = useRef(onDriftIndexChanged);
  useEffect(() => { onDriftIndexChangedRef.current = onDriftIndexChanged; }, [onDriftIndexChanged]);

  // Initialise / tear down internal drift state when mode toggles
  useEffect(() => {
    if (driftMode) {
      driftTargetXRef.current      = DRIFT_CAM_XS[0];
      driftLookAtXRef.current      = DRIFT_CAM_XS[0];
      driftLocalIndexRef.current   = 0;
      driftSettledFiredRef.current = -1;
    }
    clearTimeout(driftSnapTimerRef.current);
  }, [driftMode]);

  // Expose imperative handle so AppShell can navigate without React round-trips
  useEffect(() => {
    if (!driftControlRef) return;
    driftControlRef.current = {
      goToIndex(idx) {
        const i = Math.max(0, Math.min(DRIFT_CAM_XS.length - 1, idx));
        driftTargetXRef.current      = DRIFT_CAM_XS[i];
        driftLocalIndexRef.current   = i;
        driftSettledFiredRef.current = -1; // allow settled to re-fire
        clearTimeout(driftSnapTimerRef.current);
        onDriftIndexChangedRef.current?.(i, false);
      },
      resetSettled() {
        // Allow the settled callback to re-fire (e.g. after returning from a persona)
        driftSettledFiredRef.current = -1;
      },
    };
  }, [driftControlRef]);

  // ── Frame loop ─────────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (birthRevealActive) return;

    // ── Drift: framerate-independent exponential lerp ─────────────────────
    if (driftModeRef.current && !targetPlanetId && !travelTick) {
      const targetX = driftTargetXRef.current;
      const f = 1 - Math.exp(-DRIFT_LERP_K * delta);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, f);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5, f);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 16, f);

      // look-at leads position slightly — gives a parallax-in-motion feel
      driftLookAtXRef.current = THREE.MathUtils.lerp(
        driftLookAtXRef.current, targetX, Math.min(1, f * 1.3),
      );
      camera.lookAt(driftLookAtXRef.current, 0, 0);

      // Fire "settled" once per snap position
      const nearest = getNearestPlanetIndex(targetX);
      const camDist = Math.abs(camera.position.x - targetX);
      if (camDist < 0.08 && driftSettledFiredRef.current !== nearest) {
        driftSettledFiredRef.current = nearest;
        onDriftIndexChangedRef.current?.(nearest, true);
      }
      return;
    }

    // ── Orbit / auto-rotate ────────────────────────────────────────────────
    if (isAnimating.current || targetPlanetId || travelTick || driftModeRef.current) return;

    const o = orbit.current;
    if (o.userActive) {
      o.theta += o.dTheta;
      o.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, o.phi + o.dPhi));
      o.dTheta *= INERTIA_DECAY;
      o.dPhi   *= INERTIA_DECAY;
    } else {
      o.theta += delta * AUTO_ROTATE_SPD;
    }

    camera.position.x = Math.sin(o.theta) * Math.cos(o.phi) * o.radius;
    camera.position.y = Math.sin(o.phi) * o.radius;
    camera.position.z = Math.cos(o.theta) * Math.cos(o.phi) * o.radius;
    camera.lookAt(0, 0, 0);
  });

  // ── DOM event handlers ────────────────────────────────────────────────────
  useEffect(() => {
    const el = gl.domElement;
    const o  = orbit.current;

    function scheduleResume() {
      o.userActive = true;
      clearTimeout(o.resumeTimer);
      o.resumeTimer = setTimeout(() => { o.userActive = false; }, AUTO_RESUME_MS);
    }

    // ── Mouse drag ────────────────────────────────────────────────────────────
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    function onMouseDown(e) {
      if (birthRevealRef.current || isAnimating.current || driftModeRef.current) return;
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

    // ── Wheel ─────────────────────────────────────────────────────────────────
    function onWheel(e) {
      if (birthRevealRef.current) return;
      e.preventDefault();

      if (driftModeRef.current) {
        // Proportional drag — no threshold, direct ref update, zero React round-trips
        const rawDelta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 20;
        const newX = Math.max(
          DRIFT_MIN_X,
          Math.min(DRIFT_MAX_X, driftTargetXRef.current + rawDelta * DRIFT_DRAG_SENSITIVITY),
        );
        driftTargetXRef.current = newX;

        // Fire index-changed only when nearest planet changes (max 6 React renders total)
        const nearest = getNearestPlanetIndex(newX);
        if (nearest !== driftLocalIndexRef.current) {
          driftLocalIndexRef.current   = nearest;
          driftSettledFiredRef.current = -1;
          onDriftIndexChangedRef.current?.(nearest, false);
        }

        // Snap to nearest planet after scroll stops
        clearTimeout(driftSnapTimerRef.current);
        driftSnapTimerRef.current = setTimeout(() => {
          const snapIdx = getNearestPlanetIndex(driftTargetXRef.current);
          driftTargetXRef.current      = DRIFT_CAM_XS[snapIdx];
          driftLocalIndexRef.current   = snapIdx;
          driftSettledFiredRef.current = -1;
          onDriftIndexChangedRef.current?.(snapIdx, false);
        }, DRIFT_SNAP_DELAY_MS);
        return;
      }

      if (isAnimating.current) return;
      const scale = e.deltaMode === 0 ? WHEEL_SCALE_PX : WHEEL_SCALE_LINE;
      o.dTheta = -e.deltaX * scale;
      o.dPhi   =  e.deltaY * scale;
      o.theta += o.dTheta;
      o.phi    = Math.max(PHI_MIN, Math.min(PHI_MAX, o.phi + o.dPhi));
      scheduleResume();
    }

    // ── Touch ─────────────────────────────────────────────────────────────────
    let lastTouchX    = 0;
    let lastTouchY    = 0;
    let lastPinchDist = null;
    let isTouchDragging = false;
    let touchVelX     = 0; // last-frame dx for momentum on lift

    function getTouchDist(e) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e) {
      if (birthRevealRef.current || isAnimating.current) return;

      if (driftModeRef.current) {
        // Cancel pending snap, prepare for live drag
        clearTimeout(driftSnapTimerRef.current);
        lastTouchX      = e.touches[0].clientX;
        touchVelX       = 0;
        isTouchDragging = true;
        return;
      }

      if (e.touches.length === 2) {
        isTouchDragging = false;
        lastPinchDist   = getTouchDist(e);
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

      // Drift: live proportional drag
      if (driftModeRef.current && isTouchDragging && e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastTouchX;
        touchVelX  = dx;
        lastTouchX = e.touches[0].clientX;

        const newX = Math.max(
          DRIFT_MIN_X,
          Math.min(DRIFT_MAX_X, driftTargetXRef.current - dx * 0.045),
        );
        driftTargetXRef.current = newX;

        const nearest = getNearestPlanetIndex(newX);
        if (nearest !== driftLocalIndexRef.current) {
          driftLocalIndexRef.current   = nearest;
          driftSettledFiredRef.current = -1;
          onDriftIndexChangedRef.current?.(nearest, false);
        }
        return;
      }

      // Pinch zoom (outside drift)
      if (e.touches.length === 2 && lastPinchDist !== null) {
        e.preventDefault();
        const dist  = getTouchDist(e);
        const delta = lastPinchDist - dist;
        o.radius      = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, o.radius + delta * 0.06));
        lastPinchDist = dist;
        scheduleResume();
        return;
      }

      // Orbit drag
      if (isTouchDragging && e.touches.length === 1 && !driftModeRef.current) {
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
      if (driftModeRef.current && isTouchDragging) {
        isTouchDragging = false;
        // Apply light momentum then snap to nearest planet
        const projected = Math.max(
          DRIFT_MIN_X,
          Math.min(DRIFT_MAX_X, driftTargetXRef.current - touchVelX * 0.18),
        );
        const snapIdx = getNearestPlanetIndex(projected);
        driftTargetXRef.current      = DRIFT_CAM_XS[snapIdx];
        driftLocalIndexRef.current   = snapIdx;
        driftSettledFiredRef.current = -1;
        onDriftIndexChangedRef.current?.(snapIdx, false);
        return;
      }
      isTouchDragging = false;
      lastPinchDist   = null;
    }

    el.addEventListener('mousedown',  onMouseDown,  { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup',   onMouseUp,   { passive: true });
    el.addEventListener('wheel',      onWheel,      { passive: false });
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
      clearTimeout(driftSnapTimerRef.current);
    };
  }, [gl]);

  // ── Hub → Planet fly-in ──────────────────────────────────────────────────
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

    tl.to(camera.position, {
      x: closeUpEnd.x, y: closeUpEnd.y, z: closeUpEnd.z,
      duration: 0.8, ease: 'power2.in',
      onUpdate: () => camera.lookAt(targetPos.x, targetPos.y, targetPos.z),
    });

    tl.to(camera.position, {
      x: closeUpEnd.x * 0.97, y: closeUpEnd.y - 0.4, z: closeUpEnd.z * 0.97,
      duration: 0.65, ease: 'power1.out',
      onUpdate: () => camera.lookAt(targetPos.x, targetPos.y, targetPos.z),
    });

    activeTl.current = tl;
    return () => { tl.kill(); isAnimating.current = false; };
  }, [travelTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset camera ─────────────────────────────────────────────────────────
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
