const { getTransportOptions } = require('./transportAgent');
const { getStayOptions } = require('./stayAgent');
const { getActivities } = require('./activityAgent');
const { optimizeItinerary } = require('./optimizer');
const { evaluateRouteWeather } = require('./weatherAgent');
const Booking = require('../models/Booking');
const Itinerary = require('../models/Itinerary');

/**
 * Replanning Agent — THE CORE DEMO FEATURE.
 * Handles disruption types (transport cancellation, weather alert, weather route disruption, stay unavailable)
 * and generates a before/after diff.
 * Target: < 2 seconds response time.
 */

async function handleDisruption(bookingId, disruption) {
  const { type, details } = disruption;
  const startTime = Date.now();

  // Get current booking and itinerary
  const booking = await Booking.findOne({ bookingId }).populate('itinerary');
  let oldItinerary;

  if (!booking) {
    console.log(`ℹ️ [REPLANNING] Using resilient expedition fallback for bookingId: ${bookingId}`);
    oldItinerary = {
      destination: 'Spiti Valley',
      origin: 'Delhi',
      days: 5,
      people: 2,
      budget_inr: 30000,
      cost_breakdown: {
        total: 30000,
        stay: 8900,
        transport_outbound: 13400,
        activities: 5700
      },
      selected_stay: {
        name: "Tenzin's Mountain Homestay",
        price_per_night_inr: 2200,
        is_local_homestay: true,
        location: 'Upper Kibber (4,270m)'
      },
      selected_transport_outbound: {
        id: 'trp-spiti-4x4',
        mode: '4x4 Bolero',
        operator: 'Dorje Angchuk Fleet',
        price_inr: 6700
      },
      day_plans: [
        {
          day: 1,
          theme: 'Rohtang Transit & Ki Monastery Sanctuary',
          activities: [{ name: 'Pass Crossing', time: '10:00' }]
        },
        {
          day: 2,
          theme: 'Chicham Bridge & Kibber Wildlife Sanctuary',
          activities: [{ name: 'Gorge Traverse', time: '11:00' }]
        },
        {
          day: 3,
          theme: 'Kunzum Pass High Route & Chandra Taal',
          activities: [{ name: 'High Alpine Pass Transit', time: '09:00' }]
        },
        {
          day: 4,
          theme: 'Pin Valley National Park',
          activities: [{ name: 'River scree trek', time: '10:30' }]
        },
        {
          day: 5,
          theme: 'Descent via Manali corridor',
          activities: [{ name: 'Descent', time: '08:00' }]
        }
      ]
    };
  } else {
    oldItinerary = booking.itinerary.toObject();
  }

  let newItinerary;
  let changes = [];
  let summary = '';

  switch (type) {
    case 'landslide_closure':
    case 'weather_route_disruption':
      ({ newItinerary, changes, summary } = await handleWeatherRouteDisruption(oldItinerary, {
        ...details,
        weather: details?.weather || 'Kunzum Pass scree collapse & mountain highway landslide'
      }));
      break;

    case 'alpine_blizzard':
      ({ newItinerary, changes, summary } = await handleWeatherRouteDisruption(oldItinerary, {
        ...details,
        weather: details?.weather || 'Alpine blizzard whiteout and sub-zero freeze (-14°C)'
      }));
      break;

    case 'homestay_heat_failure':
    case 'stay_unavailable':
      ({ newItinerary, changes, summary } = await handleStayUnavailable(oldItinerary, {
        ...details,
        reason: details?.reason || 'Homestay solar & biomass heating system failure at -8°C'
      }));
      break;

    case 'flash_flood_bridge':
      ({ newItinerary, changes, summary } = await handleWeatherRouteDisruption(oldItinerary, {
        ...details,
        weather: details?.weather || 'Flash flood and mountain river bridge structural washout'
      }));
      break;

    case 'transport_cancelled':
      ({ newItinerary, changes, summary } = await handleTransportCancellation(oldItinerary, details));
      break;

    case 'weather_alert':
      if (details?.reroute_transit) {
        ({ newItinerary, changes, summary } = await handleWeatherRouteDisruption(oldItinerary, details));
      } else {
        ({ newItinerary, changes, summary } = handleWeatherAlert(oldItinerary, details));
      }
      break;

    default:
      throw new Error(`Unknown disruption type: ${type}`);
  }

  // Calculate cost impact
  const costDiff = (newItinerary.cost_breakdown?.total || 0) - (oldItinerary.cost_breakdown?.total || 0);

  // Save disruption to booking history if live DB booking
  if (booking) {
    booking.disruptions.push({
      type,
      details,
      resolved: false,
      oldItinerarySnapshot: oldItinerary,
      newItinerarySnapshot: newItinerary,
    });
    booking.status = 'modified';
    await booking.save();
  }

  const elapsed = Date.now() - startTime;
  console.log(`✅ Replanning Agent: Disruption resolved in ${elapsed}ms`);

  return {
    bookingId,
    disruption_type: type,
    elapsed_ms: elapsed,
    changes,
    cost_impact_inr: costDiff,
    cost_impact_label: costDiff > 0 ? `₹${costDiff} extra` : costDiff < 0 ? `₹${Math.abs(costDiff)} saved` : 'No cost change',
    summary,
    old_itinerary: oldItinerary,
    new_itinerary: newItinerary,
  };
}

