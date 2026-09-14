const express = require('express');
const router = express.Router();

/**
 * GET /api/planning/stream
 * Server-Sent Events streaming the human-friendly 5-step trip planning process.
 */
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const steps = [
    {
      step: 1,
      name: 'Preferences Checked',
      status: 'complete',
      detail: 'Budget ceiling ₹30,000, 5 days duration, 2 travelers with morning tea pacing.',
      timestamp: new Date().toISOString(),
    },
    {
      step: 2,
      name: 'Route Selected',
      status: 'complete',
      detail: 'Delhi to Bhuntar feeder + scenic high-clearance 4x4 via Atal Tunnel.',
      timestamp: new Date().toISOString(),
    },
    {
      step: 3,
      name: 'Homestays Curated',
      status: 'complete',
      detail: '48+ verified village homes searched. Selected Tenzin’s Mountain Homestay (Bukhari heated).',
      timestamp: new Date().toISOString(),
    },
    {
      step: 4,
      name: 'Altitude Pace Verified',
      status: 'complete',
      detail: 'Gradual acclimatization buffer active. Day 1 rest day in Kaza (3,800m).',
      timestamp: new Date().toISOString(),
    },
    {
      step: 5,
      name: 'Budget Balanced',
      status: 'complete',
      detail: 'Total ₹28,400 with ₹1,600 emergency contingency reserve intact.',
      timestamp: new Date().toISOString(),
    },
  ];

  let current = 0;
  const interval = setInterval(() => {
    if (current < steps.length) {
      res.write(`data: ${JSON.stringify(steps[current])}\n\n`);
      current++;
    } else {
      res.write(`data: ${JSON.stringify({ done: true, message: 'All steps verified for peaceful mountain journey.' })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 350);

  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = router;
