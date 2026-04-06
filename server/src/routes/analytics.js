import { Router } from 'express';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = Router();

const EXCLUDE_IPS = [
  '49.43.112.234',
  '2405:201:601b:e86d:d935:805b:f264:6b8a',
  ...(process.env.EXCLUDE_IPS || '').split(',').map(s => s.trim()).filter(Boolean),
];

// POST /api/analytics/event
router.post('/event', (req, res) => {
  res.status(202).json({ ok: true });

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  if (EXCLUDE_IPS.length && EXCLUDE_IPS.includes(clientIp)) return;

  const { type, route, planet, duration, sessionId, device, referrer, returnVisitor, meta } = req.body;
  if (!type || !sessionId) return;

  AnalyticsEvent.create({
    type,
    route: route || '/',
    planet: planet || null,
    duration: duration || null,
    sessionId,
    device: device || 'desktop',
    country: req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || null,
    city: req.headers['cf-ipcity'] || req.headers['x-vercel-ip-city'] || null,
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
                { case: { $eq: ['$planet', 'developer'] }, then: '/architect' },
                { case: { $eq: ['$planet', 'blockchain'] }, then: '/ventures' },
                { case: { $eq: ['$planet', 'dating'] }, then: '/about' },
                { case: { $eq: ['$planet', 'social'] }, then: '/connect' },
                { case: { $eq: ['$planet', 'thinker'] }, then: '/thoughts' },
                { case: { $eq: ['$planet', 'runner'] }, then: '/runner' },
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
        { $group: { _id: '$route', avg: { $avg: '$duration' } } },
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
    ]);

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
    });
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

export default router;