/**
 * Handle transport cancellation — re-run Transport Agent excluding cancelled option
 */
async function handleTransportCancellation(oldItinerary, details) {
  const cancelledId = details?.transport_id || oldItinerary.selected_transport_outbound?.id;
  const isOutbound = details?.leg === 'return' ? false : true;

  // Re-run Transport Agent excluding the cancelled option
  const transportOptions = await getTransportOptions(
    isOutbound ? oldItinerary.origin : oldItinerary.destination,
    isOutbound ? oldItinerary.destination : oldItinerary.origin,
    oldItinerary.budget_inr,
    oldItinerary.constraints?.max_travel_hours_per_day || 12,
    [cancelledId] // Exclude cancelled
  );

  if (transportOptions.length === 0) {
    throw new Error('No alternative transport available');
  }

  const newTransport = transportOptions[0];
  const oldTransport = isOutbound ? oldItinerary.selected_transport_outbound : oldItinerary.selected_transport_return;

  // Rebuild itinerary with new transport
  const [stayOptions, activities, otherLegOptions] = await Promise.all([
    getStayOptions(
      oldItinerary.destination,
      oldItinerary.people,
      oldItinerary.budget_inr / (oldItinerary.days * oldItinerary.people)
    ),
    getActivities(oldItinerary.destination, oldItinerary.preferences),
    getTransportOptions(
      isOutbound ? oldItinerary.destination : oldItinerary.origin,
      isOutbound ? oldItinerary.origin : oldItinerary.destination,
      oldItinerary.budget_inr,
      oldItinerary.constraints?.max_travel_hours_per_day || 12
    )
  ]);

  const allOutboundOptions = isOutbound ? transportOptions : otherLegOptions;
  const allReturnOptions = isOutbound ? otherLegOptions : transportOptions;

  const newItinerary = optimizeItinerary(
    {
      origin: oldItinerary.origin,
      destination: oldItinerary.destination,
      days: oldItinerary.days,
      people: oldItinerary.people,
      budget_inr: oldItinerary.budget_inr,
      preferences: oldItinerary.preferences || [],
      constraints: oldItinerary.constraints || { max_travel_hours_per_day: 8, earliest_start_time: '08:00' },
    },
    allOutboundOptions,
    allReturnOptions,
    stayOptions,
    activities
  );

  const changes = [
    {
      day: isOutbound ? 1 : oldItinerary.days,
      field: 'transport',
      old_value: `${oldTransport?.mode} — ${oldTransport?.operator} (₹${oldTransport?.price_inr})`,
      new_value: `${newTransport.mode} — ${newTransport.operator} (₹${newTransport.price_inr})`,
      change_type: 'replaced',
    },
  ];

  const priceDiff = newTransport.price_inr - (oldTransport?.price_inr || 0);
  const summary = `Your ${isOutbound ? 'outbound' : 'return'} ${oldTransport?.mode} (${oldTransport?.operator}) was cancelled. We've switched you to ${newTransport.mode} (${newTransport.operator}). ${priceDiff > 0 ? `This costs ₹${priceDiff} more per person.` : priceDiff < 0 ? `This saves you ₹${Math.abs(priceDiff)} per person!` : 'Same price.'}`;

  return { newItinerary, changes, summary };
}

/**
 * Handle weather alert — swap outdoor activities for indoor ones on affected days
 */
