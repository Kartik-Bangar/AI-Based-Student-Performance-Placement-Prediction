/**
 * IBM watsonx.ai Client Service
 *
 * Handles:
 *  1. IBM IAM token acquisition (OAuth2 client-credentials flow)
 *  2. Forwarding scored payloads to the AutoAI deployment endpoint
 *
 * All credentials are read from process.env — never hardcoded.
 */

const axios = require('axios');

// ── IAM Token cache (reuse until near-expiry) ─────────────────────────────────
let _cachedToken     = null;
let _tokenExpiresAt  = 0;            // Unix timestamp (ms)
const TOKEN_BUFFER_MS = 5 * 60_000; // refresh 5 min before expiry

/**
 * Obtains (or returns cached) IBM IAM bearer token.
 * @returns {Promise<string>} Bearer token string
 */
async function getIAMToken() {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiresAt - TOKEN_BUFFER_MS) {
    return _cachedToken;
  }

  const tokenUrl = process.env.IBM_IAM_TOKEN_URL || 'https://iam.cloud.ibm.com/identity/token';

  const response = await axios.post(
    tokenUrl,
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey:     process.env.IBM_API_KEY,
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15_000,
    }
  );

  const { access_token, expires_in } = response.data;
  _cachedToken    = access_token;
  _tokenExpiresAt = now + (expires_in * 1000);

  return _cachedToken;
}

/**
 * Sends a scoring payload to the IBM watsonx.ai AutoAI deployment endpoint.
 *
 * @param {object} payload - IBM-format input_data payload
 * @returns {Promise<{ prediction: string, confidence: number, raw: object }>}
 */
async function predict(payload) {
  const token  = await getIAMToken();
  const url    = process.env.IBM_DEPLOYMENT_URL;
  const mlId   = process.env.IBM_ML_INSTANCE_ID;

  const response = await axios.post(url, payload, {
    headers: {
      Authorization:    `Bearer ${token}`,
      'Content-Type':   'application/json',
      'ML-Instance-ID': mlId || '',
    },
    timeout: 30_000,
  });

  const raw        = response.data;
  const predictions = raw?.predictions?.[0];

  if (!predictions) {
    throw new Error('Unexpected response format from IBM deployment endpoint.');
  }

  // ── Parse the IBM AutoAI response ─────────────────────────────────────────
  // AutoAI typically returns:
  //   predictions[0].values[0][0]  → predicted label  (e.g. "YES" / "NO" / 1 / 0)
  //   predictions[0].values[0][1]  → probability array (e.g. [0.12, 0.88])
  //
  // Adjust the indices below if your model uses different column ordering.

  const rawLabel  = predictions.values?.[0]?.[0];
  const probArray = predictions.values?.[0]?.[1];

  // Normalise label to "YES" / "NO"
  let prediction;
  if (typeof rawLabel === 'string') {
    prediction = rawLabel.trim().toUpperCase() === 'YES' || rawLabel === '1' ? 'YES' : 'NO';
  } else {
    prediction = rawLabel === 1 ? 'YES' : 'NO';
  }

  // Confidence: use the probability of the predicted class
  let confidence = null;
  if (Array.isArray(probArray) && probArray.length >= 2) {
    confidence = prediction === 'YES'
      ? Math.round(probArray[1] * 100)
      : Math.round(probArray[0] * 100);
  }

  return { prediction, confidence, raw };
}

module.exports = { predict };
