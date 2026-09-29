const express = require('express');
const router = express.Router();
const { generateDashboardAnalytics } = require('../agents/analyticsAgent');
const corridors = require('../data/corridors.json');

router.get('/analytics', (req, res) => {
  try {
    const data = generateDashboardAnalytics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/congestion', (req, res) => {
  // Returns heatmap-ready points
  const points = corridors.corridors.map(c => ({
    lat: (c.from.lat + c.to.lat) / 2,
    lng: (c.from.lng + c.to.lng) / 2,
    intensity: c.peak_congestion_level,
    name: c.name
  }));
  res.json({ heatmap: points });
});

router.get('/corridors', (req, res) => {
  res.json(corridors);
});

module.exports = router;
