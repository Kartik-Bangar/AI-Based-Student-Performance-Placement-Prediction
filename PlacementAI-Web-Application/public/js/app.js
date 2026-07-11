/**
 * app.js — Frontend Application Controller
 *
 * Responsibilities:
 *  - Navigation (scroll-spy, mobile toggle)
 *  - Form validation
 *  - Calling /api/prediction (IBM Cloud proxy)
 *  - Calling GuidanceEngine.analyseStudentProfile (rule-based)
 *  - Rendering the results dashboard
 */

'use strict';

// ── DOM references ─────────────────────────────────────────────────────────────
const navbar      = document.getElementById('navbar');
const navToggle   = document.getElementById('navToggle');
const navMenu     = document.getElementById('navMenu');
const form        = document.getElementById('assessmentForm');
const submitBtn   = document.getElementById('submitBtn');
const btnSpinner  = document.getElementById('btnSpinner');
const btnText     = submitBtn.querySelector('.btn-text');
const resultsSection = document.getElementById('results');
const resetBtn    = document.getElementById('resetBtn');

// ── Navbar: scroll behaviour ───────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
  updateScrollSpy();
}, { passive: true });

// ── Navbar: mobile toggle ──────────────────────────────────────────────────────
navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu on link click
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Scroll-spy ─────────────────────────────────────────────────────────────────
function updateScrollSpy() {
  const sections = ['home', 'assessment', 'how-it-works', 'about'];
  const scrollPos = window.scrollY + 80;

  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollPos) current = id;
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

// ── Form validation ────────────────────────────────────────────────────────────
const FIELD_RULES = {
  attendance:          { min: 0,   max: 100,  label: 'Attendance',           integer: true },
  studyHours:          { min: 0,   max: 18,   label: 'Study Hours',          integer: false },
  cgpa:                { min: 0,   max: 10,   label: 'CGPA',                 integer: false },
  projects:            { min: 0,   max: 50,   label: 'Projects',             integer: true },
  certifications:      { min: 0,   max: 30,   label: 'Certifications',       integer: true },
  aptitudeScore:       { min: 0,   max: 100,  label: 'Aptitude Score',       integer: true },
  communicationSkills: { min: 1,   max: 10,   label: 'Communication Skills', integer: true },
  codingSkills:        { min: 1,   max: 10,   label: 'Coding Skills',        integer: true },
  mockInterviewScore:  { min: 0,   max: 100,  label: 'Mock Interview Score', integer: true },
};

function validateField(name, value) {
  if (name === 'internship') {
    return value ? null : 'Please select internship status.';
  }
  const rule = FIELD_RULES[name];
  if (!rule) return null;
  if (value === '' || value === null || value === undefined) {
    return `${rule.label} is required.`;
  }
  const num = Number(value);
  if (isNaN(num)) return `${rule.label} must be a number.`;
  if (num < rule.min || num > rule.max) {
    return `${rule.label} must be between ${rule.min} and ${rule.max}.`;
  }
  if (rule.integer && !Number.isInteger(num)) {
    return `${rule.label} must be a whole number.`;
  }
  return null;
}

function showFieldError(name, message) {
  const input = form.elements[name];
  const errorEl = document.getElementById(`${name}-error`);
  if (input) {
    input.classList.toggle('error', !!message);
    input.classList.toggle('valid', !message && input.value !== '');
  }
  if (errorEl) errorEl.textContent = message || '';
}

function validateAll() {
  let valid = true;
  const fields = [
    'attendance', 'studyHours', 'cgpa', 'projects', 'internship',
    'certifications', 'aptitudeScore', 'communicationSkills',
    'codingSkills', 'mockInterviewScore',
  ];
  fields.forEach(name => {
    const el = form.elements[name];
    const value = el ? el.value : '';
    const error = validateField(name, value);
    showFieldError(name, error);
    if (error) valid = false;
  });
  return valid;
}

// Live validation on blur
Object.keys(FIELD_RULES).forEach(name => {
  const el = form.elements[name];
  if (!el) return;
  el.addEventListener('blur', () => {
    const error = validateField(name, el.value);
    showFieldError(name, error);
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) {
      const error = validateField(name, el.value);
      showFieldError(name, error);
    }
  });
});

const internshipEl = form.elements['internship'];
if (internshipEl) {
  internshipEl.addEventListener('change', () => {
    const error = validateField('internship', internshipEl.value);
    showFieldError('internship', error);
  });
}

