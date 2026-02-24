import useAmbientMusic from '../../hooks/useAmbientMusic';
import styles from './MusicToggle.module.scss';

// ---- Inline SVG icons ----
// Using a single coordinated viewBox so both icons align identically.

function IconSoundOn({ isPlaying }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Speaker body */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

      {/* Sound waves — each gets the waveLine class for the pulse animation */}
      <line
        className={styles.waveLine}
        x1="15.54"
        y1="8.46"
        x2="15.54"
        y2="8.46"
        style={{ animationDelay: 'var(--wave-delay, 0s)' }}
      />
      <path
        className={styles.waveLine}
        d="M15.54 8.46a5 5 0 0 1 0 7.07"
        style={{ animationDelay: 'var(--wave-delay, 0.18s)' }}
      />
      <path
        className={styles.waveLine}
        d="M19.07 4.93a10 10 0 0 1 0 14.14"
        style={{ animationDelay: 'var(--wave-delay, 0.36s)' }}
      />
    </svg>
  );
}

function IconMuted() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Speaker body */}
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {/* Mute X */}
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// ---- Component ----

export default function MusicToggle() {
  const { isMuted, toggleMute, isPlaying, isAvailable } = useAmbientMusic();

  // Hide entirely when no audio file is present
  if (!isAvailable) return null;

  const isAnimating = isPlaying && !isMuted;
  const label = isMuted ? 'Unmute ambient music' : 'Mute ambient music';

  return (
    <div className={styles.wrapper}>
      <button
        className={[
          styles.button,
          isAnimating ? styles.playing : '',
          isMuted ? styles.muted : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={toggleMute}
        aria-label={label}
        title={label}
        type="button"
      >
        <span className={styles.icon}>
          {isMuted ? <IconMuted /> : <IconSoundOn isPlaying={isPlaying} />}
        </span>

        {/* Tooltip — visible on hover via CSS */}
        <span className={styles.tooltip} aria-hidden="true">
          Music by Scott Buckley &middot; CC BY 4.0
        </span>
      </button>
    </div>
  );
}
