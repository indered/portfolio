import { useState, useEffect } from 'react';
import styles from './LiveSection.module.scss';

function Stat({ label, value, sub }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}

export default function LiveSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
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

  if (loading) return <div className={styles.page}><p className={styles.loading}>Crunching numbers...</p></div>;
  if (!data) return <div className={styles.page}><p className={styles.loading}>Stats unavailable</p></div>;

  const maxDaily = Math.max(...(data.dailyVisits?.map((visit) => visit.count) || [1]));

  return (
    <div className={styles.page} role="main">
      <h2 className={styles.title}>Live</h2>
      <p className={styles.subtitle}>Public view of site activity. Updates every 30 seconds.</p>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Overview</h3>
        <div className={styles.statGrid}>
          <Stat label="Today" value={data.todaySessions} />
          <Stat label="This week" value={data.weekSessions} />
          <Stat label="30 days" value={data.totalSessions} />
          <Stat label="Avg session" value={`${data.avgDuration}s`} />
          <Stat label="Page views" value={data.totalPageViews?.toLocaleString() || 0} />
          <Stat label="Return visitors" value={`${data.returnVisitorRate || 0}%`} />
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
    </div>
  );
}
