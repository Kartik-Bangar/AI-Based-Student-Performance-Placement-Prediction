/**
 * Prediction Route — /api/prediction
 *
 * This route is the ONLY bridge between the frontend and IBM Cloud.
 * IBM credentials are read from environment variables set in .env
 * and are never sent to the browser.
 *
 * To activate:
 *   1. Copy .env.example to .env
 *   2. Fill in IBM_API_KEY, IBM_DEPLOYMENT_URL, IBM_ML_INSTANCE_ID
 *   3. Restart the server
 */

const express   = require('express');
const router    = express.Router();
const ibmClient = require('../services/ibmWatsonx');

/**
 * POST /api/prediction
 * Body: { attendance, studyHours, cgpa, projects, internship,
 *         certifications, aptitudeScore, communicationSkills,
 *         codingSkills, mockInterviewScore }
 */
router.post('/', async (req, res) => {
  // ── Validate that IBM credentials are configured ─────────────────────────
  const ibmConfigured = !!(
    process.env.IBM_API_KEY &&
    process.env.IBM_DEPLOYMENT_URL &&
    process.env.IBM_API_KEY !== 'your_ibm_cloud_api_key_here'
  );

  if (!ibmConfigured) {
    return res.status(503).json({
      success: false,
      ibmConfigured: false,
      message:
        'IBM Cloud model integration is not yet configured. ' +
        'Add your IBM Cloud credentials to the .env file to enable ' +
        'AutoAI-based placement prediction. ' +
        'Rule-based guidance is available without this connection.',
    });
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const {
    attendance, studyHours, cgpa, projects, internship,
    certifications, aptitudeScore, communicationSkills,
    codingSkills, mockInterviewScore,
  } = req.body;

  const numericFields = {
    attendance, studyHours, cgpa, projects,
    certifications, aptitudeScore, communicationSkills,
    codingSkills, mockInterviewScore,
  };

  for (const [field, value] of Object.entries(numericFields)) {
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ success: false, message: `Missing field: ${field}` });
    }
    if (isNaN(Number(value))) {
      return res.status(400).json({ success: false, message: `Invalid numeric value for: ${field}` });
    }
  }

  if (internship === undefined || internship === null) {
    return res.status(400).json({ success: false, message: 'Missing field: internship' });
  }

  // ── Build IBM AutoAI payload ───────────────────────────────────────────────
  // Adjust the field names and order below to match your AutoAI training schema
  const inputPayload = {
    input_data: [
      {
        fields: [
          'Attendance',
          'Study_Hours',
          'CGPA',
          'Projects',
          'Internship',
          'Certifications',
          'Aptitude_Score',
          'Communication_Skills',
          'Coding_Skills',
          'Mock_Interview_Score',
        ],
        values: [
          [
            Number(attendance),
            Number(studyHours),
            Number(cgpa),
            Number(projects),
            internship === 'yes' ? 1 : 0,
            Number(certifications),
            Number(aptitudeScore),
            Number(communicationSkills),
            Number(codingSkills),
            Number(mockInterviewScore),
          ],
        ],
      },
    ],
  };

  // ── Call IBM watsonx.ai ───────────────────────────────────────────────────
  try {
    const result = await ibmClient.predict(inputPayload);

    return res.json({
      success: true,
      ibmConfigured: true,
      prediction: result.prediction,     // "YES" | "NO"
      confidence: result.confidence,     // 0–100
      rawResponse: result.raw,           // full IBM response (optional debug)
    });
  } catch (err) {
    console.error('[IBM Prediction Error]', err.message);

    // ── Detect quota / capacity / billing errors ──────────────────────────────
    // HTTP 402 = Payment Required (CUH exhausted or billing issue)
    // HTTP 429 = Too Many Requests (rate / capacity limit)
    // HTTP 503 = Service Unavailable (IBM Cloud service down)
    const httpStatus = err.response?.status;
    const errBody    = err.response?.data;
    const errText    = (
      err.message +
      JSON.stringify(errBody ?? '')
    ).toLowerCase();

    const isCapacityError =
      httpStatus === 402 ||
      httpStatus === 429 ||
      httpStatus === 503 ||
      errText.includes('capacity unit') ||
      errText.includes('cuh') ||
      errText.includes('quota') ||
      errText.includes('limit exceeded') ||
      errText.includes('insufficient') ||
      errText.includes('payment required') ||
      errText.includes('trial') ||
      errText.includes('resource limit') ||
      errText.includes('service unavailable');

    if (isCapacityError) {
      return res.status(503).json({
        success:       false,
        ibmConfigured: true,
        ibmUnavailable: true,
      });
    }

    return res.status(502).json({
      success: false,
      ibmConfigured: true,
      message: `IBM Cloud prediction request failed: ${err.message}`,
    });
  }
});

module.exports = router;
