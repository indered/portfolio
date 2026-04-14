import { useState, useEffect } from 'react';
import styles from './StatsSection.module.scss';

const ROUTE_NAMES = {
  '/about': 'Personal', '/work': 'Work', '/connect': 'Connect',
  '/runner': 'Runner', '/ventures': 'Ventures', '/thoughts': 'Thinker',
};

function Stat({ label, value, sub }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}

function Bar({ label, count, max, hot }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className={styles.bar}>
      <span className={styles.barLabel}>{label} {hot && <span className={styles.hotBadge}>HOT</span>}</span>
      <div className={styles.barTrack}>
        <div className={`${styles.barFill} ${hot ? styles.barFillHot : ''}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.barCount}>{count}</span>
    </div>
  );
}

export default function StatsSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  useEffect(() => {
    fetch('/api/analytics/stats')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
    const interval = setInterval(() => {
      fetch('/api/analytics/stats').then(r => r.json()).then(setData).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading stats...</p></div>;
  if (!data) return <div className={styles.page}><p className={styles.loading}>Stats unavailable</p></div>;

  const maxPlanet = Math.max(...(data.planetPopularity?.map(p => p.count) || [1]));
  const maxCountry = Math.max(...(data.topCountries?.map(c => c.count) || [1]));
  const maxPlanetTime = Math.max(...(data.planetTime?.map(p => p.avg) || [1]));
  const hotPlanet = data.planetPopularity?.[0]?._id;

  return (
    <div className={styles.page} role="main">

      <h2 className={styles.title}>Stats</h2>
      <p className={styles.subtitle}>Last 30 days. Auto-refreshes every 30s.</p>

      {/* Overview */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Overview</h3>
        <div className={styles.statGrid}>
          <Stat label="Today" value={data.todaySessions} />
          <Stat label="This week" value={data.weekSessions} />
          <Stat label="30 days" value={data.totalSessions} />
          <Stat label="Avg session" value={`${data.avgDuration}s`} />
          <Stat label="Total page views" value={data.totalPageViews?.toLocaleString() || 0} />
          <Stat label="Hub bounce rate" value={`${data.hubBounceRate}%`} sub="Left without clicking a planet" />
          <Stat label="Return visitors" value={`${data.returnVisitorRate || 0}%`} />
          <Stat label="Resume downloads" value={data.resumeDownloads || 0} />
          <Stat label="LinkedIn clicks" value={data.linkedInClicks || 0} />
        </div>
      </section>

      {/* Planet popularity */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Planet Clicks</h3>
        <div className={styles.bars}>
          {(data.planetPopularity || []).map(p => (
            <Bar key={p._id} label={ROUTE_NAMES[p._id] || p._id} count={p.count} max={maxPlanet} hot={p._id === hotPlanet} />
          ))}
          {(!data.planetPopularity?.length) && <p className={styles.empty}>No planet clicks yet</p>}
        </div>
      </section>

      {/* Time per planet */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Avg Time per Planet</h3>
        <div className={styles.bars}>
          {(data.planetTime || []).map(p => (
            <Bar key={p._id} label={ROUTE_NAMES[p._id] || p._id} count={`${Math.round(p.avg)}s`} max={1} />
          ))}
          {(!data.planetTime?.length) && <p className={styles.empty}>No time data yet</p>}
        </div>
      </section>

      {/* Speed run */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Speed Run Record</h3>
        <p className={styles.funText}>
          {data.speedRunRecord ? `Fastest to visit all 6 planets: ${data.speedRunRecord}s` : 'Nobody has visited all 6 planets in one session yet'}
        </p>
      </section>

      {/* Top countries */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Top Locations</h3>
        <div className={styles.bars}>
          {(data.topCountries || []).map(c => (
            <Bar key={c._id} label={c._id} count={c.count} max={maxCountry} />
          ))}
          {(!data.topCountries?.length) && <p className={styles.empty}>No location data yet</p>}
        </div>
      </section>

      {/* Devices */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Devices</h3>
        <div className={styles.statGrid}>
          {(data.deviceSplit || []).map(d => (
            <Stat key={d._id} label={d._id} value={d.count} />
          ))}
        </div>
      </section>

      {/* Peak hours */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Visit Hours (UTC)</h3>
        <div className={styles.peakGrid}>
          <Stat label="Night Owls (10pm-6am)" value={data.nightOwls || 0} />
          <Stat label="Early Birds (6am-12pm)" value={data.earlyBirds || 0} />
          <Stat label="Afternoon (12pm-6pm)" value={data.afternoon || 0} />
          <Stat label="Evening (6pm-10pm)" value={data.evening || 0} />
        </div>
      </section>

      {/* Referrers */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Referrers</h3>
        <div className={styles.bars}>
          {(data.topReferrers || []).map(r => (
            <Bar key={r._id} label={r._id} count={r.count} max={data.topReferrers[0]?.count || 1} />
          ))}
          {(!data.topReferrers?.length) && <p className={styles.empty}>No referrer data yet</p>}
        </div>
      </section>

      {/* Daily visits */}
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

      {/* Scroll distance */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Fun</h3>
        <div className={styles.statGrid}>
          <Stat label="Scroll distance" value={`${data.scrollDistanceKm || 0} km`} sub="Total pixels scrolled by all visitors" />
          <Stat label="Stars clicked" value={data.starsDiscovered || 0} sub="Clicking the sky in solar system" />
        </div>
      </section>

    </div>
  );
}
