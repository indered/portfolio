import { useState, useEffect, lazy, Suspense } from 'react';
import { PLANET_CONFIG } from '../../lib/constants';
import styles from './LiveSection.module.scss';

const MiniPlanet = lazy(() => import('./MiniPlanet'));

const ROUTE_NAMES = {
  '/work': 'Work', '/runner': 'The Long Run', '/ventures': 'Ventures',
  '/connect': 'Connect', '/thoughts': 'The Thinker', '/about': 'Personal',
};

const ROUTE_TO_ID = {
  '/work': 'developer', '/runner': 'runner', '/ventures': 'blockchain',
  '/connect': 'social', '/thoughts': 'thinker', '/about': 'dating',
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
      <p className={styles.subtitle}>What's happening on this solar system</p>

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
        </div>
        <div className={styles.bigCard}>
          <span className={styles.bigValue}>{data.linkedInClicks || 0}</span>
          <span className={styles.bigLabel}>LinkedIn clicks</span>
        </div>
      </div>

      {/* Planet leaderboard with 3D models */}
      {data.planetPopularity?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Planet Leaderboard</h3>
          <div className={styles.leaderboard}>
            {data.planetPopularity.map((p, i) => {
              const personaId = ROUTE_TO_ID[p._id];
              const config = personaId ? PLANET_CONFIG[personaId] : null;
              return (
                <div key={p._id} className={`${styles.leaderRow} ${i === 0 ? styles.leaderRowHot : ''}`}>
                  <span className={styles.leaderRank}>#{i + 1}</span>
                  <div className={styles.leaderPlanet}>
                    {config && (
                      <Suspense fallback={<div className={styles.planetPlaceholder} style={{ background: config.meshColor }} />}>
                        <MiniPlanet color={config.meshColor} emissive={config.emissive} size={config.size} />
                      </Suspense>
                    )}
                  </div>
                  <div className={styles.leaderInfo}>
                    <span className={styles.leaderName}>
                      {ROUTE_NAMES[p._id] || p._id}
                      {i === 0 && <span className={styles.hotTag}>HOT</span>}
                    </span>
                    <span className={styles.leaderRoute}>{p._id}</span>
                  </div>
                  <span className={styles.leaderCount}>{p.count}</span>
                </div>
              );
            })}
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
                <span className={styles.planetName}>{ROUTE_NAMES[p._id] || p._id}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill}
                    style={{ width: `${(p.avg / Math.max(...data.planetTime.map(x => x.avg))) * 100}%` }} />
                </div>
                <span className={styles.planetTime}>{Math.round(p.avg)}s avg</span>
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
            ? <>Fastest to visit all 6 planets: <strong>{data.speedRunRecord}s</strong>. Can you beat it?</>
            : <>Nobody has visited all 6 planets in one session yet. Be the first.</>
          }
        </p>
      </div>

      {/* When do people visit */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>When Do People Visit?</h3>
        <div className={styles.timeGrid}>
          <div className={styles.timeCard}><span className={styles.timeEmoji}>🌙</span><span className={styles.timeValue}>{data.nightOwls || 0}</span><span className={styles.timeLabel}>Night Owls</span></div>
          <div className={styles.timeCard}><span className={styles.timeEmoji}>🌅</span><span className={styles.timeValue}>{data.earlyBirds || 0}</span><span className={styles.timeLabel}>Early Birds</span></div>
          <div className={styles.timeCard}><span className={styles.timeEmoji}>☀️</span><span className={styles.timeValue}>{data.afternoon || 0}</span><span className={styles.timeLabel}>Afternoon</span></div>
          <div className={styles.timeCard}><span className={styles.timeEmoji}>🌆</span><span className={styles.timeValue}>{data.evening || 0}</span><span className={styles.timeLabel}>Evening</span></div>
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

      {/* Fun numbers */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Fun Numbers</h3>
        <div className={styles.bigNumbers}>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.returnVisitorRate || 0}%</span>
            <span className={styles.bigLabel}>Return visitors</span>
          </div>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.starsDiscovered || 0}</span>
            <span className={styles.bigLabel}>Stars clicked</span>
          </div>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.scrollDistanceKm || 0} km</span>
            <span className={styles.bigLabel}>Scroll distance</span>
          </div>
          <div className={styles.bigCard}>
            <span className={styles.bigValue}>{data.hubBounceRate || 0}%</span>
            <span className={styles.bigLabel}>Hub bounce</span>
          </div>
        </div>
      </div>

    </div>
  );
}