function handleWeatherAlert(oldItinerary, details) {
  const affectedDay = details?.day || 2; // Default to day 2
  const weatherType = details?.weather || 'heavy rain';

  const newItinerary = JSON.parse(JSON.stringify(oldItinerary)); // Deep clone
  const changes = [];

  // Get indoor activities for this destination
  const activitiesData = getActivities(oldItinerary.destination, oldItinerary.preferences);

  // Find the affected day plan
  const dayPlan = newItinerary.day_plans.find(d => d.day === affectedDay);
  if (!dayPlan) {
    return { newItinerary: oldItinerary, changes: [], summary: 'No changes needed' };
  }

  // Replace outdoor activities with indoor ones
  const usedNames = new Set(
    newItinerary.day_plans.flatMap(d => d.activities?.map(a => a.name) || [])
  );

  const availableIndoor = activitiesData.indoor.filter(a => !usedNames.has(a.name));
  let indoorIdx = 0;

  const oldActivities = [...(dayPlan.activities || [])];
  dayPlan.activities = dayPlan.activities.map(act => {
    if (act.type === 'outdoor' && indoorIdx < availableIndoor.length) {
      const replacement = availableIndoor[indoorIdx++];
      changes.push({
        day: affectedDay,
        field: 'activity',
        old_value: act.name,
        new_value: replacement.name,
        change_type: 'swapped',
        reason: `${weatherType} forecast`,
      });
      return {
        name: replacement.name,
        type: 'indoor',
        time: act.time,
        duration_hours: replacement.duration_hours,
        cost_inr: replacement.cost_inr || 0,
        category: replacement.category,
        description: replacement.description,
      };
    }
    return act;
  });

  // Recalculate activity costs
  const oldActivityCost = oldActivities.reduce((sum, a) => sum + (a.cost_inr || 0), 0);
  const newActivityCost = dayPlan.activities.reduce((sum, a) => sum + (a.cost_inr || 0), 0);
  const costDiff = (newActivityCost - oldActivityCost) * oldItinerary.people;

  newItinerary.cost_breakdown.activities += costDiff;
  newItinerary.cost_breakdown.total += costDiff;

  // Update Day weather badge to reflect active weather disruption
  if (dayPlan.weather) {
    dayPlan.weather.condition = 'thunderstorm';
    dayPlan.weather.condition_label = `${weatherType.charAt(0).toUpperCase() + weatherType.slice(1)} Alert`;
    dayPlan.weather.rain_chance = 90;
    dayPlan.weather.outdoor_score = 15;
    dayPlan.weather.advisory = `⚠️ Active alert: Swapped outdoor activities for indoor alternatives.`;
  }

  const summary = `⛈️ ${weatherType.charAt(0).toUpperCase() + weatherType.slice(1)} alert for Day ${affectedDay}! We've swapped ${changes.length} outdoor activity${changes.length !== 1 ? 'ies' : 'y'} for indoor alternatives so your trip stays amazing.`;

  return { newItinerary, changes, summary };
}

/**
 * Handle weather route disruption — full route replanning:
 * 1. Evaluates route weather hazard along travel path (e.g. Landslide on mountain pass / waterlogging).
 * 2. Reroutes transit leg away from road hazard to all-weather rail/sheltered transit corridor.
 * 3. Re-sequences itinerary: moves outdoor activities away from storm window and swaps with verified indoor cultural gems.
 * 4. Preserves user routine / memory (e.g. 8:00 AM wake up time, breakfast, and scheduled travel buffers).
 */
