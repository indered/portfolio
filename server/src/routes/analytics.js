import { Router } from 'express';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = Router();

// POST /api/analytics/event — fire-and-forget
router.post('/event', (req, res) => {
  res.status(202).json({ ok: true });

  const { type, route, planet, duration, sessionId, device, referrer } = req.body;
  if (!type || !sessionId) return;

  // Extract country/city from Cloudflare or Render headers
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

export default router;
