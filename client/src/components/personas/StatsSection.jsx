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

function HistoryTable({ rows, empty }) {
  if (!rows?.length) return <p className={styles.empty}>{empty}</p>;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>When</th>
            <th>Area</th>
            <th>Source</th>
            <th>Route</th>
            <th>Pages</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.when}</td>
              <td>{row.area}</td>
              <td><span className={styles.sourceTag}>{row.source}</span></td>
              <td>{row.route}</td>
              <td>{row.pages}</td>
              <td>{row.device}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      .then((r) => {
        if (!r.ok) throw new Error('Stats unavailable');
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
    const interval = setInterval(() => {
      fetch('/api/analytics/stats')
        .then((r) => {
          if (!r.ok) throw new Error('Stats unavailable');
          return r.json();
        })
        .then(setData)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className={styles.page}><p className={styles.loading}>Loading stats...</p></div>;
  if (!data) return <div className={styles.page}><p className={styles.loading}>Stats unavailable</p></div>;

  const maxDaily = Math.max(...(data.dailyVisits?.map((visit) => visit.count) || [1]));
  const maxSource = Math.max(...(data.topSources?.map((item) => item.count) || [1]));
  const maxArea = Math.max(...(data.topAreas?.map((item) => item.count) || [1]));

  return (
    <div className={styles.page} role="main">
      <h2 className={styles.title}>Stats</h2>
      <p className={styles.subtitle}>Last 30 days. Auto-refreshes every 30s.</p>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Overview</h3>
        <div className={styles.statGrid}>
          <Stat label="Today" value={data.todaySessions} />
          <Stat label="This week" value={data.weekSessions} />
          <Stat label="30 days" value={data.totalSessions} />
          <Stat label="Avg session" value={`${data.avgDuration}s`} />
          <Stat label="Page views" value={data.totalPageViews?.toLocaleString() || 0} />
          <Stat label="Return visitors" value={`${data.returnVisitorRate || 0}%`} />
          <Stat label="Top source" value={data.topSources?.[0]?.label || 'direct'} sub={`${data.topSources?.[0]?.count || 0} visits`} />
          <Stat label="Top area" value={data.topAreas?.[0]?.label || 'Unknown'} sub={`${data.topAreas?.[0]?.count || 0} visits`} />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Daily visitors</h3>
        <div className={styles.dailyChart}>
          {(data.dailyVisits || []).map((visit) => (
            <div key={visit._id} className={styles.dailyBar}>
              <div
                className={styles.dailyFill}
                style={{ height: `${Math.max(4, (visit.count / maxDaily) * 100)}%` }}
              />
              <span className={styles.dailyLabel}>{visit._id.slice(5)}</span>
              <span className={styles.dailyCount}>{visit.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Sources</h3>
        <div className={styles.bars}>
          {(data.topSources || []).map((item) => (
            <Bar key={item.label} label={item.label} count={item.count} max={maxSource} />
          ))}
          {(!data.topSources?.length) && <p className={styles.empty}>No source data yet.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Areas</h3>
        <div className={styles.bars}>
          {(data.topAreas || []).map((item) => (
            <Bar key={item.label} label={item.label} count={item.count} max={maxArea} />
          ))}
          {(!data.topAreas?.length) && <p className={styles.empty}>No area data yet.</p>}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Visitor history</h3>
        <HistoryTable rows={data.recentVisitors} empty="No visitor history yet." />
      </section>
    </div>
  );
}
