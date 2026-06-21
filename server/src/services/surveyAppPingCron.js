import cron from 'node-cron';

const SURVEY_APP_HEALTH_URLS = [
  'https://survey-app-waterlily.onrender.com/api/health',
  'https://survey-app-waterlily.onrender.com/health',
];

export function startSurveyAppPingCron() {
  if (!process.env.RENDER_EXTERNAL_URL && process.env.NODE_ENV !== 'production') {
    return null;
  }

  const task = cron.schedule('*/5 * * * *', async () => {
    try {
      for (const url of SURVEY_APP_HEALTH_URLS) {
        await fetch(url);
        console.log(`[surveyAppPingCron] ping sent -> ${url}`);
      }
    } catch (err) {
      console.error(`[surveyAppPingCron] ping failed: ${err.message}`);
    }
  });

  console.log('[surveyAppPingCron] scheduled (every 5 min)');
  return task;
}
