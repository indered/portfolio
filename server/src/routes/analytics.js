import { Router } from 'express';
import mongoose from 'mongoose';
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

const SITE_HOST = (process.env.SITE_HOST || 'maheshinder.in')
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .toLowerCase();

// /architect is an alias for /work — treat them as one so stats don't split.
function normalizeRoute(route) {
  if (route === '/architect') return '/work';
  return route;
}
function normalizePlanet(planet) {
  if (planet === 'architect' || planet === '/architect') return '/work';
  return planet;
}

function cleanToken(value) {
  return String(value || '').trim().toLowerCase().replace(/^[-_]+/, '');
}

function normalizeTrafficSource(rawSource, referrer = null) {
  const token = cleanToken(rawSource);
  if (token) {
    if (token.includes('instagram.com') || token.includes('instagr.am') || ['ig', 'instagram', 'insta'].includes(token)) return 'ig';
    if (token.includes('linkedin.com') || ['linkedin', 'li'].includes(token)) return 'linkedin';
    if (token.includes('wellfound.com') || token.includes('angel.co') || ['wellfound', 'angel', 'angellist', 'wf'].includes(token)) return 'wellfound';
    if (token.includes('github.com') || ['github', 'gh'].includes(token)) return 'github';
    if (token.includes('youtube.com') || token.includes('youtu.be') || ['youtube', 'yt'].includes(token)) return 'youtube';
    if (token.includes('google.') || ['google', 'g'].includes(token)) return 'google';
    if (['direct', 'none', 'organic'].includes(token)) return 'direct';
    if (['internal', 'site', 'self'].includes(token)) return 'internal';
    return token.replace(/\s+/g, '-');
  }

  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
    if (host === SITE_HOST || host.endsWith(`.${SITE_HOST}`)) return 'internal';
    if (host.includes('instagram.com') || host === 'instagr.am') return 'ig';
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('wellfound.com') || host.includes('angel.co')) return 'wellfound';
    if (host.includes('github.com')) return 'github';
    if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube';
    if (host.includes('google.')) return 'google';
    if (host.includes('x.com') || host.includes('twitter.com')) return 'x';
    return 'other';
  } catch {
    return 'other';
  }
}

function formatAreaLabel({ city, region, country }) {
  return [city, region, country].filter(Boolean).join(', ') || 'Unknown';
}

function sourceExpr() {
  return {
    $ifNull: [
      '$source',
      { $ifNull: ['$meta.utm_source', { $ifNull: ['$referrer', 'direct'] }] },
    ],
  };
}

