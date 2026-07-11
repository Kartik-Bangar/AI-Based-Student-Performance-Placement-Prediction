/**
 * guidance.js — Rule-Based Placement Guidance Engine
 *
 * This module is ENTIRELY SEPARATE from the IBM AutoAI model.
 * It analyses student input values against defined thresholds
 * and produces human-interpretable feedback.
 *
 * It does NOT predict placement. It guides improvement.
 */

'use strict';

// ── Threshold definitions ──────────────────────────────────────────────────────
const THRESHOLDS = {
  attendance: {
    excellent: 90, good: 75, fair: 60,
    labels: ['Critical', 'Below Average', 'Fair', 'Good', 'Excellent'],
  },
  studyHours: {
    excellent: 6, good: 4, fair: 2,
  },
  cgpa: {
    excellent: 8.5, good: 7.0, fair: 5.5,
  },
  projects: {
    excellent: 4, good: 2, fair: 1,
  },
  certifications: {
    excellent: 4, good: 2, fair: 1,
  },
  aptitudeScore: {
    excellent: 80, good: 65, fair: 50,
  },
  communicationSkills: {
    excellent: 8, good: 6, fair: 4,
  },
  codingSkills: {
    excellent: 8, good: 6, fair: 4,
  },
  mockInterviewScore: {
    excellent: 80, good: 65, fair: 50,
  },
};

// ── Scoring weights (sum = 100) ────────────────────────────────────────────────
const WEIGHTS = {
  cgpa:               20,
  aptitudeScore:      15,
  codingSkills:       15,
  mockInterviewScore: 15,
  communicationSkills:10,
  attendance:          8,
  studyHours:          7,
  projects:            5,
  internship:          3,
  certifications:      2,
};

/**
 * Classify a numeric value against a threshold set.
 * Returns 'excellent' | 'good' | 'fair' | 'poor'
 */
function classify(value, thresholds) {
  if (value >= thresholds.excellent) return 'excellent';
  if (value >= thresholds.good)      return 'good';
  if (value >= thresholds.fair)      return 'fair';
  return 'poor';
}

/**
 * Normalise a raw value to a 0–100 score using min-max clamping.
 */
