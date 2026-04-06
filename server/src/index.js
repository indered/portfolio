import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

import connectDB from './config/db.js';
import guestbookRoutes from './routes/guestbook.js';
import tokenRoutes from './routes/tokens.js';
import stravaRoutes from './routes/strava.js';
import musicRoutes from './routes/music.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (Render, Cloudflare etc)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mahesh Multiverse API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/guestbook', guestbookRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/strava', stravaRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  // SPA fallback — try prerendered HTML first, then index.html
  app.get('/{*path}', (req, res) => {
    const routePath = req.path === '/' ? '' : req.path.replace(/^\//, '');
    const prerendered = path.join(clientDist, routePath, 'index.html');

    // Check if a prerendered file exists for this route
    import('fs').then(({ existsSync }) => {
      if (routePath && existsSync(prerendered)) {
        res.sendFile(prerendered);
      } else {
        res.sendFile(path.join(clientDist, 'index.html'));
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
    });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Self-ping every 5 minutes to prevent Render free tier sleep
  if (process.env.RENDER_EXTERNAL_URL || process.env.NODE_ENV === 'production') {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    cron.schedule('*/5 * * * *', async () => {
      try {
        await fetch(`${url}/api/health`);
        console.log('Keep-alive ping sent');
      } catch (err) {
        console.error('Keep-alive ping failed:', err.message);
      }
    });
    console.log('Keep-alive cron scheduled (every 10 min)');
  }
});

export default app;
