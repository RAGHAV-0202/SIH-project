const express = require('express');
const router = express.Router();
const { handleDisruption, acceptNewPlan } = require('../agents/replanningAgent');

/**
 * POST /api/disruption/simulate
 * Simulates human-centered disruption recovery for mountain road / weather scenarios.
 */
router.post('/simulate', async (req, res) => {
  const { scenario = 'kunzum_pass_closure' } = req.body;

  const SCENARIOS = {
    kunzum_pass_closure: {
      id: 'kunzum_pass_closure',
      title: 'Kunzum Pass Landslide Road Closure',
      original: {
        title: 'Original Plan via Kunzum Pass (4,590m)',
        status: 'Road Blocked',
        reason: 'Scree fall along NH-505 between Losar and Batal. Pass closed by Border Roads Organization.',
        impact: 'Estimated 6–14 hours delay at extreme freezing altitude.',
      },
      alternate: {
        title: 'Recommended Alternate Route via Kinnaur Valley',
        status: 'Clear & Open',
        route: 'Scenic all-weather passage through Reckong Peo and Kalpa.',
        stay: 'Dekyid Guesthouse (Kalpa) booked with heated solar amenities.',
        driverNotice: 'Driver Dorje Angchuk notified with updated turn-by-turn route.',
        priceDiff: 0,
        priceLabel: '₹0 Extra Charges (Price Protection Guarantee)',
        elevationNote: 'Gentle ascent profile protects against sudden altitude discomfort.',
      },
      timeline: [
        { time: '10:14 AM', event: 'Road advisory received for NH-505 Kunzum Pass corridor.' },
        { time: '10:15 AM', event: 'Autonomous trip protection calculated Kinnaur Valley safe alternate.' },
        { time: '10:16 AM', event: 'Reserved cozy room at Dekyid Guesthouse with zero cancellation penalties.' },
        { time: '10:16 AM', event: 'Driver Dorje Angchuk acknowledged route update via local mountain dispatch.' },
      ],
    },
    heavy_snowfall: {
      id: 'heavy_snowfall',
      title: 'Heavy Mountain Snowfall Advisory',
      original: {
        title: 'Original High Ridge Treks in Langza',
        status: 'Hazardous Ridge Winds',
        reason: 'Sudden temperature drop to -12°C with 35-knot blizzard crosswinds.',
        impact: 'Exposed outdoor hiking trails temporarily restricted.',
      },
      alternate: {
        title: 'Protected Cultural & Indoor Monastic Sanctuary',
        status: 'Safe & Warm',
        route: 'Sheltered valley trail to Key Monastery heated prayer & meditation halls.',
        stay: 'Tenzin’s Mountain Homestay with traditional wood Bukhari active.',
        driverNotice: 'Vehicle pre-fitted with snow chains for low-elevation valley transit.',
        priceDiff: 0,
        priceLabel: '₹0 Extra Charges (Price Protection Guarantee)',
        elevationNote: 'Rest day acclimatization comfort preserved without altitude strain.',
      },
      timeline: [
        { time: '07:30 AM', event: 'Weather alert logged: sub-zero freeze across Langza plateau.' },
        { time: '07:31 AM', event: 'Outdoor trail replaced with monk tea session & Ki Monastery tour.' },
        { time: '07:32 AM', event: 'Homestay host stoked wood-burning Bukhari for warm afternoon comfort.' },
      ],
    },
    flight_cancellation: {
      id: 'flight_cancellation',
      title: 'Flight Cancellation at Bhuntar Airport',
      original: {
        title: 'Alliance Air ATR-72 Morning Flight',
        status: 'Ground Fog Cancellation',
        reason: 'Persistent morning valley fog prevented air arrivals at Bhuntar (KUU).',
        impact: 'Stranded at airport without onward Himalayan transit.',
      },
      alternate: {
        title: 'Private Executive 4x4 Overland Express via Chandigarh',
        status: 'Confirmed & En Route',
        route: 'Comfortable air-conditioned SUV transfer via safe Himalayan Expressway.',
        stay: 'Arrival on schedule at Manali basecamp for seamless evening rest.',
        driverNotice: 'Licensed mountain pilot dispatched directly to pick-up terminal.',
        priceDiff: 0,
        priceLabel: '₹0 Extra Charges (Wandr Coverage Active)',
        elevationNote: 'Steady, gradual ascent through pine valleys.',
      },
      timeline: [
        { time: '06:10 AM', event: 'Alliance Air morning flight delay confirmed by air traffic control.' },
        { time: '06:11 AM', event: 'Swapped transit to verified private 4x4 transfer automatically.' },
        { time: '06:12 AM', event: 'Driver contact details shared via SMS & WhatsApp.' },
      ],
    },
  };

  const selected = SCENARIOS[scenario] || SCENARIOS.kunzum_pass_closure;

  res.json({
    success: true,
    scenario: selected,
  });
});

/**
 * POST /api/disruption/apply-route
 * Commits the rerouted plan to the active trip session.
 */
router.post('/apply-route', async (req, res) => {
  const { bookingId = 'WNDR-SPITI-8492', scenario = 'kunzum_pass_closure' } = req.body;

  res.json({
    success: true,
    bookingId,
    status: 'route_applied',
    message: 'Your alternate mountain route is confirmed! Host, driver, and safety check-ins have been updated.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/disruption/inject
 * (Backward compatibility with existing agent engine)
 */
router.post('/inject', async (req, res) => {
  const { bookingId, type, details } = req.body;

  if (!bookingId || !type) {
    return res.status(400).json({
      error: 'bookingId and disruption type are required',
      valid_types: ['transport_cancelled', 'weather_alert', 'weather_route_disruption', 'stay_unavailable', 'landslide_closure', 'alpine_blizzard', 'homestay_heat_failure', 'flash_flood_bridge'],
    });
  }

  try {
    const result = await handleDisruption(bookingId, { type, details: details || {} });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Disruption error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/disruption/accept
 */
router.post('/accept', async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId is required' });
  }

  try {
    const result = await acceptNewPlan(bookingId);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Accept plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
