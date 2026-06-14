import { useEffect, useMemo, useRef, useState } from 'react';
import useSEO from '../../hooks/useSEO';
import useAnalytics, { trackEvent, trackLinkClick, trackResumeDownload } from '../../hooks/useAnalytics';
import styles from './WaterlilyVideoPage.module.scss';

const VIDEO_ID = 'bO1RiUzx4Mc';
const VIDEO_ROUTE = '/waterlily-video';
const VIDEO_SLUG = 'waterlily-video';
const MILESTONES = [25, 50, 75, 95];
const LIKE_STORAGE_KEY = 'waterlily_video_liked';

const TOP_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Work', href: '/work' },
  { label: 'Ask', href: '/ask' },
];

const QUICK_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mahesh-inder/', external: true, analytics: 'linkedin' },
  { label: 'Paperwork', href: '/resume', analytics: 'resume' },
  { label: 'GitHub', href: 'https://github.com/indered', external: true, analytics: 'github' },
];

const QUICK_LINKS_TITLE = 'Quick links';

const MORE_LINKS = [
  { label: 'Paperwork', href: '/resume', analytics: 'resume' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mahesh-inder/', external: true, analytics: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/indered', external: true, analytics: 'github' },
];

const QUESTIONS = [
  {
    title: '1) Where are you located?',
    detail: 'We are a remote first company so almost anywhere in the world is fine.',
  },
  {
    title: '2) What are your salary expectations?',
    detail: 'Either in your local currency (let us know what it is) or in US dollars.',
  },
  {
    title: '3) Starting with your most recent role and working backwards, for each position:',
    bullets: [
      'What attracted you to that role?',
      'What was your most significant contribution? Describe it in detail as if explaining to someone outside the tech industry who is genuinely interested in understanding your work.',
      'What was the fastest that you had to, or were able to, ship something? How did it go?',
      'What was the hardest thing you learned in your role there? This can be a technical or non-technical learning.',
    ],
  },
  {
    title: '4) Engineering Philosophy:',
    bullets: [
      'What strongly-held views do you have about engineering or product development that others might disagree with?',
      'What experiences led you to hold these opinions?',
      'What would convince you to change your mind?',
    ],
  },
  {
    title: '5) Looking Forward:',
    bullets: [
      'What are you looking for in your next role?',
      'Why are you interested in Waterlily and how does it align with what you are seeking?',
      'What potential concerns do you have about fit - either Waterlily’s fit for you or your fit for Waterlily?',
      'What questions do you have for us?',
    ],
  },
];

function IconHeart({ filled = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-6.716-4.293-9.192-8.154C.994 10.019 1.667 5.8 5.235 4.43c2.14-.821 4.24-.231 5.58 1.557C12.154 4.2 14.254 3.61 16.394 4.43c3.568 1.37 4.241 5.589 2.427 8.416C18.716 13.01 12 21 12 21Z" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function QuestionBlock({ item }) {
  return (
    <li className={styles.questionBlock}>
      <h2 className={styles.questionTitle}>{item.title}</h2>
      {item.detail ? <p className={styles.questionDetail}>{item.detail}</p> : null}
      {item.bullets ? (
        <ul className={styles.questionBullets}>
          {item.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (window.__ytIframeApiPromise) return window.__ytIframeApiPromise;

  window.__ytIframeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };

    const existing = document.querySelector('script[data-youtube-iframe-api]');
    if (existing) return;

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.setAttribute('data-youtube-iframe-api', 'true');
    script.onerror = () => reject(new Error('Could not load YouTube player.'));
    document.body.appendChild(script);
  });

  return window.__ytIframeApiPromise;
}

function useNoIndex() {
  useEffect(() => {
    let element = document.querySelector('meta[name="robots"]');
    const created = !element;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', 'robots');
      document.head.appendChild(element);
    }
    const previous = element.getAttribute('content');
    element.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (created) {
        element.remove();
      } else if (previous) {
        element.setAttribute('content', previous);
      } else {
        element.removeAttribute('content');
      }
    };
  }, []);
}

function SiteLink({ item, className, onClick }) {
  return (
    <a
      className={className}
      href={item.href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        if (item.analytics === 'resume') trackResumeDownload();
        if (item.analytics && item.analytics !== 'resume') trackLinkClick(item.label, item.href);
        onClick?.();
      }}
    >
      {item.label}
    </a>
  );
}