// ── Form submit ────────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateAll()) {
    // Scroll to first error
    const firstError = form.querySelector('.form-input.error, .form-select.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const formData = collectFormData();
  setLoadingState(true);

  try {
    // ── Run rule-based guidance (always available) ───────────────────────────
    const guidance = window.GuidanceEngine.analyseStudentProfile(formData);

    // ── Request IBM Cloud prediction (requires credentials) ──────────────────
    let predictionResult = null;
    try {
      const response = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(35_000),
      });
      predictionResult = await response.json();
    } catch (networkErr) {
      console.warn('[Prediction fetch error]', networkErr.message);
      predictionResult = {
        success: false,
        ibmConfigured: false,
        message: 'Could not reach the backend server. Make sure the Node.js server is running on port 3000.',
      };
    }

    renderResults(guidance, predictionResult);

  } finally {
    setLoadingState(false);
  }
});

// ── Collect form data ──────────────────────────────────────────────────────────
function collectFormData() {
  return {
    attendance:          Number(form.elements.attendance.value),
    studyHours:          Number(form.elements.studyHours.value),
    cgpa:                Number(form.elements.cgpa.value),
    projects:            Number(form.elements.projects.value),
    internship:          form.elements.internship.value,
    certifications:      Number(form.elements.certifications.value),
    aptitudeScore:       Number(form.elements.aptitudeScore.value),
    communicationSkills: Number(form.elements.communicationSkills.value),
    codingSkills:        Number(form.elements.codingSkills.value),
    mockInterviewScore:  Number(form.elements.mockInterviewScore.value),
  };
}

// ── Loading state ──────────────────────────────────────────────────────────────
function setLoadingState(loading) {
  submitBtn.disabled = loading;
  btnSpinner.hidden  = !loading;
  btnText.textContent = loading ? 'Analysing...' : 'Predict & Get Guidance';
}

// ── Render all results ─────────────────────────────────────────────────────────
function renderResults(guidance, prediction) {
  renderPrediction(prediction);
  renderReadinessScore(guidance.readinessScore, guidance.readinessLabel, guidance.labelColor);
  renderList('strengthsList',    guidance.strengths,    renderInsightItem);
  renderList('improvementsList', guidance.improvements, renderInsightItem);
  renderList('actionList',       guidance.actionPlan,   renderActionItem);
  renderNextSteps(guidance.nextSteps);

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Prediction card ────────────────────────────────────────────────────────────
function renderPrediction(prediction) {
  const container = document.getElementById('predictionContent');

  if (!prediction || prediction.ibmConfigured === false) {
    container.innerHTML = `
      <div class="prediction-pending">
        <div class="prediction-pending-icon">🔌</div>
        <div>
          <h4>IBM Cloud Model Not Connected</h4>
          <p>${escHtml(prediction?.message || 'IBM Cloud credentials are not configured.')}</p>
          <p style="margin-top:0.75rem;font-size:0.875rem;">
            To enable AutoAI placement prediction:
          </p>
          <ol style="margin:0.5rem 0 0 1.25rem;font-size:0.875rem;color:var(--text-secondary);line-height:1.8;">
            <li>Copy <code>.env.example</code> → <code>.env</code></li>
            <li>Add your <code>IBM_API_KEY</code>, <code>IBM_DEPLOYMENT_URL</code>, and <code>IBM_ML_INSTANCE_ID</code></li>
            <li>Restart the server with <code>npm start</code></li>
          </ol>
        </div>
      </div>`;
    return;
  }

  if (!prediction.success && prediction.ibmUnavailable) {
    container.innerHTML = `
      <div class="prediction-pending">
        <div class="prediction-pending-icon">☁️</div>
        <div>
          <h4>AI Prediction Temporarily Unavailable</h4>
          <p>The IBM watsonx.ai AutoAI prediction service is currently unavailable due to cloud resource limitations. Your Placement Readiness Score and personalized guidance below are still available using the application's guidance system.</p>
        </div>
      </div>`;
    return;
  }

  if (!prediction.success) {
    container.innerHTML = `
      <div class="prediction-pending">
        <div class="prediction-pending-icon">⚠️</div>
        <div>
          <h4>AI Prediction Temporarily Unavailable</h4>
          <p>The IBM watsonx.ai AutoAI prediction service is currently unavailable due to cloud resource limitations. Your Placement Readiness Score and personalized guidance below are still available using the application's guidance system.</p>
        </div>
      </div>`;
    return;
  }

  const isYes        = prediction.prediction === 'YES';
  const verdictClass = isYes ? 'verdict-yes' : 'verdict-no';
  const confidenceW  = prediction.confidence !== null ? prediction.confidence : null;

  container.innerHTML = `
    <div class="prediction-result">
      <div class="prediction-verdict">
        <span class="verdict-label">Placement Prediction</span>
        <span class="verdict-value ${verdictClass}">${escHtml(prediction.prediction)}</span>
        <span class="badge ${isYes ? 'badge-yes' : 'badge-no'}">${isYes ? 'Likely Placed' : 'Needs Work'}</span>
      </div>
      ${confidenceW !== null ? `
      <div class="confidence-bar-wrapper">
        <div class="confidence-label">
          <span>Model Confidence</span>
          <span id="confidenceVal">0%</span>
        </div>
        <div class="confidence-bar">
          <div class="confidence-fill" id="confidenceFill" style="width:0%"></div>
        </div>
      </div>` : ''}
    </div>`;

  // Animate confidence bar
  if (confidenceW !== null) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fill = document.getElementById('confidenceFill');
        const val  = document.getElementById('confidenceVal');
        if (fill) fill.style.width = `${confidenceW}%`;
        if (val)  animateNumber(val, 0, confidenceW, 800, '%');
      }, 150);
    });
  }
}