function visitorHistoryAggregation(pageFilter, includeEngagement = false) {
  const base = [
    { $match: pageFilter },
    { $sort: { createdAt: 1 } },
    {
      $group: {
        _id: '$sessionId',
        firstSeen: { $first: '$createdAt' },
        lastSeen: { $last: '$createdAt' },
        source: { $first: sourceExpr() },
        country: { $first: '$country' },
        city: { $first: '$city' },
        region: { $first: '$region' },
        device: { $first: '$device' },
        route: { $first: '$route' },
        referrer: { $first: '$referrer' },
        pageViews: { $sum: 1 },
      },
    },
    { $sort: { lastSeen: -1 } },
    { $limit: 20 },
  ];

  if (!includeEngagement) return base;

  base[2].$group.views = {
    $sum: { $cond: [{ $eq: ['$type', 'page_view'] }, 1, 0] },
  };
  return base;
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

function isAnalyticsDbReady() {
  return mongoose.connection.readyState === 1;
}

// POST /api/analytics/event
router.post('/event', async (req, res) => {
  res.status(202).json({ ok: true });

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  if (EXCLUDE_IPS.length && EXCLUDE_IPS.includes(clientIp)) return;

  const { type, route, planet, duration, sessionId, device, source, referrer, returnVisitor, meta, fingerprint } = req.body;
  if (!type || !sessionId) return;
  if (typeof fingerprint === 'string' && EXCLUDE_FINGERPRINTS.includes(fingerprint.slice(0, 40))) return;

  // Fire and forget — don't block on the IP lookup; write the event either way
  let enrich = null;
  try { enrich = await lookupIp(clientIp); } catch {}

  const normalizedSource = normalizeTrafficSource(
    source || meta?.source_code || meta?.utm_source,
    referrer,
  );

  AnalyticsEvent.create({
    type,
    route: normalizeRoute(route || '/'),
    planet: normalizePlanet(planet) || null,
    duration: duration || null,
    sessionId,
    device: device || 'desktop',
    source: normalizedSource,
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
    if (!isAnalyticsDbReady()) {
      return res.status(503).json({ error: 'Stats unavailable' });
    }

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
      topSourcesRaw, topAreasRaw, recentVisitorsRaw,
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

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: d30 } } },
        { $group: { _id: sourceExpr(), count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: d30 } } },
        { $group: { _id: { city: '$city', region: '$region', country: '$country' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: d30 } } },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: '$sessionId',
            firstSeen: { $first: '$createdAt' },
            lastSeen: { $last: '$createdAt' },
            source: { $first: sourceExpr() },
            country: { $first: '$country' },
            city: { $first: '$city' },
            region: { $first: '$region' },
            device: { $first: '$device' },
            route: { $first: '$route' },
            referrer: { $first: '$referrer' },
            pageViews: { $sum: 1 },
          },
        },
        { $sort: { lastSeen: -1 } },
        { $limit: 20 },
      ]),

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
      topSources: topSourcesRaw.map((item) => ({
        label: normalizeTrafficSource(item._id),
        count: item.count,
      })),
      topAreas: topAreasRaw.map((item) => ({
        label: formatAreaLabel(item._id),
        count: item.count,
      })),
      recentVisitors: recentVisitorsRaw.map((item) => ({
        id: `${item._id}`,
        when: new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(item.firstSeen),
        area: formatAreaLabel(item),
        source: normalizeTrafficSource(item.source, item.referrer),
        device: item.device || 'unknown',
        route: item.route || '/',
        pages: item.pageViews || 0,
        lastSeenAgo: item.lastSeen ? formatRelativeTime(item.lastSeen, now) : null,
      })),
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
    if (!isAnalyticsDbReady()) {
      return res.status(503).json({ error: 'Video stats unavailable' });
    }

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
      topSourcesRaw,
      topAreasRaw,
      recentVisitorsRaw,
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
      AnalyticsEvent.aggregate([
        { $match: pageViewFilter },
        { $group: { _id: sourceExpr(), count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: pageViewFilter },
        { $group: { _id: { city: '$city', region: '$region', country: '$country' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: withExcludedIps({ route, createdAt: { $gte: since } }) },
        { $sort: { createdAt: 1 } },
        {
          $group: {
            _id: '$sessionId',
            firstSeen: { $first: '$createdAt' },
            lastSeen: { $last: '$createdAt' },
            source: { $first: sourceExpr() },
            country: { $first: '$country' },
            city: { $first: '$city' },
            region: { $first: '$region' },
            device: { $first: '$device' },
            pageViews: {
              $sum: { $cond: [{ $eq: ['$type', 'page_view'] }, 1, 0] },
            },
            plays: {
              $sum: { $cond: [{ $eq: ['$type', 'video_play'] }, 1, 0] },
            },
            likes: {
              $sum: { $cond: [{ $eq: ['$type', 'video_like_toggle'] }, 1, 0] },
            },
          },
        },
        { $sort: { lastSeen: -1 } },
        { $limit: 20 },
      ]),
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
      topSources: topSourcesRaw.map((item) => ({
        label: normalizeTrafficSource(item._id),
        count: item.count,
      })),
      topAreas: topAreasRaw.map((item) => ({
        label: formatAreaLabel(item._id),
        count: item.count,
      })),
      recentVisitors: recentVisitorsRaw.map((item) => ({
        id: `${item._id}`,
        when: new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(item.firstSeen),
        area: formatAreaLabel(item),
        source: normalizeTrafficSource(item.source, item.referrer),
        device: item.device || 'unknown',
        views: item.pageViews || 0,
        plays: item.plays || 0,
        likes: item.likes || 0,
        lastSeenAgo: item.lastSeen ? formatRelativeTime(item.lastSeen, now) : null,
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