export default function WaterlilyVideoPage() {
  useSEO('waterlily-video');
  useAnalytics(VIDEO_ROUTE);
  useNoIndex();

  const playerHostId = useMemo(() => `youtube-player-${VIDEO_ID}`, []);
  const playerShellRef = useRef(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(LIKE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const lastPlaybackStateRef = useRef(-1);
  const trackedMilestonesRef = useRef(new Set());
  const hasTrackedImpressionRef = useRef(false);
  const moreRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadYouTubeApi()
      .then((YT) => {
        if (!isMounted) return;
        playerRef.current = new YT.Player(playerHostId, {
          videoId: VIDEO_ID,
          host: 'https://www.youtube.com',
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
            widget_referrer: `${window.location.origin}${window.location.pathname}`,
          },
          events: {
            onReady: () => {
              if (!isMounted) return;
              const iframe = playerShellRef.current?.querySelector('iframe');
              if (iframe) {
                iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
              }
              if (!hasTrackedImpressionRef.current) {
                hasTrackedImpressionRef.current = true;
                trackEvent('video_impression', {
                  route: VIDEO_ROUTE,
                  meta: { videoId: VIDEO_ID, videoSlug: VIDEO_SLUG },
                });
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              const YTState = window.YT?.PlayerState;
              const nextState = event.data;
              const currentSecond = Math.round(event.target.getCurrentTime?.() || 0);
              const totalSeconds = Math.round(event.target.getDuration?.() || 0);

              if (nextState === YTState?.PLAYING) {
                if (lastPlaybackStateRef.current === YTState?.ENDED || currentSecond <= 1) {
                  trackedMilestonesRef.current = new Set();
                }
                if (lastPlaybackStateRef.current !== YTState?.PLAYING) {
                  trackEvent('video_play', {
                    route: VIDEO_ROUTE,
                    meta: { videoId: VIDEO_ID, videoSlug: VIDEO_SLUG, currentSecond, totalSeconds },
                  });
                }
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = window.setInterval(() => {
                  const player = playerRef.current;
                  if (!player?.getDuration) return;
                  const durationSeconds = player.getDuration();
                  if (!durationSeconds) return;
                  const progress = Math.min(100, Math.round((player.getCurrentTime() / durationSeconds) * 100));
                  for (const milestone of MILESTONES) {
                    if (progress >= milestone && !trackedMilestonesRef.current.has(milestone)) {
                      trackedMilestonesRef.current.add(milestone);
                      trackEvent('video_progress', {
                        route: VIDEO_ROUTE,
                        meta: { videoId: VIDEO_ID, videoSlug: VIDEO_SLUG, milestone, progress },
                      });
                    }
                  }
                }, 1500);
              }

              if (nextState === YTState?.PAUSED) {
                clearInterval(progressTimerRef.current);
                if (lastPlaybackStateRef.current === YTState?.PLAYING) {
                  trackEvent('video_pause', {
                    route: VIDEO_ROUTE,
                    meta: { videoId: VIDEO_ID, videoSlug: VIDEO_SLUG, currentSecond, totalSeconds },
                  });
                }
              }

              if (nextState === YTState?.ENDED) {
                clearInterval(progressTimerRef.current);
                trackEvent('video_complete', {
                  route: VIDEO_ROUTE,
                  meta: { videoId: VIDEO_ID, videoSlug: VIDEO_SLUG, totalSeconds },
                });
              }

              lastPlaybackStateRef.current = nextState;
            },
            onError: (event) => {
              if (!isMounted) return;
              const message = event?.data === 153
                ? 'This browser is blocking the YouTube embed. Opening it on YouTube still works.'
                : 'The video did not load here. Opening it on YouTube still works.';
              setError(message);
            },
          },
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setError('The player could not load right now. The YouTube link still works.');
      });

    return () => {
      isMounted = false;
      clearInterval(progressTimerRef.current);
      playerRef.current?.destroy?.();
    };
  }, [playerHostId]);

  useEffect(() => {
    if (!moreOpen) return undefined;

    function handleOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [moreOpen]);

  const handleLikeToggle = () => {
    setLiked((current) => {
      const next = !current;
      try {
        localStorage.setItem(LIKE_STORAGE_KEY, next ? '1' : '0');
      } catch {}
      trackEvent('video_like_toggle', {
        route: VIDEO_ROUTE,
        meta: { videoId: VIDEO_ID, videoSlug: VIDEO_SLUG, liked: next },
      });
      return next;
    });
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>Waterlily interview video</h1>

      <div className={styles.frame}>
        <header className={styles.topbar}>
          <a href="/" target="_blank" rel="noreferrer" className={styles.logoLink} aria-label="Go home">
            <img src="/logo.svg" alt="Mahesh Inder" className={styles.logo} />
          </a>

          <div className={styles.topbarActions}>
            <nav className={styles.navPill} aria-label="Top links">
              {TOP_LINKS.map((item) => (
                <SiteLink key={item.label} item={item} className={styles.navLink} />
              ))}
            </nav>

            <div className={styles.moreWrap} ref={moreRef}>
              <button
                type="button"
                className={styles.moreButton}
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-label="Open more links"
              >
                <IconMore />
                <span>More</span>
              </button>

              {moreOpen ? (
                <div className={styles.moreMenu}>
                  {MORE_LINKS.map((item) => (
                    <SiteLink
                      key={item.label}
                      item={item}
                      className={styles.moreItem}
                      onClick={() => setMoreOpen(false)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className={styles.content}>
          <div className={styles.playerColumn}>
            <div className={styles.playerSurface}>
              <div className={styles.playerShell} ref={playerShellRef}>
                <div id={playerHostId} className={styles.playerHost} />
              </div>
            </div>

            <div className={styles.playerActions}>
              <button
                type="button"
                className={`${styles.likeButton} ${liked ? styles.likeButtonActive : ''}`}
                onClick={handleLikeToggle}
                aria-pressed={liked}
                aria-label={liked ? 'Unlike this video' : 'Like this video'}
                title={liked ? 'Unlike' : 'Like'}
              >
                <IconHeart filled={liked} />
              </button>
            </div>

              <div className={styles.quickLinks}>
                <p className={styles.quickLinksTitle}>{QUICK_LINKS_TITLE}</p>
                {QUICK_LINKS.map((item) => (
                  <SiteLink key={item.label} item={item} className={styles.quickLink} />
                ))}
              </div>

            {error ? (
              <div className={styles.playerNote}>
                <p>{error}</p>
                <a href={`https://youtu.be/${VIDEO_ID}`} target="_blank" rel="noreferrer" className={styles.youtubeLink}>
                  Open on YouTube
                </a>
              </div>
            ) : null}
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.infoCard}>
              <p className={styles.cardEyebrow}>Questions answered</p>
              <ul className={styles.questionList}>
                {QUESTIONS.map((question) => (
                  <QuestionBlock key={question.title} item={question} />
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
