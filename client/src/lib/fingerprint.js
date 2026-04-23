// Silent device fingerprint — stable hash of non-sensitive browser props.
// Deliberately avoids canvas/audio/WebGL probes (those trip Brave/Safari/Firefox
// anti-tracking warnings). Less unique than full fingerprinting but zero
// privacy flags. Good enough to group returning visitors at portfolio scale.

const STORAGE_KEY = '_dfp';

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function collect() {
  const s = [
    navigator.userAgent || '',
    navigator.language || '',
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    `${window.devicePixelRatio || 1}`,
    navigator.hardwareConcurrency || 0,
    navigator.platform || '',
    (navigator.languages || []).join(','),
  ].join('|');
  return hash(s);
}

export function getFingerprint() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached && /^[0-9a-f]{8}$/.test(cached)) return cached;
    const fp = collect();
    localStorage.setItem(STORAGE_KEY, fp);
    return fp;
  } catch {
    return collect();
  }
}
