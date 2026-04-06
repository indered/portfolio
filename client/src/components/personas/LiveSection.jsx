import { useState, useEffect } from 'react';
import styles from './LiveSection.module.scss';

const PLANET_NAMES = {
  '/architect': 'The Architect',
  '/runner': 'The Long Run',
  '/ventures': 'Ventures',
  '/connect': 'Connect',
  '/thoughts': 'The Thinker',
  '/about': 'Personal',
};

const DEVICE_VIBE = {
  desktop: 'Proper sit-down-and-browse types',
  mobile: 'Scrolling in bed or on the bus',
  tablet: 'The rare iPad connoisseur',
};

export default function LiveSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className={styles.page}><p className={styles.loading}>Crunching numbers...</p></div>;
  if (!data) return <div className={styles.page}><p className={styles.loading}>Stats unavailable</p></div>;

  const topVisitor = data.nightOwls > data.earlyBirds ? 'Night Owls' : 'Early Birds';

  return (
    <div className={styles.page} role="main">

      <h2 className={styles.title}>Live</h2>
      <p className={styles.subtitle}>What's happening on this solar system</p>

      {/* Big numbers */}
      <div className={styles.bigNumbers}>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.totalPageViews.toLocaleString()}</span>
          <span className={styles.bigLabel}>Pages explored</span>
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{(data.planetPopularity || []).reduce((s, p) => s + p.count, 0).toLocaleString()}</span>
          <span className={styles.bigLabel}>Planet clicks</span>
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.resumeDownloads}</span>
          <span className={styles.bigLabel}>Resume downloads</span>
          <span className={styles.bigSub}>{data.resumeDownloads > 0 ? 'Someone out there is hiring' : 'Still waiting for the first one'}</span>
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.linkedInClicks}</span>
          <span className={styles.bigLabel}>LinkedIn clicks</span>
        </div>
      </div>

      {/* Speed run */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Speed Run Record</h3>
        {data.speedRunRecord ? (
          <p className={styles.funFact}>
            Someone visited all 6 planets in <strong>{data.speedRunRecord}s</strong>. Can you beat it?
          </p>
        ) : (
          <p className={styles.funFact}>
            Nobody has visited all 6 planets in one session yet. Be the first.
          </p>
        )}
      </div>

      {/* Time per planet */}
      {data.planetTime?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Where People Spend Time</h3>
          <div className={styles.planetBars}>
            {data.planetTime.map(p => (
              <div key={p._id} className={styles.planetBar}>
                <span className={styles.planetName}>{PLANET_NAMES[p._id] || p._id}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(p.avg / Math.max(...data.planetTime.map(x => x.avg))) * 100}%` }}
                  />
                </div>
                <span className={styles.planetTime}>{Math.round(p.avg)}s avg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Night owls vs early birds */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>When Do People Visit?</h3>
        <div className={styles.timeGrid}>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>🌙</span>
            <span className={styles.timeValue}>{data.nightOwls}</span>
            <span className={styles.timeLabel}>Night Owls</span>
            <span className={styles.timeSub}>10pm - 6am</span>
          </div>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>🌅</span>
            <span className={styles.timeValue}>{data.earlyBirds}</span>
            <span className={styles.timeLabel}>Early Birds</span>
            <span className={styles.timeSub}>6am - 12pm</span>
          </div>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>☀️</span>
            <span className={styles.timeValue}>{data.afternoon}</span>
            <span className={styles.timeLabel}>Afternoon</span>
            <span className={styles.timeSub}>12pm - 6pm</span>
          </div>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>🌆</span>
            <span className={styles.timeValue}>{data.evening}</span>
            <span className={styles.timeLabel}>Evening</span>
            <span className={styles.timeSub}>6pm - 10pm</span>
          </div>
        </div>
        <p className={styles.funFact}>Most visitors are <strong>{topVisitor}</strong>.</p>
      </div>

      {/* Devices */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Devices</h3>
        <div className={styles.deviceList}>
          {(data.devicePersonality || []).map(d => (
            <div key={d._id} className={styles.deviceRow}>
              <span className={styles.deviceName}>{d._id}</span>
              <span className={styles.deviceCount}>{d.count}</span>
              <span className={styles.deviceVibe}>{DEVICE_VIBE[d._id] || ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Return visitors */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Return Visitors</h3>
        <p className={styles.funFact}>
          <strong>{data.returnVisitorRate}%</strong> of visitors come back.
          {data.returnVisitorRate > 30 ? ' The solar system is addictive.' : ' Working on making it stickier.'}
        </p>
      </div>

      {/* Scroll distance */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Total Scroll Distance</h3>
        <p className={styles.funFact}>
          Visitors have collectively scrolled <strong>{data.scrollDistanceKm} km</strong>.
          {parseFloat(data.scrollDistanceKm) > 1 ? " That's a real journey." : ' Just getting started.'}
        </p>
      </div>

    </div>
  );
}
