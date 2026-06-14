import { Router } from 'express';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Conversation from '../models/Conversation.js';
import { lookupIp } from '../services/ipLookup.js';

const router = Router();

const EXCLUDE_IPS = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  '49.43.112.234',
  '2405:201:601b:e86d:d935:805b:f264:6b8a',
  '49.43.112.74',
  '117.99.81.228',
  '117.99.80.201',
  ...(process.env.EXCLUDE_IPS || '').split(',').map(s => s.trim()).filter(Boolean),
];

const EXCLUDE_FINGERPRINTS = [
  'f14e03e2',
  '04ca7782',
  'a94d5291',
  ...(process.env.EXCLUDE_FINGERPRINTS || '').split(',').map(s => s.trim()).filter(Boolean),
];

// /architect is an alias for /work — treat them as one so stats don't split.
function normalizeRoute(route) {
  if (route === '/architect') return '/work';
  return route;
}
function normalizePlanet(planet) {
  if (planet === 'architect' || planet === '/architect') return '/work';
  return planet;
}

function requireAuth(req, res, next) {
  const pin = req.headers['x-pin'] || req.query.pin;
  if (!pin || pin !== process.env.INBOX_PIN) {
    return res.status(401).json({ error: 'Invalid PIN.' });
  }
  next();
}

function formatRelativeTime(from, to = new Date()) {
  const diffMinutes = Math.round((from.getTime() - to.getTime()) / (60 * 1000));
  const absMinutes = Math.abs(diffMinutes);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absMinutes < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 48) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, 'day');
}

function withExcludedIps(filter = {}) {
  const next = { ...filter };
  if (EXCLUDE_IPS.length) next.ip = { $nin: EXCLUDE_IPS };
  if (EXCLUDE_FINGERPRINTS.length) next.fingerprint = { $nin: EXCLUDE_FINGERPRINTS };
  return next;
}

// POST /api/analytics/event
router.post('/event', async (req, res) => {
  res.status(202).json({ ok: true });

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  if (EXCLUDE_IPS.length && EXCLUDE_IPS.includes(clientIp)) return;

  const { type, route, planet, duration, sessionId, device, referrer, returnVisitor, meta, fingerprint } = req.body;
  if (!type || !sessionId) return;
  if (typeof fingerprint === 'string' && EXCLUDE_FINGERPRINTS.includes(fingerprint.slice(0, 40))) return;

  // Fire and forget — don't block on the IP lookup; write the event either way
  let enrich = null;
  try { enrich = await lookupIp(clientIp); } catch {}

  AnalyticsEvent.create({
    type,
    route: normalizeRoute(route || '/'),
    planet: normalizePlanet(planet) || null,
    duration: duration || null,
    sessionId,
    device: device || 'desktop',
    // Prefer CDN-provided geo (Cloudflare/Vercel) when present, fall back to ipinfo
    country: req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || enrich?.country || null,
    city: req.headers['cf-ipcity'] || req.headers['x-vercel-ip-city'] || enrich?.city || null,
    region: enrich?.region || null,
    postal: enrich?.postal || null,
    company: enrich?.company || null,
    asn: enrich?.asn || null,
    fingerprint: typeof fingerprint === 'string' ? fingerprint.slice(0, 40) : null,
    ip: clientIp || null,
    referrer: referrer || null,
    returnVisitor: returnVisitor || false,
    meta: meta || null,
  }).catch(() => {});
});

