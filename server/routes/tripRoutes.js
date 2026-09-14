const express = require('express');
const router = express.Router();
const { planTrip } = require('../orchestrator/planner');
const { createBooking, getBooking } = require('../agents/bookingAgent');
const { parseIntent } = require('../agents/intentAgent');
const { getDestinationWeatherAsync } = require('../agents/weatherAgent');

const destinationsData = require('../data/destinations.json');
const staysData = require('../data/stays.json');

/**
 * GET /api/trip/weather
 * Returns live OpenWeather forecast & climate profile for a destination
 */
router.get('/weather', async (req, res) => {
  try {
    const { destination, days } = req.query;
    if (!destination) {
      return res.status(400).json({ error: 'Destination query parameter is required' });
    }
    const weather = await getDestinationWeatherAsync(destination, new Date(), parseInt(days) || 4);
    res.json({ success: true, weather });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve weather data', message: err.message });
  }
});

/**
 * GET /api/trip/destinations
 * Returns destination list and metadata from vetted database
 */
router.get('/destinations', (req, res) => {
  try {
    const list = (destinationsData.destinations || []).map((d) => ({
      id: d.id,
      name: d.name,
      state: d.state,
      nearest_city: d.nearest_city,
      description: d.description,
      altitude_meters: d.altitude_meters,
      best_season: d.best_season,
      tags: d.tags,
      estimated_daily_food_cost_inr: d.estimated_daily_food_cost_inr,
      estimated_daily_local_travel_inr: d.estimated_daily_local_travel_inr,
      outdoor_activities: d.outdoor_activities || [],
      indoor_activities: d.indoor_activities || [],
      local_food_specialties: d.local_food_specialties || []
    }));
    res.json({ success: true, destinations: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load destinations' });
  }
});

/**
 * GET /api/trip/stays
 * Returns verified stays optionally filtered by destination
 */
router.get('/stays', (req, res) => {
  try {
    const { destination } = req.query;
    let stays = staysData.stays || [];
    if (destination) {
      const q = destination.toLowerCase().trim();
      stays = stays.filter(s => s.destination && s.destination.toLowerCase().includes(q));
    }
    res.json({ success: true, stays });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stays' });
  }
});

/**
 * POST /api/trip/extract-intent
 * Extracts structured trip parameters using multi-model Groq fallback chain
 */
router.post('/extract-intent', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a valid prompt string' });
  }

  try {
    const parsed = await parseIntent(prompt.trim());
    res.json({
      success: true,
      modelUsed: parsed.modelUsed || 'groq',
      data: parsed,
    });
  } catch (error) {
    console.error('Intent extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/trip/plan
 * Plans a trip using the agent pipeline with SSE streaming.
 */
router.post('/plan', async (req, res) => {
  const { prompt, userMemory, destination, origin, days, people, budget } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return res.status(400).json({
      error: 'Please provide a trip description (at least 5 characters)',
    });
  }

  try {
    const explicitParams = { destination, origin, days, people, budget };
    const result = await planTrip(prompt.trim(), null, userMemory, explicitParams);

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        steps: result.steps,
      });
    }

    res.json({
      success: true,
      itinerary: result.itinerary,
      steps: result.steps,
      constraints: result.constraints,
      transport_options: result.transport_options,
      stay_options: result.stay_options,
      activities: result.activities,
    });
  } catch (error) {
    console.error('Trip plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/trip/plan-stream
 * Plans a trip with Server-Sent Events for real-time status updates.
 */
router.post('/plan-stream', async (req, res) => {
  const { prompt, userMemory, destination, origin, days, people, budget } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a trip description' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendStatus = (entry) => {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  };

  try {
    const explicitParams = { destination, origin, days, people, budget };
    const result = await planTrip(prompt.trim(), sendStatus, userMemory, explicitParams);

    // Send final result
    res.write(`data: ${JSON.stringify({ step: 'result', status: 'complete', data: result })}\n\n`);
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ step: 'error', status: 'failed', data: { message: error.message } })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/trip/book
 * Books an itinerary.
 */
router.post('/book', async (req, res) => {
  const { itinerary } = req.body;

  if (!itinerary) {
    return res.status(400).json({ error: 'Itinerary data is required' });
  }

  try {
    const booking = await createBooking(itinerary);
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/trip/:bookingId
 * Retrieves a booking.
 */
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await getBooking(req.params.bookingId);
    res.json({ success: true, booking });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
