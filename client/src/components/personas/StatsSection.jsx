import { useState, useEffect } from 'react';
import styles from './StatsSection.module.scss';

function Stat({ label, value, sub }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}

function Bar({ label, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className={styles.bar}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.barCount}>{count}</span>
    </div>
  );
}

export default function StatsSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Force light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  useEffect(() => {
    fetch('/api/analytics/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    // Auto-refresh every 30s
    const interval = setInterval(() => {
      fetch('/api/analytics/stats').then(r => r.json()).then(setData).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading stats...</p></div>;
  if (!data) return <div className={styles.page}><p className={styles.loading}>Stats unavailable</p></div>;

  const maxPlanet = Math.max(...(data.planetPopularity?.map(p => p.count) || [1]));
  const maxCountry = Math.max(...(data.topCountries?.map(c => c.count) || [1]));

  return (
    <div className={styles.page} role="main">

      <h2 className={styles.title}>Stats</h2>
      <p className={styles.subtitle}>Last 30 days. Auto-refreshes every 30s.</p>

      {/* Overview */}
      <section className={styles.section}>
        <div className={styles.statGrid}>
          <Stat label="Today" value={data.todaySessions} />
          <Stat label="This week" value={data.weekSessions} />
          <Stat label="30 days" value={data.totalSessions} />
          <Stat label="Avg duration" value={`${data.avgDuration}s`} />
          <Stat label="Hub bounce" value={`${data.hubBounceRate}%`} sub="Left without clicking a planet" />
        </div>
      </section>

      {/* Planet popularity */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Planet Clicks</h3>
        <div className={styles.bars}>
          {(data.planetPopularity || []).map(p => (
            <Bar key={p._id} label={p._id || 'unknown'} count={p.count} max={maxPlanet} />
          ))}
          {(!data.planetPopularity || data.planetPopularity.length === 0) && (
            <p className={styles.empty}>No planet clicks yet</p>
          )}
        </div>
      </section>

      {/* Top countries */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Top Locations</h3>
        <div className={styles.bars}>
          {(data.topCountries || []).map(c => (
            <Bar key={c._id} label={c._id} count={c.count} max={maxCountry} />
          ))}
          {(!data.topCountries || data.topCountries.length === 0) && (
            <p className={styles.empty}>No location data yet</p>
          )}
        </div>
      </section>

      {/* Device split */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Devices</h3>
        <div className={styles.statGrid}>
          {(data.deviceSplit || []).map(d => (
            <Stat key={d._id} label={d._id} value={d.count} />
          ))}
        </div>
      </section>

      {/* Referrers */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Referrers</h3>
        <div className={styles.bars}>
          {(data.topReferrers || []).map(r => (
            <Bar key={r._id} label={r._id} count={r.count} max={data.topReferrers[0]?.count || 1} />
          ))}
          {(!data.topReferrers || data.topReferrers.length === 0) && (
            <p className={styles.empty}>No referrer data yet</p>
          )}
        </div>
      </section>

      {/* Daily visits chart */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Daily Visits (7 days)</h3>
        <div className={styles.dailyChart}>
          {(data.dailyVisits || []).map(d => (
            <div key={d._id} className={styles.dailyBar}>
              <div
                className={styles.dailyFill}
                style={{ height: `${Math.max(4, (d.count / Math.max(...data.dailyVisits.map(v => v.count), 1)) * 100)}%` }}
              />
              <span className={styles.dailyLabel}>{d._id.slice(5)}</span>
              <span className={styles.dailyCount}>{d.count}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