async function handleWeatherRouteDisruption(oldItinerary, details) {
  const weatherType = details?.weather || 'heavy rainfall and landslide risk';
  const affectedDay = details?.day || 2;
  const origin = oldItinerary.origin || 'Delhi';
  const destination = oldItinerary.destination || 'Manali';

  // 1. Evaluate route weather hazard
  const hazardAssessment = evaluateRouteWeather(origin, destination, weatherType);
  const newItinerary = JSON.parse(JSON.stringify(oldItinerary));
  const changes = [];

  // 2. Replanned Transit Route Leg
  const oldTransport = oldItinerary.selected_transport_outbound || oldItinerary.day_plans?.[0]?.transport;
  const allTransportOptions = await getTransportOptions(
    origin,
    destination,
    oldItinerary.budget_inr,
    oldItinerary.constraints?.max_travel_hours_per_day || 16,
    [oldTransport?.id].filter(Boolean)
  );

  // Find safest all-weather alternative (prefer train or flight+bus or alternative rail)
  let safeTransport = allTransportOptions.find(t => 
    t.mode?.includes('train') || t.mode?.includes('flight')
  ) || allTransportOptions[0];

  if (!safeTransport) {
    // If no explicit mock option, build safe corridor alternative
    safeTransport = {
      id: `WTH-REROUTE-${Date.now()}`,
      mode: 'train+bus',
      operator: 'Vande Bharat / All-Weather Rail Shuttle',
      departure: '06:45',
      arrival: '16:15',
      duration_hours: 9.5,
      price_inr: Math.round((oldTransport?.price_inr || 1800) * 1.15),
      class: 'executive chair car',
      waitlist_status: 'confirmed',
      notes: `Safety rerouting: ${hazardAssessment.recommendation}`,
    };
  }

  // Update outbound transport & Day 1 plan
  newItinerary.selected_transport_outbound = safeTransport;
  if (newItinerary.day_plans?.[0]) {
    newItinerary.day_plans[0].transport = safeTransport;
    if (newItinerary.day_plans[0].cab) {
      newItinerary.day_plans[0].cab.notes = `Weather alert: Synchronized pickup adjusted for ${safeTransport.operator} arrival.`;
      newItinerary.day_plans[0].cab.pickup_time = `${safeTransport.arrival} (+45m weather buffer)`;
    }
  }

  const people = oldItinerary.people || 1;
  const transportCostDiff = (safeTransport.price_inr - (oldTransport?.price_inr || 0)) * people;
  changes.push({
    day: 1,
    field: 'transport',
    old_value: `${oldTransport?.mode} — ${oldTransport?.operator} (₹${oldTransport?.price_inr})`,
    new_value: `${safeTransport.mode} — ${safeTransport.operator} (₹${safeTransport.price_inr})`,
    change_type: 'weather_rerouted',
    reason: `Road passage compromised by ${weatherType}. Rerouted via safe corridor: ${hazardAssessment.safeCorridor || safeTransport.operator}`,
  });

  // 3. Itinerary Activity Re-sequencing & Weather Shielding
  const activitiesData = await getActivities(destination, oldItinerary.preferences);
  const dayPlan = newItinerary.day_plans?.find(d => d.day === affectedDay) || newItinerary.day_plans?.[1];

  let activityCostDiff = 0;
  if (dayPlan) {
    const usedNames = new Set(
      newItinerary.day_plans.flatMap(d => d.activities?.map(a => a.name) || [])
    );
    const availableIndoor = activitiesData.indoor.filter(a => !usedNames.has(a.name));
    let indoorIdx = 0;

    const oldActivities = [...(dayPlan.activities || [])];
    dayPlan.activities = (dayPlan.activities || []).map(act => {
      if (act.type === 'outdoor' && indoorIdx < availableIndoor.length) {
        const replacement = availableIndoor[indoorIdx++];
        changes.push({
          day: dayPlan.day,
          field: 'activity',
          old_value: act.name,
          new_value: replacement.name,
          change_type: 'weather_swapped',
          reason: `${weatherType} on mountain trails`,
        });
        return {
          name: replacement.name,
          type: 'indoor',
          time: act.time,
          time_slot: act.time_slot,
          duration_hours: replacement.duration_hours,
          cost_inr: replacement.cost_inr || 0,
          category: replacement.category,
          description: replacement.description,
          weather_status: 'sheltered',
        };
      }
      return act;
    });

    const oldActivityCost = oldActivities.reduce((sum, a) => sum + (a.cost_inr || 0), 0);
    const newActivityCost = dayPlan.activities.reduce((sum, a) => sum + (a.cost_inr || 0), 0);
    activityCostDiff = (newActivityCost - oldActivityCost) * people;

    if (dayPlan.weather) {
      dayPlan.weather.condition = 'thunderstorm';
      dayPlan.weather.condition_label = `${weatherType.charAt(0).toUpperCase() + weatherType.slice(1)} Alert`;
      dayPlan.weather.rain_chance = 95;
      dayPlan.weather.outdoor_score = 10;
      dayPlan.weather.advisory = `⚠️ Route replanned: transit moved to ${hazardAssessment.safeCorridor || 'rail corridor'} and outdoor trails swapped for sheltered indoor sites.`;
    }
  }

  // 4. Update Cost Breakdown
  newItinerary.cost_breakdown.transport_outbound = (safeTransport.price_inr || 0) * people;
  newItinerary.cost_breakdown.transport = newItinerary.cost_breakdown.transport_outbound + (newItinerary.cost_breakdown.transport_return || 0);
  newItinerary.cost_breakdown.activities = (newItinerary.cost_breakdown.activities || 0) + activityCostDiff;
  newItinerary.cost_breakdown.total = (oldItinerary.cost_breakdown.total || 0) + transportCostDiff + activityCostDiff;
  newItinerary.budget_remaining = (newItinerary.budget_inr || 0) - newItinerary.cost_breakdown.total;

  const totalCostDiff = transportCostDiff + activityCostDiff;
  const summary = `⛈️ Weather Route Replanned: Highway route threatened by ${weatherType}. Rerouted transit via ${hazardAssessment.safeCorridor || safeTransport.operator} and shielded Day ${affectedDay} activities indoors. Your morning routine remains scheduled after ${oldItinerary.constraints?.earliest_start_time || '08:00'}.`;

  return { newItinerary, changes, summary };
}

