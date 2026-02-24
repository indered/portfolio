import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'mahesh-music-muted';
const AUDIO_SRC = '/audio/ambient.mp3';
const FADE_DURATION = 3000; // ms
const TARGET_VOLUME = 0.25;

export default function useAmbientMusic() {
  const audioRef   = useRef(null);
  const fadeRafRef = useRef(null);
  const playingRef = useRef(false); // guards against concurrent play calls

  const [isMuted,     setIsMuted]     = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isAvailable, setIsAvailable] = useState(true); // false if file missing/unloadable

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.src = AUDIO_SRC;
    audio.preload = 'none';
    audio.loop = true;
    audio.volume = 0;
    try { audio.muted = localStorage.getItem(STORAGE_KEY) === 'true'; } catch { audio.muted = false; }

    // Mark unavailable if the file 404s or has a media error
    audio.addEventListener('error', () => {
      setIsAvailable(false);
      playingRef.current = false;
      console.info(
        '[Music] No audio file at /audio/ambient.mp3 — drop an mp3 into client/public/audio/ to enable music.'
      );
    });

    audioRef.current = audio;

    return () => {
      if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const startTime   = performance.now();
    const startVolume = audio.volume;
    if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      audio.volume   = startVolume + (TARGET_VOLUME - startVolume) * eased;
      if (progress < 1) fadeRafRef.current = requestAnimationFrame(tick);
      else fadeRafRef.current = null;
    }
    fadeRafRef.current = requestAnimationFrame(tick);
  }, []);

  // Returns true on success — caller uses this to decide whether to keep listeners
  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || playingRef.current) return false;
    playingRef.current = true;

    try {
      audio.load();
      await audio.play();
      setIsPlaying(true);
      if (!audio.muted) fadeIn();
      else audio.volume = TARGET_VOLUME;
      return true;
    } catch (err) {
      // Reset so next interaction retries
      playingRef.current = false;
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        console.warn('[Music] Playback failed:', err.message);
      }
      return false;
    }
  }, [fadeIn]);

  // Detach listeners only after a SUCCESSFUL play — previously they were removed
  // synchronously before the async play resolved, making retries impossible.
  useEffect(() => {
    const events = ['click', 'keydown', 'touchstart'];

    function handleInteraction() {
      startPlayback().then((success) => {
        if (success) {
          events.forEach((e) => window.removeEventListener(e, handleInteraction));
        }
        // On failure: listeners stay attached so next interaction retries
      });
    }

    events.forEach((e) =>
      window.addEventListener(e, handleInteraction, { passive: true })
    );
    return () => events.forEach((e) => window.removeEventListener(e, handleInteraction));
  }, [startPlayback]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    if (!next && audio.volume === 0) audio.volume = TARGET_VOLUME;
    setIsMuted(next);
    try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
  }, []);

  return { isMuted, toggleMute, isPlaying, isAvailable };
}