function normalise(value, min, max) {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/**
 * Main guidance analysis function.
 *
 * @param {object} data - validated form values
 * @returns {{ readinessScore, readinessLabel, strengths, improvements, actionPlan, nextSteps }}
 */
function analyseStudentProfile(data) {
  const {
    attendance, studyHours, cgpa, projects,
    internship, certifications, aptitudeScore,
    communicationSkills, codingSkills, mockInterviewScore,
  } = data;

  const hasInternship = internship === 'yes';

  // ── Individual classification ──────────────────────────────────────────────
  const levels = {
    attendance:          classify(attendance,          THRESHOLDS.attendance),
    studyHours:          classify(studyHours,          THRESHOLDS.studyHours),
    cgpa:                classify(cgpa,                THRESHOLDS.cgpa),
    projects:            classify(projects,            THRESHOLDS.projects),
    certifications:      classify(certifications,      THRESHOLDS.certifications),
    aptitudeScore:       classify(aptitudeScore,       THRESHOLDS.aptitudeScore),
    communicationSkills: classify(communicationSkills, THRESHOLDS.communicationSkills),
    codingSkills:        classify(codingSkills,        THRESHOLDS.codingSkills),
    mockInterviewScore:  classify(mockInterviewScore,  THRESHOLDS.mockInterviewScore),
  };

  // ── Compute readiness score ────────────────────────────────────────────────
  const levelToScore = { excellent: 100, good: 75, fair: 45, poor: 15 };

  let rawScore = 0;
  rawScore += levelToScore[levels.cgpa]                * (WEIGHTS.cgpa / 100);
  rawScore += levelToScore[levels.aptitudeScore]       * (WEIGHTS.aptitudeScore / 100);
  rawScore += levelToScore[levels.codingSkills]        * (WEIGHTS.codingSkills / 100);
  rawScore += levelToScore[levels.mockInterviewScore]  * (WEIGHTS.mockInterviewScore / 100);
  rawScore += levelToScore[levels.communicationSkills] * (WEIGHTS.communicationSkills / 100);
  rawScore += levelToScore[levels.attendance]          * (WEIGHTS.attendance / 100);
  rawScore += levelToScore[levels.studyHours]          * (WEIGHTS.studyHours / 100);
  rawScore += levelToScore[levels.projects]            * (WEIGHTS.projects / 100);
  rawScore += (hasInternship ? 100 : 0)                * (WEIGHTS.internship / 100);
  rawScore += levelToScore[levels.certifications]      * (WEIGHTS.certifications / 100);

  const readinessScore = Math.round(rawScore);

  let readinessLabel, labelColor;
  if      (readinessScore >= 80) { readinessLabel = '🟢 Highly Ready';      labelColor = '#0e6027'; }
  else if (readinessScore >= 65) { readinessLabel = '🔵 Moderately Ready';  labelColor = '#0043ce'; }
  else if (readinessScore >= 50) { readinessLabel = '🟡 Partially Ready';   labelColor = '#996800'; }
  else                           { readinessLabel = '🔴 Needs Improvement'; labelColor = '#a2191f'; }

  // ── Strengths ──────────────────────────────────────────────────────────────
  const strengths = [];

  if (levels.cgpa === 'excellent')
    strengths.push({ icon: '🎓', text: `Excellent CGPA of ${cgpa}/10 — strong academic foundation.` });
  else if (levels.cgpa === 'good')
    strengths.push({ icon: '🎓', text: `Good CGPA of ${cgpa}/10 — competitive academic record.` });

  if (levels.aptitudeScore === 'excellent' || levels.aptitudeScore === 'good')
    strengths.push({ icon: '🧠', text: `Aptitude score of ${aptitudeScore}/100 demonstrates strong analytical skills.` });

  if (levels.codingSkills === 'excellent' || levels.codingSkills === 'good')
    strengths.push({ icon: '💻', text: `Coding skills rated ${codingSkills}/10 — above industry expectation for freshers.` });

  if (levels.mockInterviewScore === 'excellent' || levels.mockInterviewScore === 'good')
    strengths.push({ icon: '🎯', text: `Mock interview score of ${mockInterviewScore}/100 shows strong interview preparedness.` });

  if (levels.communicationSkills === 'excellent' || levels.communicationSkills === 'good')
    strengths.push({ icon: '🗣️', text: `Communication skills rated ${communicationSkills}/10 — effective professional communication.` });

  if (levels.attendance === 'excellent')
    strengths.push({ icon: '📅', text: `${attendance}% attendance reflects commitment and discipline.` });

  if (hasInternship)
    strengths.push({ icon: '🏢', text: 'Internship experience — real-world exposure is highly valued by recruiters.' });

  if (levels.projects === 'excellent' || levels.projects === 'good')
    strengths.push({ icon: '🛠️', text: `${projects} completed projects demonstrate practical application of skills.` });

  if (levels.certifications === 'excellent' || levels.certifications === 'good')
    strengths.push({ icon: '📜', text: `${certifications} certifications show initiative in continuous learning.` });

  if (levels.studyHours === 'excellent' || levels.studyHours === 'good')
    strengths.push({ icon: '📚', text: `${studyHours} study hours/day shows strong dedication to learning.` });

  // ── Areas for Improvement ─────────────────────────────────────────────────
  const improvements = [];

  if (levels.cgpa === 'poor' || levels.cgpa === 'fair')
    improvements.push({ icon: '📉', text: `CGPA of ${cgpa}/10 is below competitive threshold (7.0+). Focus on core subject performance.` });

  if (levels.aptitudeScore === 'poor' || levels.aptitudeScore === 'fair')
    improvements.push({ icon: '🧩', text: `Aptitude score of ${aptitudeScore}/100 needs improvement. Most companies set a cut-off of 65+.` });

  if (levels.codingSkills === 'poor' || levels.codingSkills === 'fair')
    improvements.push({ icon: '💻', text: `Coding skills at ${codingSkills}/10. Technical interviews require consistent DSA practice.` });

  if (levels.mockInterviewScore === 'poor' || levels.mockInterviewScore === 'fair')
    improvements.push({ icon: '🎤', text: `Mock interview score of ${mockInterviewScore}/100 needs work. Regular mock sessions will build confidence.` });

  if (levels.communicationSkills === 'poor' || levels.communicationSkills === 'fair')
    improvements.push({ icon: '🗣️', text: `Communication rated ${communicationSkills}/10. Strong verbal and written skills are crucial for HR rounds.` });

  if (levels.attendance === 'poor' || levels.attendance === 'fair')
    improvements.push({ icon: '📅', text: `Attendance at ${attendance}% is low. Many companies require 75%+ attendance as a prerequisite.` });

  if (!hasInternship)
    improvements.push({ icon: '🏢', text: 'No internship experience. Consider applying for internships or virtual industry projects.' });

  if (levels.projects === 'poor')
    improvements.push({ icon: '🛠️', text: `Only ${projects} project(s) completed. Build 3–5 projects to demonstrate hands-on ability.` });

  if (levels.certifications === 'poor')
    improvements.push({ icon: '📜', text: `Only ${certifications} certification(s). Industry-recognized certifications strengthen your profile.` });

  if (levels.studyHours === 'poor' || levels.studyHours === 'fair')
    improvements.push({ icon: '📚', text: `Only ${studyHours} study hours/day. Consistent 4–6 hours of focused study improves outcomes significantly.` });

  // ── Action Plan ────────────────────────────────────────────────────────────
  const actionPlan = [];

  if (levels.codingSkills !== 'excellent') {
    actionPlan.push('Solve 2 DSA problems daily on LeetCode or HackerRank, focusing on Arrays, Strings, Trees, and Dynamic Programming.');
  }
  if (levels.aptitudeScore !== 'excellent') {
    actionPlan.push('Dedicate 30–45 minutes daily to aptitude practice covering Quantitative, Logical Reasoning, and Verbal Ability.');
  }
  if (levels.mockInterviewScore !== 'excellent') {
    actionPlan.push('Schedule one mock interview per week using platforms like Pramp, Interviewing.io, or with peers.');
  }
  if (levels.communicationSkills !== 'excellent') {
    actionPlan.push('Practice group discussions, improve written communication, and read industry publications daily to build vocabulary.');
  }
  if (!hasInternship) {
    actionPlan.push('Apply for internships on LinkedIn, Internshala, or company career portals. Virtual internships also count.');
  }
  if (levels.projects !== 'excellent') {
    actionPlan.push(`Target building ${Math.max(0, 4 - projects)} more projects. Focus on full-stack, ML, or domain-relevant projects that solve real problems.`);
  }
  if (levels.certifications !== 'excellent') {
    actionPlan.push('Complete certifications on Coursera, edX, or IBM SkillsBuild — especially cloud, AI/ML, and data science tracks.');
  }
  if (levels.cgpa !== 'excellent') {
    actionPlan.push('Create a structured study schedule. Focus on weak subjects and leverage university tutoring resources.');
  }
  if (levels.attendance !== 'excellent') {
    actionPlan.push('Improve attendance to 85%+. Consistent attendance correlates with better grades and placement eligibility.');
  }

  // Limit to top 6 most relevant actions
  const priorityActionPlan = actionPlan.slice(0, 6);

  // ── Next Steps ─────────────────────────────────────────────────────────────
  const nextSteps = _generateNextSteps(levels, hasInternship, readinessScore);

  return {
    readinessScore,
    readinessLabel,
    labelColor,
    strengths,
    improvements,
    actionPlan: priorityActionPlan,
    nextSteps,
  };
}

function _generateNextSteps(levels, hasInternship, score) {
  const steps = [];

  if (levels.codingSkills !== 'excellent') {
    steps.push({
      title: 'DSA Practice',
      desc: 'Daily LeetCode / HackerRank — target Easy→Medium within 30 days.',
    });
  }
  if (levels.aptitudeScore !== 'excellent') {
    steps.push({
      title: 'Aptitude Training',
      desc: 'Use IndiaBix, RS Aggarwal, or campus prep resources for 30 min/day.',
    });
  }
  if (!hasInternship) {
    steps.push({
      title: 'Internship Search',
      desc: 'Apply on Internshala, LinkedIn, and company career pages this week.',
    });
  }
  if (levels.communicationSkills !== 'excellent') {
    steps.push({
      title: 'Communication Skills',
      desc: 'Join a debate club, Toastmasters, or practice JAM (Just a Minute) sessions.',
    });
  }
  if (levels.mockInterviewScore !== 'excellent') {
    steps.push({
      title: 'Mock Interviews',
      desc: 'Book a mock interview on Pramp.com or pair with a classmate weekly.',
    });
  }
  if (levels.certifications !== 'excellent') {
    steps.push({
      title: 'Earn Certifications',
      desc: 'Complete IBM SkillsBuild, Google, AWS, or Coursera certificates relevant to your domain.',
    });
  }
  if (score >= 65) {
    steps.push({
      title: 'Resume Building',
      desc: 'Quantify achievements on your resume and tailor it for each job application.',
    });
  }
  if (score >= 50) {
    steps.push({
      title: 'Company Research',
      desc: 'Research target companies, understand their tech stacks and culture.',
    });
  }

  return steps.slice(0, 6);
}

// Export for use in app.js
window.GuidanceEngine = { analyseStudentProfile };
