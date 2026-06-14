import { useCallback, useEffect, useState } from 'react';
import useSEO from '../../hooks/useSEO';
import styles from './VideoStatsPage.module.scss';

const PIN_STORAGE_KEY = 'video_stats_pin';

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

function MetricCard({ label, value, hint }) {
  return (
    <div className={styles.metricCard}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
      {hint ? <span className={styles.metricHint}>{hint}</span> : null}
    </div>
  );
}

function BarList({ items, empty }) {
  const max = Math.max(...(items?.map((item) => item.count) || [1]));

  if (!items?.length) {
    return <p className={styles.empty}>{empty}</p>;
  }

  return (
    <div className={styles.barList}>
      {items.map((item) => (
        <div key={item.label} className={styles.barRow}>
          <span className={styles.barLabel}>{item.label}</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <span className={styles.barCount}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function MiniBars({ items, empty }) {
  const max = Math.max(...(items?.map((item) => item.count) || [1]));

  if (!items?.length) {
    return <p className={styles.empty}>{empty}</p>;
  }

  return (
    <div className={styles.miniBars}>
      {items.map((item) => (
        <div key={item.label} className={styles.miniBarItem}>
          <div className={styles.miniBarCol}>
            <div
              className={styles.miniBarFill}
              style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }}
            />
          </div>
          <span className={styles.miniBarLabel}>{item.shortLabel || item.label}</span>
          <span className={styles.miniBarCount}>{item.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function VideoStatsPage() {
  useSEO('video-stats');
  useNoIndex();

  const [pin, setPin] = useState(() => sessionStorage.getItem(PIN_STORAGE_KEY) || '');
  const [pinInput, setPinInput] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const authenticated = Boolean(pin);

  const fetchStats = useCallback(async (providedPin) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analytics/video-stats?slug=waterlily-video', {
        headers: { 'x-pin': providedPin },
      });
      if (response.status === 401) {
        sessionStorage.removeItem(PIN_STORAGE_KEY);
        setPin('');
        throw new Error('Wrong PIN.');
      }
      if (!response.ok) {
        throw new Error('Stats are unavailable right now.');
      }
      const payload = await response.json();
      setData(payload);
      sessionStorage.setItem(PIN_STORAGE_KEY, providedPin);
      setPin(providedPin);
    } catch (err) {
      setError(err.message || 'Could not load stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pin) return undefined;
    fetchStats(pin);
    const interval = window.setInterval(() => fetchStats(pin), 30000);
    return () => window.clearInterval(interval);
  }, [fetchStats, pin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!pinInput.trim()) {
      setError('Enter the PIN first.');
      return;
    }
    await fetchStats(pinInput.trim());
  };

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <section className={styles.gate}>
          <p className={styles.eyebrow}>Private analytics</p>
          <h1 className={styles.title}>Waterlily video stats</h1>
          <p className={styles.subtitle}>
            This page is just for you. Use the same PIN as your private inbox and assistant view.
          </p>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.pinInput}
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pinInput}
              onChange={(event) => setPinInput(event.target.value)}
              placeholder="Enter PIN"
            />
            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'Open stats'}
            </button>
          </form>
          {error ? <p className={styles.error}>{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Private analytics</p>
          <h1 className={styles.title}>Waterlily video stats</h1>
          <p className={styles.subtitle}>
            Last {data?.windowDays || 90} days, auto-refreshing every 30 seconds.
          </p>
        </div>
        <button
          className={styles.ghostButton}
          type="button"
          onClick={() => {
            sessionStorage.removeItem(PIN_STORAGE_KEY);
            setPin('');
            setPinInput('');
            setData(null);
          }}
        >
          Lock
        </button>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}

      {!data && loading ? <p className={styles.loading}>Loading stats...</p> : null}

      {data ? (
        <>
          <section className={styles.metricGrid}>
            <MetricCard label="Page visits" value={data.pageViews} hint={`${data.uniquePageSessions} unique sessions`} />
            <MetricCard label="Plays" value={data.totalPlays} hint={`${data.uniquePlaySessions} play sessions`} />
            <MetricCard label="Unique viewers" value={data.uniqueViewers} />
            <MetricCard label="Current likes" value={data.currentLikes} hint={`${data.uniqueLikeSessions} like sessions`} />
            <MetricCard label="Like toggles" value={data.totalLikeToggles} hint={data.lastLikeAgo || 'No likes yet'} />
            <MetricCard label="Last view" value={data.lastViewAgo || 'No views yet'} />
            <MetricCard label="Play rate" value={`${data.playRate}%`} hint="Sessions that pressed play" />
            <MetricCard label="Completion rate" value={`${data.completionRate}%`} hint="Play sessions that finished" />
            <MetricCard label="Last play" value={data.lastPlayAgo || 'No plays yet'} />
          </section>

          <section className={styles.panelGrid}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>View countries</h2>
              <BarList items={data.topViewCountries} empty="No country data yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>View cities</h2>
              <BarList items={data.topViewCities} empty="No city data yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Play countries</h2>
              <BarList items={data.topPlayCountries} empty="No play location data yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Play cities</h2>
              <BarList items={data.topPlayCities} empty="No play city data yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Daily views</h2>
              <MiniBars items={data.dailyViews} empty="No view history yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>View hours</h2>
              <MiniBars items={data.hourlyViews} empty="No hourly view data yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Progress milestones</h2>
              <BarList items={data.progressMilestones} empty="Nobody has crossed a milestone yet." />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Referrers</h2>
              <BarList items={data.topReferrers} empty="No referrers recorded yet." />
            </section>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Recent views</h2>
            {data.recentViews?.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Referrer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentViews.map((view) => (
                      <tr key={view.id}>
                        <td>{view.when}</td>
                        <td>{view.location}</td>
                        <td>{view.device}</td>
                        <td>{view.referrer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>No views yet.</p>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Recent plays</h2>
            {data.recentPlays?.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Referrer</th>
                      <th>Started at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentPlays.map((play) => (
                      <tr key={play.id}>
                        <td>{play.when}</td>
                        <td>{play.location}</td>
                        <td>{play.device}</td>
                        <td>{play.referrer}</td>
                        <td>{play.startedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>No plays yet.</p>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Recent likes</h2>
            {data.recentLikes?.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLikes.map((like) => (
                      <tr key={like.id}>
                        <td>{like.when}</td>
                        <td>{like.location}</td>
                        <td>{like.device}</td>
                        <td>{like.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.empty}>No like activity yet.</p>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
