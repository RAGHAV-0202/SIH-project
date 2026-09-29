const express = require('express');
const router = express.Router();
const { planRoutes, planStream } = require('../orchestrator/planner');
const { handleDisruption } = require('../agents/disruptionAgent');

router.post('/plan', async (req, res) => {
  try {
    const { userInput, mode, payload_weight_kg, origin, destination, budget, pref } = req.body;
    if (!userInput && (!origin || !destination)) return res.status(400).json({ error: 'userInput or origin/destination required' });
    const result = await planRoutes(userInput || `Commute from ${origin} to ${destination}`, {
      mode,
      payload_weight_kg,
      origin,
      destination,
      budget,
      pref
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/plan-stream', (req, res) => {
  const { userInput, mode, payload_weight_kg } = req.body;
  if (!userInput) {
    res.status(400).end();
    return;
  }
  planStream(userInput, res, { mode, payload_weight_kg });
});

router.post('/replan', (req, res) => {
  const { routes, disruption } = req.body;
  if (!routes || !disruption) return res.status(400).json({ error: 'routes and disruption required' });
  const newRoutes = handleDisruption(routes, disruption);
  res.json({ routes: newRoutes });
});

router.get('/disruptions', (req, res) => {
  res.json({
    active: [
      { type: 'metro_delay', affected_area: 'Blue Line', severity: 2, message: 'Technical snag on Blue Line' }
    ]
  });
});

module.exports = router;
