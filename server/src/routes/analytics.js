import { Router } from 'express';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = Router();

// IPs to exclude from tracking (owner's traffic)
const EXCLUDE_IPS = [
  '49.43.112.234',
  '2405:201:601b:e86d:d935:805b:f264:6b8a',
  ...(process.env.EXCLUDE_IPS || '').split(',').map(s => s.trim()).filter(Boolean),
];

// POST /api/analytics/event — fire-and-forget
router.post('/event', (req, res) => {
  res.status(202).json({ ok: true });

  // Skip excluded IPs (your own traffic)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  if (EXCLUDE_IPS.length && EXCLUDE_IPS.includes(clientIp)) return;

  const { type, route, planet, duration, sessionId, device, referrer, returnVisitor, meta } = req.body;
  if (!type || !sessionId) return;

  const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || null;
  const city = req.headers['cf-ipcity'] || req.headers['x-vercel-ip-city'] || null;

  AnalyticsEvent.create({
    type,
    route: route || '/',
    planet: planet || null,
    duration: duration || null,
    sessionId,
    device: device || 'desktop',
    country,
    city,
    referrer: referrer || null,
    returnVisitor: returnVisitor || false,
    meta: meta || null,
  }).catch(() => {});
});

// GET /api/analytics/stats — aggregated dashboard data
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalSessions,
      todaySessions,
      weekSessions,
      planetPopularity,
      avgDuration,
      topCountries,
      deviceSplit,
      topReferrers,
      hubBounceRate,
      dailyVisits,
    ] = await Promise.all([
      // Total unique sessions (30 days)
      AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: thirtyDaysAgo } }).then(r => r.length),

      // Today's sessions
      AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: todayStart } }).then(r => r.length),

      // This week's sessions
      AnalyticsEvent.distinct('sessionId', { createdAt: { $gte: sevenDaysAgo } }).then(r => r.length),

      // Planet popularity (page_view counts per planet route)
      AnalyticsEvent.aggregate([
        { $match: { type: 'planet_click', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$planet', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Average session duration
      AnalyticsEvent.aggregate([
        { $match: { type: 'session_end', duration: { $gt: 0 }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } },
      ]),

      // Top countries
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', country: { $ne: null }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Device split
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Top referrers
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', referrer: { $ne: null }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Hub bounce rate: sessions that viewed hub but never clicked a planet
      (async () => {
        const hubSessions = await AnalyticsEvent.distinct('sessionId', {
          type: 'page_view', route: '/', createdAt: { $gte: thirtyDaysAgo },
        });
        const clickedSessions = await AnalyticsEvent.distinct('sessionId', {
          type: 'planet_click', createdAt: { $gte: thirtyDaysAgo },
        });
        const clickedSet = new Set(clickedSessions);
        const bounced = hubSessions.filter(s => !clickedSet.has(s)).length;
        return hubSessions.length > 0 ? Math.round((bounced / hubSessions.length) * 100) : 0;
      })(),

      // Daily visits (last 7 days)
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view', createdAt: { $gte: sevenDaysAgo } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      totalSessions,
      todaySessions,
      weekSessions,
      planetPopularity,
      avgDuration: avgDuration[0]?.avg ? Math.round(avgDuration[0].avg) : 0,
      topCountries,
      deviceSplit,
      topReferrers,
      hubBounceRate,
      dailyVisits,
    });
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

// GET /api/analytics/fun — fun public stats
router.get('/fun', async (req, res) => {
  try {
    const [
      totalStars,
      totalPageViews,
      resumeDownloads,
      speedRunRecord,
      planetTime,
      peakHours,
      returnRate,
      devicePersonality,
      linkedInClicks,
    ] = await Promise.all([
      // Total stars discovered
      AnalyticsEvent.countDocuments({ type: 'star_click' }),

      // Total page views ever
      AnalyticsEvent.countDocuments({ type: 'page_view' }),

      // Resume downloads
      AnalyticsEvent.countDocuments({ type: 'resume_download' }),

      // Speed run record (fastest to visit all 6 planets)
      AnalyticsEvent.findOne({ type: 'speed_run' }).sort({ duration: 1 }).lean(),

      // Time per planet (avg seconds)
      AnalyticsEvent.aggregate([
        { $match: { type: 'time_per_planet', duration: { $gt: 0, $lt: 600 } } },
        { $group: { _id: '$route', avg: { $avg: '$duration' }, total: { $sum: '$duration' } } },
        { $sort: { avg: -1 } },
      ]),

      // Peak hours (visits by hour of day, UTC)
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view' } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Return visitor rate
      (async () => {
        const total = await AnalyticsEvent.distinct('sessionId', { type: 'page_view' });
        const returning = await AnalyticsEvent.distinct('sessionId', { type: 'page_view', returnVisitor: true });
        return total.length > 0 ? Math.round((returning.length / total.length) * 100) : 0;
      })(),

      // Device personality breakdown
      AnalyticsEvent.aggregate([
        { $match: { type: 'page_view' } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // LinkedIn clicks
      AnalyticsEvent.countDocuments({ type: 'link_click', 'meta.label': 'LinkedIn' }),
    ]);

    // Total scroll distance (rough: avg page height ~3000px * total page views)
    const scrollDistancePx = totalPageViews * 3000;
    const scrollDistanceKm = (scrollDistancePx * 0.0000002645).toFixed(2); // px to km (very rough)

    // Night owls vs early birds
    const nightOwls = peakHours.filter(h => h._id >= 22 || h._id < 6).reduce((s, h) => s + h.count, 0);
    const earlyBirds = peakHours.filter(h => h._id >= 6 && h._id < 12).reduce((s, h) => s + h.count, 0);
    const afternoon = peakHours.filter(h => h._id >= 12 && h._id < 18).reduce((s, h) => s + h.count, 0);
    const evening = peakHours.filter(h => h._id >= 18 && h._id < 22).reduce((s, h) => s + h.count, 0);

    res.json({
      starsDiscovered: totalStars,
      totalPageViews,
      resumeDownloads,
      speedRunRecord: speedRunRecord ? speedRunRecord.duration : null,
      planetTime,
      peakHours,
      nightOwls,
      earlyBirds,
      afternoon,
      evening,
      returnVisitorRate: returnRate,
      devicePersonality,
      linkedInClicks,
      scrollDistanceKm,
    });
  } catch (err) {
    res.status(500).json({ error: 'Fun stats unavailable' });
  }
});

export default router;
