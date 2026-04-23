// Enriches IP → { city, region, org, asn } via ipinfo.io's free tier
// (50k requests/month, no API key required for basic fields).
// Results are cached in-process for 24h so we don't burn quota on
// repeat visitors in the same session.

const CACHE = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 2000;

function trimCache() {
  if (CACHE.size <= MAX_CACHE) return;
  // Drop the oldest 25% when we overflow
  const drop = Math.floor(MAX_CACHE * 0.25);
  const keys = Array.from(CACHE.keys()).slice(0, drop);
  keys.forEach((k) => CACHE.delete(k));
}

function isPrivate(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) return true;
  if (ip.startsWith('fc00:') || ip.startsWith('fe80:')) return true;
  return false;
}

export async function lookupIp(ip) {
  if (!ip || isPrivate(ip)) return null;

  const cached = CACHE.get(ip);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.data;

  try {
    // AbortController so a slow lookup never blocks the analytics request
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`https://ipinfo.io/${ip}/json`, { signal: ctrl.signal });
    clearTimeout(t);

    if (!res.ok) return null;
    const raw = await res.json();

    // Normalize to the fields we care about. org looks like "AS15169 Google LLC"
    const org = typeof raw.org === 'string' ? raw.org : null;
    let asn = null;
    let company = null;
    if (org) {
      const m = org.match(/^(AS\d+)\s+(.+)$/);
      if (m) { asn = m[1]; company = m[2]; }
      else { company = org; }
    }

    const data = {
      city: raw.city || null,
      region: raw.region || null,
      postal: raw.postal || null,
      country: raw.country || null,
      asn,
      company,
      timezone: raw.timezone || null,
    };

    CACHE.set(ip, { data, ts: Date.now() });
    trimCache();
    return data;
  } catch {
    return null;
  }
}
