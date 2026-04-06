import { useState, useEffect } from 'react';
import styles from './LiveSection.module.scss';

const ROUTE_NAMES = {
  '/architect': 'The Architect', '/runner': 'The Long Run', '/ventures': 'Ventures',
  '/connect': 'Connect', '/thoughts': 'The Thinker', '/about': 'Personal',
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
    document.documentElement.setAttribute('data-theme', 'dark');
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

  if (loading) return <div className={styles.page}><p className={styles.loading}>Crunching numbers...</p></div>;
  if (!data) return <div className={styles.page}><p className={styles.loading}>Stats unavailable</p></div>;

  const hotPlanet = data.planetPopularity?.[0];
  const totalClicks = (data.planetPopularity || []).reduce((s, p) => s + p.count, 0);
  const topVisitor = (data.nightOwls || 0) > (data.earlyBirds || 0) ? 'Night Owls' : 'Early Birds';

  return (
    <div className={styles.page} role="main">

      <h2 className={styles.title}>Live</h2>
      <p className={styles.subtitle}>What's happening on this solar system. Auto-refreshes.</p>

      {/* Big numbers */}
      <div className={styles.bigNumbers}>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.totalPageViews?.toLocaleString() || 0}</span>
          <span className={styles.bigLabel}>Pages explored</span>
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{totalClicks}</span>
          <span className={styles.bigLabel}>Planet clicks</span>
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.resumeDownloads || 0}</span>
          <span className={styles.bigLabel}>Resume downloads</span>
          <span className={styles.bigSub}>{data.resumeDownloads > 0 ? 'Someone out there is hiring' : 'Still waiting'}</span>
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.linkedInClicks || 0}</span>
          <span className={styles.bigLabel}>LinkedIn clicks</span>
        </div>
      </div>

      {/* Hot planet */}
      {hotPlanet && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Hottest Planet</h3>
          <div className={styles.hotPlanet}>
            <span className={styles.hotName}>{ROUTE_NAMES[hotPlanet._id] || hotPlanet._id}</span>
            <span className={styles.hotCount}>{hotPlanet.count} clicks</span>
          </div>
        </div>
      )}

      {/* Planet leaderboard */}
      {data.planetPopularity?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Planet Leaderboard</h3>
          <div className={styles.planetBars}>
            {data.planetPopularity.map((p, i) => (
              <div key={p._id} className={styles.planetBar}>
                <span className={styles.planetRank}>#{i + 1}</span>
                <span className={styles.planetName}>{ROUTE_NAMES[p._id] || p._id}</span>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${i === 0 ? styles.barFillHot : ''}`}
                    style={{ width: `${(p.count / (data.planetPopularity[0]?.count || 1)) * 100}%` }} />
                </div>
                <span className={styles.planetTime}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time per planet */}
      {data.planetTime?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Where People Spend Time</h3>
          <div className={styles.planetBars}>
            {data.planetTime.map(p => (
              <div key={p._id} className={styles.planetBar}>
                <span className={styles.planetRank}></span>
                <span className={styles.planetName}>{ROUTE_NAMES[p._id] || p._id}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill}
                    style={{ width: `${(p.avg / Math.max(...data.planetTime.map(x => x.avg))) * 100}%` }} />
                </div>
                <span className={styles.planetTime}>{Math.round(p.avg)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Speed run */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Speed Run</h3>
        <p className={styles.funFact}>
          {data.speedRunRecord
            ? <>Someone visited all 6 planets in <strong>{data.speedRunRecord}s</strong>. Can you beat it?</>
            : <>Nobody has visited all 6 planets in one session yet. Be the first.</>
          }
        </p>
      </div>

      {/* When do people visit */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>When Do People Visit?</h3>
        <div className={styles.timeGrid}>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>🌙</span>
            <span className={styles.timeValue}>{data.nightOwls || 0}</span>
            <span className={styles.timeLabel}>Night Owls</span>
          </div>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>🌅</span>
            <span className={styles.timeValue}>{data.earlyBirds || 0}</span>
            <span className={styles.timeLabel}>Early Birds</span>
          </div>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>☀️</span>
            <span className={styles.timeValue}>{data.afternoon || 0}</span>
            <span className={styles.timeLabel}>Afternoon</span>
          </div>
          <div className={styles.timeCard}>
            <span className={styles.timeEmoji}>🌆</span>
            <span className={styles.timeValue}>{data.evening || 0}</span>
            <span className={styles.timeLabel}>Evening</span>
          </div>
        </div>
        <p className={styles.funFact}>Most visitors are <strong>{topVisitor}</strong>.</p>
      </div>

      {/* Devices */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Devices</h3>
        <div className={styles.deviceList}>
          {(data.deviceSplit || []).map(d => (
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
          <strong>{data.returnVisitorRate || 0}%</strong> come back.
          {(data.returnVisitorRate || 0) > 30 ? ' The solar system is addictive.' : ' Working on it.'}
        </p>
      </div>

      {/* Fun numbers */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Fun Numbers</h3>
        <div className={styles.bigNumbers}>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.starsDiscovered || 0}</span>
            <span className={styles.bigLabel}>Stars clicked</span>
            <span className={styles.bigSub}>in the 3D sky</span>
          </div>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.scrollDistanceKm || 0} km</span>
            <span className={styles.bigLabel}>Total scroll distance</span>
            <span className={styles.bigSub}>across all visitors</span>
          </div>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.avgDuration || 0}s</span>
            <span className={styles.bigLabel}>Avg session</span>
          </div>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.hubBounceRate || 0}%</span>
            <span className={styles.bigLabel}>Hub bounce</span>
            <span className={styles.bigSub}>Left without exploring</span>
          </div>
        </div>
      </div>

    </div>
  );
}
