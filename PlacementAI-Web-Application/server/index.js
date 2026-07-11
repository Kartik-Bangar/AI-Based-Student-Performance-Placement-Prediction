/**
 * AI-Based Student Performance & Placement Guidance System
 * Backend Server — Node.js / Express
 *
 * This server acts as a secure proxy between the frontend and the
 * IBM watsonx.ai AutoAI deployment on IBM Cloud. API credentials
 * are kept server-side and are never exposed to the browser.
 */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const predictionRouter = require('./routes/prediction');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", "data:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
}));

// ── Rate limiting ──────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// ── Body parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── Static files ───────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/prediction', predictionRouter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const ibmConfigured = !!(
    process.env.IBM_API_KEY &&
    process.env.IBM_DEPLOYMENT_URL &&
    process.env.IBM_API_KEY !== 'your_ibm_cloud_api_key_here'
  );

  res.json({
    status:        'ok',
    server:        'AI Placement Guidance System',
    ibmConfigured: ibmConfigured,
    timestamp:     new Date().toISOString(),
  });
});

// ── Catch-all: serve frontend ──────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║  AI Student Placement Guidance System                ║');
  console.log(`  ║  Server running at http://localhost:${PORT}             ║`);
  console.log('  ╚══════════════════════════════════════════════════════╝');
  console.log('');

  const ibmConfigured = !!(
    process.env.IBM_API_KEY &&
    process.env.IBM_DEPLOYMENT_URL &&
    process.env.IBM_API_KEY !== 'your_ibm_cloud_api_key_here'
  );

  if (ibmConfigured) {
    console.log('  ✅  IBM Cloud credentials detected — prediction endpoint active.');
  } else {
    console.log('  ⚠️   IBM Cloud credentials not configured.');
    console.log('  ℹ️   Copy .env.example → .env and add your IBM credentials.');
    console.log('  ℹ️   Rule-based guidance is fully functional without credentials.');
  }
  console.log('');
});
