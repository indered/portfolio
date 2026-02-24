import { Router } from 'express';

const router = Router();

// ============================================================
// STRAVA INTEGRATION - Placeholder Mode
// ============================================================
// TODO: Real Strava OAuth integration
// 1. Register app at https://www.strava.com/settings/api
// 2. Implement OAuth2 flow:
//    GET  /api/strava/auth       -> Redirect to Strava authorization
//    GET  /api/strava/callback   -> Handle OAuth callback, store tokens
// 3. Use refresh tokens to keep access current
// 4. Fetch real data from Strava API v3:
//    GET https://www.strava.com/api/v3/athlete/activities
//    GET https://www.strava.com/api/v3/athletes/{id}/stats
// ============================================================

// Placeholder data matching RUNNING_STATS from frontend constants
const PLACEHOLDER_ACTIVITIES = [
  {
    date: '2026-02-14',
    distance: '10.5 km',
    duration: '58:22',
    pace: "5'33\"/km",
    title: 'Valentine Day Run',
  },
  {
    date: '2026-02-12',
    distance: '5.2 km',
    duration: '27:45',
    pace: "5'20\"/km",
    title: 'Morning Recovery',
  },
  {
    date: '2026-02-10',
    distance: '21.1 km',
    duration: '1:52:30',
    pace: "5'19\"/km",
    title: 'Half Marathon Prep',
  },
  {
    date: '2026-02-08',
    distance: '8.0 km',
    duration: '43:12',
    pace: "5'24\"/km",
    title: 'Tempo Run',
  },
];

const PLACEHOLDER_STATS = {
  totalDistance: '2,847 km',
  totalRuns: 312,
  longestRun: '42.2 km',
  avgPace: "5'32\"/km",
};

// GET /api/strava/activities - Return placeholder activities
router.get('/activities', (req, res) => {
  // TODO: Replace with real Strava API call
  // const activities = await stravaClient.getActivities(accessToken);
  res.json({
    source: 'placeholder',
    activities: PLACEHOLDER_ACTIVITIES,
  });
});

// GET /api/strava/stats - Return placeholder stats
router.get('/stats', (req, res) => {
  // TODO: Replace with real Strava API call
  // const stats = await stravaClient.getAthleteStats(athleteId, accessToken);
  res.json({
    source: 'placeholder',
    stats: PLACEHOLDER_STATS,
  });
});

export default router;