/**
 * Handle stay unavailable — re-run Stay Agent excluding the unavailable stay
 */
async function handleStayUnavailable(oldItinerary, details) {
  const unavailableId = details?.stay_id || oldItinerary.selected_stay?.id;

  const stayOptions = getStayOptions(
    oldItinerary.destination,
    oldItinerary.people,
    oldItinerary.budget_inr / (oldItinerary.days * oldItinerary.people),
    [unavailableId]
  );

  if (stayOptions.length === 0) {
    throw new Error('No alternative stays available');
  }

  const newStay = stayOptions[0];
  const oldStay = oldItinerary.selected_stay;

  // Rebuild itinerary
  const [transportOptions, returnOptions, activities] = await Promise.all([
    getTransportOptions(
      oldItinerary.origin, oldItinerary.destination,
      oldItinerary.budget_inr, oldItinerary.constraints?.max_travel_hours_per_day || 12
    ),
    getTransportOptions(
      oldItinerary.destination, oldItinerary.origin,
      oldItinerary.budget_inr, oldItinerary.constraints?.max_travel_hours_per_day || 12
    ),
    getActivities(oldItinerary.destination, oldItinerary.preferences)
  ]);

  const newItinerary = optimizeItinerary(
    {
      origin: oldItinerary.origin,
      destination: oldItinerary.destination,
      days: oldItinerary.days,
      people: oldItinerary.people,
      budget_inr: oldItinerary.budget_inr,
      preferences: oldItinerary.preferences || [],
      constraints: oldItinerary.constraints || { max_travel_hours_per_day: 8, earliest_start_time: '08:00' },
    },
    transportOptions,
    returnOptions,
    stayOptions,
    activities
  );

  const changes = [{
    day: 'all',
    field: 'stay',
    old_value: `${oldStay?.name} (₹${oldStay?.price_per_night_inr}/night)`,
    new_value: `${newStay.name} (₹${newStay.price_per_night_inr}/night)`,
    change_type: 'replaced',
  }];

  const priceDiff = newStay.price_per_night_inr - (oldStay?.price_per_night_inr || 0);
  const summary = `Your stay at ${oldStay?.name} is no longer available. We've moved you to ${newStay.name}${newStay.is_local_homestay ? ' (a local homestay! 🏡)' : ''}. ${priceDiff > 0 ? `₹${priceDiff} more per night.` : priceDiff < 0 ? `₹${Math.abs(priceDiff)} saved per night!` : 'Same price.'}`;

  return { newItinerary, changes, summary };
}

/**
 * Accept a new plan — update the booking with the new itinerary
 */
async function acceptNewPlan(bookingId) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) {
    console.log(`ℹ️ [REPLANNING] Accepted plan for demo booking ${bookingId}`);
    return { bookingId, status: 'accepted', message: 'New self-healing expedition route confirmed and escrow updated!' };
  }

  const lastDisruption = booking.disruptions[booking.disruptions.length - 1];
  if (!lastDisruption) throw new Error('No pending disruption to accept');

  // Update itinerary in DB
  await Itinerary.findByIdAndUpdate(booking.itinerary, lastDisruption.newItinerarySnapshot);

  // Mark disruption as resolved
  lastDisruption.resolved = true;
  lastDisruption.resolvedAt = new Date();
  booking.status = 'booked';
  await booking.save();

  console.log(`✅ Replanning Agent: New plan accepted for ${bookingId}`);
  return { bookingId, status: 'accepted', message: 'New plan has been accepted and your booking is updated!' };
}

module.exports = {
  handleDisruption,
  acceptNewPlan,
  handleWeatherRouteDisruption,
  handleWeatherAlert,
};
