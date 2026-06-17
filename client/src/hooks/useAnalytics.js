import { useEffect, useRef, useCallback } from 'react';
import { getFingerprint } from '../lib/fingerprint';

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

function normalizeSourceToken(value) {
  if (!value) return null;
  const token = String(value).trim().toLowerCase().replace(/^[-_]+/, '');
  if (!token) return null;
  if (token.includes('instagram.com') || token.includes('instagr.am') || ['ig', 'instagram', 'insta'].includes(token)) return 'ig';
  if (token.includes('linkedin.com') || ['linkedin', 'li'].includes(token)) return 'linkedin';
  if (token.includes('wellfound.com') || token.includes('angel.co') || ['wellfound', 'angel', 'angellist', 'wf'].includes(token)) return 'wellfound';
  if (token.includes('github.com') || ['github', 'gh'].includes(token)) return 'github';
  if (token.includes('youtube.com') || token.includes('youtu.be') || ['youtube', 'yt'].includes(token)) return 'youtube';
  if (token.includes('google.') || ['google', 'g'].includes(token)) return 'google';
  if (['direct', 'none', 'organic'].includes(token)) return 'direct';
  if (['internal', 'site', 'self'].includes(token)) return 'internal';
  return token.replace(/\s+/g, '-');
}

function getSourceFromReferrer() {
  const ref = getReferrer();
  if (!ref) return 'direct';

  try {
    const host = ref.toLowerCase().replace(/^www\./, '');
    const siteHost = window.location.hostname.toLowerCase().replace(/^www\./, '');
    if (host === siteHost || host.endsWith(`.${siteHost}`)) return 'internal';
    if (host.includes('instagram.com') || host === 'instagr.am') return 'ig';
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('wellfound.com') || host.includes('angel.co')) return 'wellfound';
    if (host.includes('github.com')) return 'github';
    if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube';
    if (host.includes('google.')) return 'google';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    return host.split('.')[0] || 'other';
  } catch {
    return 'other';
  }
}

function isReturnVisitor() {
  const key = '_rv';
  if (localStorage.getItem(key)) return true;
  localStorage.setItem(key, '1');
  return false;
}

// Capture UTM params from the landing URL once, attach to every event in the session.
// Persists in sessionStorage so events fired after navigation still carry the source.
function captureUtm() {
  try {
    const cached = sessionStorage.getItem('_utm');
    if (cached) return JSON.parse(cached);
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get('utm_source') || null,
      medium: params.get('utm_medium') || null,
      campaign: params.get('utm_campaign') || null,
    };
    sessionStorage.setItem('_utm', JSON.stringify(utm));
    return utm;
  } catch {
    return { source: null, medium: null, campaign: null };
  }
}

function captureSource() {
  try {
    const cached = sessionStorage.getItem('_src');
    if (cached) return cached;

    const params = new URLSearchParams(window.location.search);
    const explicit = params.get('src') || params.get('source') || params.get('via') || params.get('utm_source');
    const source = normalizeSourceToken(explicit) || getSourceFromReferrer() || 'direct';
    sessionStorage.setItem('_src', source);
    return source;
  } catch {
    return 'direct';
  }
}

function send(data) {
  const utm = captureUtm();
  const meta = { ...(data.meta || {}) };
  // Merge UTM into meta so existing server schema works unchanged.
  if (utm.source)   meta.utm_source   = utm.source;
  if (utm.medium)   meta.utm_medium   = utm.medium;
  if (utm.campaign) meta.utm_campaign = utm.campaign;

  const payload = JSON.stringify({
    ...data,
    meta: Object.keys(meta).length ? meta : undefined,
    sessionId: getSessionId(),
    device: getDevice(),
    source: captureSource(),
    fingerprint: getFingerprint(),
    referrer: data.referrer !== undefined ? data.referrer : getReferrer(),
    returnVisitor: isReturnVisitor(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(API, new Blob([payload], { type: 'application/json' }));
  } else {
    fetch(API, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  }
}

// ── Public tracking functions ────────────────

export function trackPageView(route) {
  send({ type: 'page_view', route });
}

export function trackEvent(type, data = {}) {
  send({ type, ...data });
}

export function trackPlanetClick(planet) {
  send({ type: 'planet_click', planet });
}

export function trackResumeDownload() {
  send({ type: 'resume_download' });
}

export function trackLinkClick(label, url) {
  send({ type: 'link_click', meta: { label, url } });
}

export function trackStarClick() {
  send({ type: 'star_click' });
}

// Ask-page funnel events. Keep type namespaced so server aggregations
// can group and filter cleanly. Meta carries the specific context.
export function trackAskEvent(name, meta = {}) {
  send({ type: `ask_${name}`, route: '/ask', meta });
}

// ── Main hook ────────────────────────────────

export function useAnalytics(route) {
  const startTime = useRef(Date.now());
  const planetEnterTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const prevRoute = useRef(null);

  // Track page view on route change
  useEffect(() => {
    // Send time_per_planet for the previous route
    if (prevRoute.current && prevRoute.current !== route) {
      const duration = Math.round((Date.now() - planetEnterTime.current) / 1000);
      if (duration > 0) {
        send({ type: 'time_per_planet', route: prevRoute.current, duration });
      }
    }

    trackPageView(route || window.location.pathname);
    planetEnterTime.current = Date.now();
    maxScroll.current = 0;
    prevRoute.current = route;
  }, [route]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.round((scrollTop / docHeight) * 100);
        if (pct > maxScroll.current) maxScroll.current = pct;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track session end + scroll depth + time on last planet
  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      send({ type: 'session_end', duration, meta: { scrollDepth: maxScroll.current } });

      // Send time for last planet
      if (prevRoute.current) {
        const planetDuration = Math.round((Date.now() - planetEnterTime.current) / 1000);
        if (planetDuration > 0) {
          send({ type: 'time_per_planet', route: prevRoute.current, duration: planetDuration });
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Track planets visited in session for speed run
  useEffect(() => {
    const visited = JSON.parse(sessionStorage.getItem('_planets') || '[]');
    if (route && route !== '/' && !visited.includes(route)) {
      visited.push(route);
      sessionStorage.setItem('_planets', JSON.stringify(visited));

      // If all 6 planets visited, record speed run
      if (visited.length >= 6) {
        const totalTime = Math.round((Date.now() - startTime.current) / 1000);
        send({ type: 'speed_run', duration: totalTime });
      }
    }
  }, [route]);
}

export default useAnalytics;
