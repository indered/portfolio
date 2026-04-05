import { useEffect, useRef } from 'react';

const API = '/api/analytics/event';

function getSessionId() {
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

function getDevice() {
  const w = window.innerWidth;
  if (w <= 480) return 'mobile';
  if (w <= 768) return 'tablet';
  return 'desktop';
}

function getReferrer() {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    const url = new URL(ref);
    if (url.hostname === window.location.hostname) return null;
    return url.hostname;
  } catch { return null; }
}

function send(data) {
  const payload = JSON.stringify({
    ...data,
    sessionId: getSessionId(),
    device: getDevice(),
    referrer: getReferrer(),
  });

  // Use sendBeacon for non-blocking, survives page unload
  if (navigator.sendBeacon) {
    navigator.sendBeacon(API, new Blob([payload], { type: 'application/json' }));
  } else {
    fetch(API, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  }
}

// Track page view
export function trackPageView(route) {
  send({ type: 'page_view', route });
}

// Track planet click
export function trackPlanetClick(planet) {
  send({ type: 'planet_click', planet });
}

// Hook: auto-tracks page view + session duration
export function useAnalytics(route) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    trackPageView(route || window.location.pathname);
  }, [route]);

  // Track session duration on unload
  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      send({ type: 'session_end', duration });
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
}

export default useAnalytics;