// ── Readiness score ring ───────────────────────────────────────────────────────
function renderReadinessScore(score, label, color) {
  const circumference = 326.73;
  const offset = circumference - (score / 100) * circumference;

  document.getElementById('readinessScore').textContent = score;
  const labelEl = document.getElementById('readinessLabel');
  labelEl.textContent  = label.replace(/^[^\s]+ /, ''); // strip leading emoji
  labelEl.style.color  = color;

  const ringFill = document.getElementById('ringFill');
  if      (score >= 80) ringFill.style.stroke = '#198038';
  else if (score >= 65) ringFill.style.stroke = '#0f62fe';
  else if (score >= 50) ringFill.style.stroke = '#f1c21b';
  else                  ringFill.style.stroke = '#da1e28';

  requestAnimationFrame(() => {
    setTimeout(() => {
      ringFill.style.strokeDashoffset = String(offset);
    }, 200);
  });
}

// ── List renderers ─────────────────────────────────────────────────────────────
function renderList(containerId, items, renderFn) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<li style="color:var(--text-muted);font-size:0.9rem;padding:0.5rem 0;">None identified.</li>';
    return;
  }
  items.forEach(item => {
    container.appendChild(renderFn(item));
  });
}

function renderInsightItem(item) {
  const li = document.createElement('li');
  li.innerHTML = `<span class="insight-icon">${escHtml(item.icon)}</span><span>${escHtml(item.text)}</span>`;
  return li;
}

function renderActionItem(text) {
  const li = document.createElement('li');
  li.textContent = text;
  return li;
}

function renderNextSteps(steps) {
  const container = document.getElementById('nextStepsList');
  container.innerHTML = '';
  if (!steps || steps.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);">No additional steps recommended.</p>';
    return;
  }
  steps.forEach(step => {
    const div = document.createElement('div');
    div.className = 'next-step-item';
    div.innerHTML = `<h5>${escHtml(step.title)}</h5><p>${escHtml(step.desc)}</p>`;
    container.appendChild(div);
  });
}

// ── Reset ──────────────────────────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
  resultsSection.hidden = true;
  form.reset();

  // Clear validation states
  form.querySelectorAll('.form-input, .form-select').forEach(el => {
    el.classList.remove('error', 'valid');
  });
  form.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
  });

  // Reset ring
  document.getElementById('ringFill').style.strokeDashoffset = '326.73';
  document.getElementById('readinessScore').textContent = '—';
  document.getElementById('readinessLabel').textContent  = '';

  document.getElementById('assessment').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Utility: animate number ────────────────────────────────────────────────────
function animateNumber(el, from, to, duration, suffix) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (to - from) * ease) + (suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Utility: HTML escape ───────────────────────────────────────────────────────
function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Init ───────────────────────────────────────────────────────────────────────
updateScrollSpy();
