const transportData = require('../data/transport.json');
const { search_trains_tool, search_buses_tool, search_flights_tool, search_cabs_tool } = require('./tools');

/**
 * Transport Agent — utilizes knowledge-powered simulation tools (IRCTC, State Road Transport, Domestic Flights, Local Cabs).
 * Synthesizes multi-modal options and scores them based on composite efficiency.
 */

async function getTransportOptions(origin, destination, budget_inr, maxTravelHours, excludeIds = []) {
  let rawOptions = [];
  
  try {
    console.log(`🤖 Transport Agent: Reasoning & invoking transit tools for ${origin} → ${destination}...`);
    
    // Concurrently trigger domain simulation tools
    const [trainResults, busResults, flightResults, cabResults] = await Promise.all([
      search_trains_tool({ origin, destination, maxPrice: budget_inr * 0.4 }),
      search_buses_tool({ origin, destination, maxPrice: budget_inr * 0.35 }),
      search_flights_tool({ origin, destination, maxPrice: budget_inr * 0.7 }),
      search_cabs_tool({ origin, destination })
    ]);

    rawOptions = [
      ...(Array.isArray(trainResults) ? trainResults : []),
      ...(Array.isArray(busResults) ? busResults : []),
      ...(Array.isArray(flightResults) ? flightResults : []),
      ...(Array.isArray(cabResults) ? cabResults : [])
    ];

    if (rawOptions.length > 0) {
      console.log(`✅ Transport Agent: Synthesized ${rawOptions.length} transit options from knowledge tools.`);
    } else {
      throw new Error("Tools returned empty options");
    }
  } catch (error) {
    console.log(`⚠️  Transport Agent: Tools failed (${error.message}). Falling back to static JSON...`);
    const normalizedOrigin = normalizeLocation(origin);
    const normalizedDest = normalizeLocation(destination);

    const route = transportData.routes.find(r =>
      normalizeLocation(r.origin) === normalizedOrigin &&
      normalizeLocation(r.destination) === normalizedDest
    );

    if (route) {
      rawOptions = route.options;
    }
  }

  if (rawOptions.length === 0) {
    // Generate an emergency baseline route so user is never stranded with 0 options
    rawOptions = [
      {
        id: `t-auto-${Date.now()}-1`,
        mode: 'bus',
        operator: `Inter-State Express (${origin} to ${destination})`,
        departure: '08:00 PM',
        arrival: '06:00 AM+1',
        duration_hours: 10,
        price_inr: Math.round(budget_inr * 0.15) || 1200,
        class: 'AC Sleeper',
        waitlist_status: 'confirmed',
        cancellation_probability: 0.02
      },
      {
        id: `t-auto-${Date.now()}-2`,
        mode: 'private-cab',
        operator: `Local Union Taxi (${origin} to ${destination})`,
        departure: 'Flexible',
        arrival: 'Door to door',
        duration_hours: 7,
        price_inr: Math.round(budget_inr * 0.35) || 3500,
        class: 'Sedan',
        waitlist_status: 'confirmed',
        cancellation_probability: 0.01
      }
    ];
  }

  // Filter out excluded options and those exceeding travel time constraint
  let options = rawOptions.filter(opt =>
    !excludeIds.includes(opt.id) &&
    opt.duration_hours <= maxTravelHours
  );

  // If no options within time constraint, relax it and take all non-excluded
  if (options.length === 0) {
    options = rawOptions.filter(opt => !excludeIds.includes(opt.id));
  }

  // Score each option
  const scored = options.map(opt => {
    // Price score: lower is better (normalize against budget)
    const priceScore = 1 - (opt.price_inr / budget_inr);

    // Duration score: shorter is better (normalize against 48h)
    const durationScore = 1 - (opt.duration_hours / 48);

    // Reliability score based on waitlist status
    const reliabilityScore = {
      'confirmed': 1.0,
      'RAC': 0.6,
      'waitlisted': 0.3,
    }[opt.waitlist_status] || 0.5;

    // Cancellation risk penalty
    const riskPenalty = (opt.cancellation_probability || 0) * 0.5;

    // Composite score (weighted)
    const score = (priceScore * 0.35) + (durationScore * 0.25) + (reliabilityScore * 0.3) - riskPenalty;

    return {
      ...opt,
      score: Math.round(score * 100) / 100,
      risk_level: (opt.cancellation_probability || 0) > 0.2 ? 'high' :
                  (opt.cancellation_probability || 0) > 0.1 ? 'medium' : 'low',
    };
  });

  // Sort by score (descending)
  scored.sort((a, b) => b.score - a.score);

  console.log(`✅ Transport Agent: Found ${scored.length} options for ${origin} → ${destination}`);
  return scored;
}

function normalizeLocation(name) {
  const n = (name || '').toLowerCase().trim();
  if (n.includes('spiti') || n.includes('kaza') || n.includes('kinnaur') || n.includes('ladakh') || n.includes('zanskar')) {
    return 'spiti valley';
  }
  if (n.includes('manali') || n.includes('kullu')) return 'manali';
  if (n.includes('rishikesh') || n.includes('dehradun') || n.includes('haridwar')) return 'rishikesh';
  if (n.includes('coorg') || n.includes('madikeri') || n.includes('kodagu')) return 'coorg';
  if (n.includes('meghalaya') || n.includes('shillong') || n.includes('cherrapunji')) return 'meghalaya';
  if (n.includes('kerala') || n.includes('alleppey') || n.includes('munnar') || n.includes('kochi')) return 'kerala';
  if (n.includes('jaipur') || n.includes('pink city')) return 'jaipur';
  if (n.includes('goa') || n.includes('panaji')) return 'goa';
  return n;
}

module.exports = { getTransportOptions };