// GET /api/analytics/stats — single endpoint, everything
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const d30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const d7 = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalSessions, todaySessions, weekSessions,
      planetPopularity, avgDuration, topCountries,
      deviceSplit, topReferrers, hubBounceRate, dailyVisits,
      totalStars, totalPageViews, resumeDownloads,
      speedRunRecord, planetTime, peakHours,
      returnRate, linkedInClicks,
      askStats,
    ] = await Promise.all([
      AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: d30 } }).then(r => r.length),
      AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: today } }).then(r => r.length),
      AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: d7 } }).then(r => r.length),

      // Planet popularity - normalize old IDs to route paths
      AnalyticsEvent.aggregate([
        { $match: { type: 'planet_click', createdAt: { $gte: d30 } } },
        { $addFields: {
          normalizedPlanet: {
            $switch: {
              branches: [
                { case: { $eq: ['$planet', 'about'] }, then: '/about' },
                { case: { $eq: ['$planet', 'work'] }, then: '/work' },
                { case: { $eq: ['$planet', 'connect'] }, then: '/connect' },
                { case: { $eq: ['$planet', 'runner'] }, then: '/runner' },
                { case: { $eq: ['$planet', 'ventures'] }, then: '/ventures' },
                { case: { $eq: ['$planet', 'thoughts'] }, then: '/thoughts' },
                { case: { $eq: ['$planet', 'ask'] }, then: '/ask' },
                // /architect is an alias route for /work — same persona
                { case: { $eq: ['$planet', 'architect'] }, then: '/work' },
                { case: { $eq: ['$planet', '/architect'] }, then: '/work' },
                // Legacy IDs from before the rename
                { case: { $eq: ['$planet', 'developer'] }, then: '/work' },
                { case: { $eq: ['$planet', 'dating'] }, then: '/about' },
                { case: { $eq: ['$planet', 'social'] }, then: '/connect' },
                { case: { $eq: ['$planet', 'blockchain'] }, then: '/ventures' },
                { case: { $eq: ['$planet', 'thinker'] }, then: '/thoughts' },
              ],
              default: '$planet',
            }
          }
        }},
        { $group: { _id: '$normalizedPlanet', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'session_end', duration: { $gt: 0 }, createdAt: { $gte: d30 } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', country: { $ne: null }, createdAt: { $gte: d30 } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: d30 } } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', referrer: { $ne: null }, createdAt: { $gte: d30 } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),

      (async () => {
        const hub = await AnalyticsEvent.distinct('sessionId', { type: 'page_view', route: '/', createdAt: { $gte: d30 } });
        const clicked = new Set(await AnalyticsEvent.distinct('sessionId', { type: 'planet_click', createdAt: { $gte: d30 } }));
        const bounced = hub.filter(s => !clicked.has(s)).length;
        return hub.length > 0 ? Math.round((bounced / hub.length) * 100) : 0;
      })(),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: d7 } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      AnalyticsEvent.countDocuments({ type: 'star_click' }),
      AnalyticsEvent.countDocuments({ type: 'page_view' }),
      AnalyticsEvent.countDocuments({ type: 'resume_download' }),
      AnalyticsEvent.findOne({ type: 'speed_run' }).sort({ duration: 1 }).lean(),

      AnalyticsEvent.aggregate([
        { $match: { type: 'time_per_planet', duration: { $gt: 0, $lt: 600 } } },
        { $addFields: {
          normalizedRoute: {
            $switch: {
              branches: [
                { case: { $eq: ['$route', '/architect'] }, then: '/work' },
              ],
              default: '$route',
            }
          }
        }},
        { $group: { _id: '$normalizedRoute', avg: { $avg: '$duration' } } },
        { $sort: { avg: -1 } },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view' } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      (async () => {
        const all = await AnalyticsEvent.distinct('sessionId', { type: 'page_view' });
        const ret = await AnalyticsEvent.distinct('sessionId', { type: 'page_view', returnVisitor: true });
        return all.length > 0 ? Math.round((ret.length / all.length) * 100) : 0;
      })(),

      AnalyticsEvent.countDocuments({ type: 'link_click', 'meta.label': 'LinkedIn' }),

      // /ask chat activity: total conversations + total user questions exchanged
      Conversation.aggregate([
        { $project: {
          total: { $size: '$messages' },
          userCount: {
            $size: {
              $filter: { input: '$messages', as: 'm', cond: { $eq: ['$$m.role', 'user'] } },
            },
          },
          today: { $cond: [{ $gte: ['$createdAt', today] }, 1, 0] },
          week:  { $cond: [{ $gte: ['$createdAt', d7] }, 1, 0] },
        }},
        { $group: {
          _id: null,
          conversations: { $sum: 1 },
          messages: { $sum: '$total' },
          questions: { $sum: '$userCount' },
          conversationsToday: { $sum: '$today' },
          conversationsWeek:  { $sum: '$week' },
        }},
      ]),
    ]);

    const ask = askStats[0] || {};

    const nightOwls = peakHours.filter(h => h._id >= 22 || h._id < 6).reduce((s, h) => s + h.count, 0);
    const earlyBirds = peakHours.filter(h => h._id >= 6 && h._id < 12).reduce((s, h) => s + h.count, 0);
    const afternoon = peakHours.filter(h => h._id >= 12 && h._id < 18).reduce((s, h) => s + h.count, 0);
    const evening = peakHours.filter(h => h._id >= 18 && h._id < 22).reduce((s, h) => s + h.count, 0);
    const scrollDistanceKm = (totalPageViews * 3000 * 0.0000002645).toFixed(2);

    res.json({
      totalSessions, todaySessions, weekSessions,
      planetPopularity,
      avgDuration: avgDuration[0]?.avg ? Math.round(avgDuration[0].avg) : 0,
      topCountries, deviceSplit, topReferrers, hubBounceRate, dailyVisits,
      starsDiscovered: totalStars, totalPageViews, resumeDownloads,
      speedRunRecord: speedRunRecord?.duration || null,
      planetTime, peakHours,
      nightOwls, earlyBirds, afternoon, evening,
      returnVisitorRate: returnRate,
      linkedInClicks, scrollDistanceKm,
      askConversations: ask.conversations || 0,
      askQuestions: ask.questions || 0,
      askMessages: ask.messages || 0,
      askConversationsToday: ask.conversationsToday || 0,
      askConversationsWeek: ask.conversationsWeek || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

router.get('/video-stats', requireAuth, async (req, res) => {
  try {
    const now = new Date();
    const windowDays = 90;
    const since = new Date(now - windowDays * 24 * 60 * 60 * 1000);
    const slug = String(req.query.slug || 'waterlily-video');
    const route = slug.startsWith('/') ? slug : `/${slug}`;
    const pageFilter = withExcludedIps({ route, createdAt: { $gte: since } });
    const pageViewFilter = withExcludedIps({ type: 'page_view', route, createdAt: { $gte: since } });
    const playFilter = withExcludedIps({ type: 'video_play', route, 'meta.videoSlug': slug, createdAt: { $gte: since } });
    const completeFilter = withExcludedIps({ type: 'video_complete', route, 'meta.videoSlug': slug, createdAt: { $gte: since } });
    const likeFilter = withExcludedIps({ type: 'video_like_toggle', route, 'meta.videoSlug': slug, createdAt: { $gte: since } });

    const [
      pageViews,
      uniquePageSessions,
      totalPlays,
      uniquePlaySessions,
      uniqueViewers,
      completionSessions,
      totalLikeToggles,
      uniqueLikeSessions,
      currentLikesRaw,
      topViewCountriesRaw,
      topViewCitiesRaw,
      dailyViewsRaw,
      viewHoursRaw,
      recentViewsRaw,
      lastView,
      topPlayCountriesRaw,
      topPlayCitiesRaw,
      progressMilestonesRaw,
      topReferrersRaw,
      recentPlaysRaw,
      lastPlay,
      recentLikesRaw,
      lastLike,
    ] = await Promise.all([
      AnalyticsEvent.countDocuments(pageViewFilter),
      AnalyticsEvent.distinct('sessionId', pageViewFilter).then((items) => items.length),
      AnalyticsEvent.countDocuments(playFilter),
      AnalyticsEvent.distinct('sessionId', playFilter).then((items) => items.length),
      AnalyticsEvent.distinct('fingerprint', { ...playFilter, fingerprint: { $ne: null } }).then((items) => items.length),
      AnalyticsEvent.distinct('sessionId', completeFilter).then((items) => items.length),
      AnalyticsEvent.countDocuments(likeFilter),
      AnalyticsEvent.distinct('sessionId', likeFilter).then((items) => items.length),
      AnalyticsEvent.aggregate([
        { $match: likeFilter },
        { $sort: { sessionId: 1, createdAt: -1 } },
        {
          $group: {
            _id: '$sessionId',
            liked: { $first: '$meta.liked' },
          },
        },
        { $match: { liked: true } },
        { $count: 'count' },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...pageViewFilter, country: { $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...pageViewFilter, city: { $ne: null } } },
        {
          $group: {
            _id: {
              city: '$city',
              country: '$country',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: pageViewFilter },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: pageViewFilter },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsEvent.find(pageViewFilter)
        .sort({ createdAt: -1 })
        .limit(20)
        .select('createdAt country city region device referrer')
        .lean(),
      AnalyticsEvent.findOne(pageViewFilter).sort({ createdAt: -1 }).select('createdAt').lean(),
      AnalyticsEvent.aggregate([
        { $match: { ...playFilter, country: { $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...playFilter, city: { $ne: null } } },
        {
          $group: {
            _id: {
              city: '$city',
              country: '$country',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: withExcludedIps({ type: 'video_progress', route, 'meta.videoSlug': slug, createdAt: { $gte: since } }) },
        { $group: { _id: '$meta.milestone', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...playFilter, referrer: { $ne: null } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.find(playFilter)
        .sort({ createdAt: -1 })
        .limit(20)
        .select('createdAt country city region device referrer meta')
        .lean(),
      AnalyticsEvent.findOne(playFilter).sort({ createdAt: -1 }).select('createdAt').lean(),
      AnalyticsEvent.find(likeFilter)
        .sort({ createdAt: -1 })
        .limit(20)
        .select('createdAt country city region device meta')
        .lean(),
      AnalyticsEvent.findOne(likeFilter).sort({ createdAt: -1 }).select('createdAt').lean(),
    ]);

    const playRate = uniquePageSessions > 0
      ? Math.round((uniquePlaySessions / uniquePageSessions) * 100)
      : 0;
    const completionRate = uniquePlaySessions > 0
      ? Math.round((completionSessions / uniquePlaySessions) * 100)
      : 0;

    res.json({
      slug,
      route,
      windowDays,
      pageViews,
      uniquePageSessions,
      totalPlays,
      uniquePlaySessions,
      uniqueViewers,
      currentLikes: currentLikesRaw[0]?.count || 0,
      totalLikeToggles,
      uniqueLikeSessions,
      lastLikeAgo: lastLike?.createdAt ? formatRelativeTime(lastLike.createdAt, now) : null,
      lastViewAgo: lastView?.createdAt ? formatRelativeTime(lastView.createdAt, now) : null,
      playRate,
      completionRate,
      topViewCountries: topViewCountriesRaw.map((item) => ({ label: item._id, count: item.count })),
      topViewCities: topViewCitiesRaw.map((item) => ({
        label: [item._id.city, item._id.country].filter(Boolean).join(', '),
        count: item.count,
      })),
      dailyViews: dailyViewsRaw.map((item) => ({
        label: item._id,
        shortLabel: item._id.slice(5),
        count: item.count,
      })),
      hourlyViews: viewHoursRaw.map((item) => ({
        label: `${String(item._id).padStart(2, '0')}:00`,
        count: item.count,
      })),
      recentViews: recentViewsRaw.map((item) => ({
        id: `${item._id}`,
        when: new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(item.createdAt),
        location: [item.city, item.region, item.country].filter(Boolean).join(', ') || 'Unknown',
        device: item.device || 'unknown',
        referrer: item.referrer || 'Direct',
      })),
      topPlayCountries: topPlayCountriesRaw.map((item) => ({ label: item._id, count: item.count })),
      topPlayCities: topPlayCitiesRaw.map((item) => ({
        label: [item._id.city, item._id.country].filter(Boolean).join(', '),
        count: item.count,
      })),
      progressMilestones: progressMilestonesRaw.map((item) => ({
        label: `${item._id}%`,
        count: item.count,
      })),
      topReferrers: topReferrersRaw.map((item) => ({ label: item._id, count: item.count })),
      recentPlays: recentPlaysRaw.map((item) => ({
        id: `${item._id}`,
        when: new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(item.createdAt),
        location: [item.city, item.region, item.country].filter(Boolean).join(', ') || 'Unknown',
        device: item.device || 'unknown',
        referrer: item.referrer || 'Direct',
        startedAt: `${Math.round(item.meta?.currentSecond || 0)}s`,
      })),
      lastPlayAgo: lastPlay?.createdAt ? formatRelativeTime(lastPlay.createdAt, now) : null,
      recentLikes: recentLikesRaw.map((item) => ({
        id: `${item._id}`,
        when: new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(item.createdAt),
        location: [item.city, item.region, item.country].filter(Boolean).join(', ') || 'Unknown',
        device: item.device || 'unknown',
        action: item.meta?.liked ? 'Liked' : 'Unliked',
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Video stats unavailable' });
  }
});

export default router;
