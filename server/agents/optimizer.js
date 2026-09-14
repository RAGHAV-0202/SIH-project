/**
 * Optimizer — deterministic allocation logic (greedy/knapsack-style).
 * No LLM calls. Pure algorithmic optimization.
 *
 * Algorithm:
 * 1. Select best transport (outbound + return) within budget
 * 2. Select best stay (local-biased) within remaining budget
 * 3. Allocate remaining budget across days for activities + food + local travel
 * 4. Build day-by-day itinerary respecting constraints
 */

const { getDestinationWeather, getDestinationWeatherAsync } = require('./weatherAgent');
const { evaluateSafety } = require('./safetyAgent');

async function optimizeItinerary(constraints, transportOptions, returnTransportOptions, stayOptions, activities) {
  const {
    origin,
    destination,
    days,
    people,
    budget_inr,
    preferences,
    constraints: { max_travel_hours_per_day, earliest_start_time },
    user_memory = {},
  } = constraints;

  // Traveler Memory & Routine Personalization
  const effectiveWakeUpTime = user_memory?.wakeUpTime || earliest_start_time || '08:00';
  const wakeHour = parseInt(effectiveWakeUpTime.split(':')[0] || '8', 10);
  const isVegetarian = user_memory?.dietary?.some(d => d.toLowerCase().includes('veg'));
  const travelPace = user_memory?.pace || 'moderate';
  const maxActivitiesPerDay = travelPace === 'relaxed' ? 2 : travelPace === 'fast' ? 4 : 3;

  // ─── Step 1: Select Transport (budget-aware) ─────────────────
  // Max 50% of budget for transport (both legs combined)
  const maxTransportBudget = budget_inr * 0.50;

  // Try best-scored confirmed transport that fits budget
  const confirmedOutbound = transportOptions.filter(t => t.waitlist_status === 'confirmed');
  const confirmedReturn = returnTransportOptions.filter(t => t.waitlist_status === 'confirmed');

  let selectedOutbound = null;
  let selectedReturn = null;

  // Find best combo that fits in transport budget
  for (const out of confirmedOutbound) {
    for (const ret of confirmedReturn) {
      if ((out.price_inr + ret.price_inr) * people <= maxTransportBudget) {
        if (!selectedOutbound || (out.score + ret.score) > (selectedOutbound.score + selectedReturn.score)) {
          selectedOutbound = out;
          selectedReturn = ret;
        }
      }
    }
  }

  // Fallback: if no combo fits, pick cheapest confirmed options
  if (!selectedOutbound) {
    selectedOutbound = confirmedOutbound.sort((a, b) => a.price_inr - b.price_inr)[0] || transportOptions[0];
    selectedReturn = confirmedReturn.sort((a, b) => a.price_inr - b.price_inr)[0] || returnTransportOptions[0];
  }

  if (!selectedOutbound || !selectedReturn) {
    throw new Error('No transport options available for this route');
  }

  const transportCost = (selectedOutbound.price_inr + selectedReturn.price_inr) * people;

  // ─── Step 2: Select Stay (local-biased, budget-aware) ────────
  const stayNights = days - 1; // First day is travel, last day has checkout + return
  const remainingAfterTransport = budget_inr - transportCost;
  // Allocate up to 40% of total budget for stay, but at least what's left after transport
  const maxStayBudget = Math.min(remainingAfterTransport * 0.55, budget_inr * 0.40);
  const maxPerNight = Math.max(maxStayBudget / (stayNights * people), 500); // min ₹500/night

  // Filter stays within budget — use a generous 1.2x multiplier so local stays aren't excluded
  let affordableStays = stayOptions.filter(s => s.price_per_night_inr <= maxPerNight * 1.5);
  if (affordableStays.length === 0) {
    // If none affordable, take cheapest
    affordableStays = [...stayOptions].sort((a, b) => a.price_per_night_inr - b.price_per_night_inr);
  }

  // STRONG LOCAL BIAS: if top pick is local, always use it even if slightly over budget
  // We'll reduce food budget to compensate — local experience > restaurant splurge
  let selectedStay = affordableStays[0];
  const topLocalStay = stayOptions.find(s => s.is_local_homestay && s.price_per_night_inr <= maxPerNight * 2.0);
  if (topLocalStay && selectedStay && !selectedStay.is_local_homestay) {
    // Switch to local if its cost fits within budget after adjusting food
    const localCost = topLocalStay.price_per_night_inr * stayNights * people;
    const cheapCost = selectedStay.price_per_night_inr * stayNights * people;
    const extraCost = localCost - cheapCost;
    const remainingAfterAll = remainingAfterTransport - cheapCost;
    if (extraCost <= remainingAfterAll * 0.3) {
      // Local stay is affordable — prefer it
      selectedStay = topLocalStay;
    }
  }

  const stayRooms = Math.max(1, Math.ceil(people / 2));
  const stayCost = selectedStay.price_per_night_inr * stayNights * stayRooms;

function calculateDynamicCabFare(destination, people = 2, selectedTransport = null) {
  const d = (destination || '').toLowerCase();
  
  // Base fare per vehicle segment
  let baseTransferFare = 650;

  // 1. High-altitude / remote Himalayan passes & valleys (requires 4x4 or high-clearance SUV)
  if (d.includes('spiti') || d.includes('kaza') || d.includes('ladakh') || d.includes('leh') || d.includes('zanskar') || d.includes('kinnaur')) {
    baseTransferFare = 1400;
  } else if (d.includes('manali') || d.includes('kullu') || d.includes('shimla') || d.includes('dharamshala') || d.includes('kasol') || d.includes('meghalaya') || d.includes('shillong')) {
    baseTransferFare = 850;
  } else if (d.includes('goa') || d.includes('mumbai') || d.includes('bangalore') || d.includes('delhi') || d.includes('hyderabad') || d.includes('chennai') || d.includes('kolkata')) {
    // Metro / broad tourist coastal territory
    baseTransferFare = 800;
  } else if (d.includes('jaipur') || d.includes('udaipur') || d.includes('varanasi') || d.includes('agra') || d.includes('rishikesh') || d.includes('amritsar')) {
    // Heritage plains / tier-2 transit hub
    baseTransferFare = 550;
  }

  // 2. Adjust for group size: if >4 travelers, requires larger cab (Innova / Tempo Traveler)
  const vehicleMultiplier = people > 4 ? 1.75 : (people > 2 ? 1.25 : 1.0);
  
  return Math.round(baseTransferFare * vehicleMultiplier);
}

  const cabFare = calculateDynamicCabFare(destination, people, selectedOutbound);
  const totalCabCost = cabFare * 2; // Inbound transfer + Return transfer

  // ─── Step 3: Budget Allocation ───────────────────────────────
  const remainingBudget = budget_inr - transportCost - stayCost - totalCabCost;
  
  // Dynamic daily food cost: calibrated from activity agent, adjusted for dietary preference
  const rawFoodDaily = (activities.estimated_daily_food_cost && activities.estimated_daily_food_cost > 0)
    ? activities.estimated_daily_food_cost
    : (isVegetarian ? 500 : 650);
  
  const dailyFoodCost = rawFoodDaily * people;
  
  // Dynamic daily local travel: calibrated from destination transit density
  const dailyLocalTravel = (activities.estimated_daily_local_travel && activities.estimated_daily_local_travel > 0)
    ? activities.estimated_daily_local_travel
    : 350;
    
  const totalFoodCost = dailyFoodCost * days;
  const totalLocalTravel = dailyLocalTravel * Math.max(1, days - 1); // Local sightseeing between transit days

  const activityBudget = Math.max(0, remainingBudget - totalFoodCost - totalLocalTravel);

  // ─── Step 4: Build Day-by-Day Itinerary ──────────────────────
  const dayPlans = [];
  const usedActivities = new Set();

  // Helper: pick activities for a day within budget
  function pickActivitiesForDay(availableList, budgetRemaining, maxHours, isOutdoor = true) {
    const selected = [];
    let hoursUsed = 0;
    let costUsed = 0;

    for (const act of availableList) {
      if (usedActivities.has(act.name)) continue;
      if (hoursUsed + act.duration_hours > maxHours) continue;
      if (costUsed + (act.cost_inr || 0) > budgetRemaining) continue;

      selected.push({
        name: act.name,
        type: isOutdoor ? 'outdoor' : 'indoor',
        place_type: act.place_type || (act.category === 'culture' || (act.cost_inr === 0 && act.duration_hours >= 2) ? 'Hidden Gem' : 'Attraction'),
        duration_hours: act.duration_hours,
        cost_inr: act.cost_inr || 0,
        category: act.category,
        description: act.description,
      });

      usedActivities.add(act.name);
      hoursUsed += act.duration_hours;
      costUsed += act.cost_inr || 0;

      if (selected.length >= maxActivitiesPerDay) break; // Respect traveler pace
    }

    return { selected, totalCost: costUsed, hoursUsed };
  }

  let totalActivityCost = 0;
  const activityBudgetPerDay = activityBudget / Math.max(days - 1, 1);

  // Generate start date (today + 7 days as a future trip)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);

  // Generate destination climate & day-by-day weather forecast (Live OpenWeather with fallback)
  const destinationWeather = await getDestinationWeatherAsync(destination, startDate, days);

  for (let day = 1; day <= days; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day - 1);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayWeather = destinationWeather.day_forecasts?.[day - 1] || null;

    const dayPlan = {
      day,
      date: dateStr,
      routine: {
        wake_up_time: effectiveWakeUpTime,
        label: `Wake up at ${effectiveWakeUpTime} · Morning routine & breakfast`,
        first_activity_time: `${String(wakeHour + 1).padStart(2, '0')}:00`,
      },
      weather: dayWeather,
      transport: null,
      cab: null,
      stay: null,
      activities: [],
      meals: [],
    };

    // Day 1: Travel day (outbound)
    if (day === 1) {
      dayPlan.transport = {
        mode: selectedOutbound.mode,
        operator: selectedOutbound.operator,
        departure: selectedOutbound.departure,
        arrival: selectedOutbound.arrival,
        duration_hours: selectedOutbound.duration_hours,
        price_inr: selectedOutbound.price_inr,
        class: selectedOutbound.class,
        status: selectedOutbound.waitlist_status,
        transport_id: selectedOutbound.id,
        notes: selectedOutbound.notes,
      };

      // Synchronized Last-Mile Cab Transfer
      dayPlan.cab = {
        id: `CAB-ARR-${day}`,
        type: 'synchronized_transfer',
        provider: 'Local Taxi Union / Verified Dispatch',
        pickup: `${selectedOutbound.mode?.includes('flight') ? 'Airport Terminal' : selectedOutbound.mode?.includes('train') ? 'Railway Station' : 'Bus Terminal'}`,
        dropoff: selectedStay.name,
        pickup_time: `${selectedOutbound.arrival} (+30m buffer)`,
        fare_inr: cabFare,
        status: 'confirmed',
        notes: `Driver scheduled to meet ${people} traveler${people > 1 ? 's' : ''} on ${selectedOutbound.operator} arrival.`
      };

      dayPlan.stay = {
        name: selectedStay.name,
        type: selectedStay.type,
        price_per_night_inr: selectedStay.price_per_night_inr,
        is_local_homestay: selectedStay.is_local_homestay,
        local_owner_name: selectedStay.local_owner_name,
        stay_id: selectedStay.id,
      };

      // Limited activities on travel day (depending on arrival time)
      const arrivalHour = parseInt(selectedOutbound.arrival?.split(':')[0] || '18');
      const availableHours = Math.max(0, 21 - arrivalHour); // Until 9 PM

      if (availableHours >= 1.5) {
        // Pick 1 light activity
        const { selected, totalCost } = pickActivitiesForDay(
          [...activities.indoor, ...activities.outdoor],
          activityBudgetPerDay,
          availableHours
        );
        dayPlan.activities = selected.slice(0, 1).map(act => ({
          ...act,
          type: act.type || (activities.indoor.some(i => i.name === act.name) ? 'indoor' : 'outdoor'),
          weather_status: 'ideal',
          time_slot: 'Evening (07:00 PM - 09:30 PM)',
          time: '19:00'
        }));
        totalActivityCost += totalCost;
      }

      dayPlan.meals = [
        { type_name: 'dinner', suggestion: `Try ${activities.food_specialties[0] || 'local cuisine'}`, estimated_cost_inr: Math.round(dailyFoodCost / 3 * 1.2 / people) },
      ];
    }
    // Last day: Return travel
    else if (day === days) {
      dayPlan.transport = {
        mode: selectedReturn.mode,
        operator: selectedReturn.operator,
        departure: selectedReturn.departure,
        arrival: selectedReturn.arrival,
        duration_hours: selectedReturn.duration_hours,
        price_inr: selectedReturn.price_inr,
        class: selectedReturn.class,
        status: selectedReturn.waitlist_status,
        transport_id: selectedReturn.id,
        notes: selectedReturn.notes,
      };

      // Synchronized Return Cab Transfer
      dayPlan.cab = {
        id: `CAB-DEP-${day}`,
        type: 'synchronized_transfer',
        provider: 'Local Taxi Union / Verified Dispatch',
        pickup: selectedStay.name,
        dropoff: `${selectedReturn.mode?.includes('flight') ? 'Airport Terminal' : selectedReturn.mode?.includes('train') ? 'Railway Station' : 'Departure Bay'}`,
        pickup_time: `${selectedReturn.departure} (-90m check-in)`,
        fare_inr: cabFare,
        status: 'confirmed',
        notes: 'Scheduled departure pickup from homestay.'
      };

      // Morning activity before checkout
      const departureHour = parseInt(selectedReturn.departure?.split(':')[0] || '12');
      const morningStart = parseInt(earliest_start_time?.split(':')[0] || '8');
      const availableHours = Math.max(0, departureHour - morningStart - 1);

      if (availableHours >= 1.5) {
        const { selected, totalCost } = pickActivitiesForDay(
          [...activities.outdoor, ...activities.indoor],
          activityBudgetPerDay * 0.5,
          availableHours
        );
        dayPlan.activities = selected.slice(0, 1).map(act => ({
          ...act,
          type: act.type || (activities.indoor.some(i => i.name === act.name) ? 'indoor' : 'outdoor'),
          weather_status: 'ideal',
          time_slot: 'Morning (09:00 AM - 11:30 AM)',
          time: '09:00'
        }));
        totalActivityCost += totalCost;
      }

      dayPlan.meals = [
        { type_name: 'breakfast', suggestion: `${selectedStay.is_local_homestay ? 'Home-cooked breakfast at ' + selectedStay.name : 'Breakfast at hotel'}`, estimated_cost_inr: Math.round(dailyFoodCost / 4 / people) },
      ];
    }
    // Full exploration days
    else {
      dayPlan.stay = {
        name: selectedStay.name,
        type: selectedStay.type,
        price_per_night_inr: selectedStay.price_per_night_inr,
        is_local_homestay: selectedStay.is_local_homestay,
        local_owner_name: selectedStay.local_owner_name,
        stay_id: selectedStay.id,
      };

      const maxActivityHours = max_travel_hours_per_day || 8;

      // Weather-aware activity selection: if rain chance > 40%, prefer indoor shelter
      const isRainyDay = dayPlan.weather && (dayPlan.weather.rain_chance > 40 || dayPlan.weather.condition?.includes('rain'));
      const outdoorPriority = !isRainyDay && preferences.some(p => ['nature', 'adventure'].includes(p));
      const primaryList = outdoorPriority ? activities.outdoor : activities.indoor;
      const secondaryList = outdoorPriority ? activities.indoor : activities.outdoor;

      const { selected, totalCost } = pickActivitiesForDay(
        [...primaryList, ...secondaryList],
        activityBudgetPerDay,
        maxActivityHours
      );

      // Assign structured time slots to activities starting AFTER wake up & breakfast
      const slotTemplates = [
        `Morning (${String(wakeHour + 1).padStart(2, '0')}:00 AM - 01:00 PM)`,
        'Afternoon (02:00 PM - 06:00 PM)',
        'Evening (07:00 PM - 09:30 PM)',
      ];
      let currentHour = wakeHour + 1; // After wake-up & breakfast
      dayPlan.activities = selected.map((act, actIdx) => {
        const time = `${String(currentHour).padStart(2, '0')}:00`;
        const time_slot = slotTemplates[Math.min(actIdx, slotTemplates.length - 1)];
        currentHour += act.duration_hours + 0.5; // 30 min buffer between activities
        const actType = act.type || (activities.indoor.some(i => i.name === act.name) ? 'indoor' : 'outdoor');
        return {
          ...act,
          type: actType,
          weather_status: isRainyDay ? (actType === 'indoor' ? 'sheltered' : 'rain_risk') : 'ideal',
          time,
          time_slot,
        };
      });

      totalActivityCost += totalCost;

      // Meals for the day tailored to dietary preferences
      const foodIndex = (day - 1) % activities.food_specialties.length;
      const vegPrefix = isVegetarian ? 'Pure Veg: ' : '';
      dayPlan.meals = [
        { type_name: 'breakfast', suggestion: selectedStay.is_local_homestay ? `${vegPrefix}Home-cooked breakfast at ${selectedStay.name}` : `${vegPrefix}Fresh morning breakfast at accommodation`, estimated_cost_inr: Math.round(dailyFoodCost / 4 / people) },
        { type_name: 'lunch', suggestion: `${vegPrefix}Try ${activities.food_specialties[foodIndex] || 'local cuisine'}`, estimated_cost_inr: Math.round(dailyFoodCost / 3 / people) },
        { type_name: 'dinner', suggestion: `${vegPrefix}Try ${activities.food_specialties[(foodIndex + 1) % activities.food_specialties.length] || 'local dinner'}`, estimated_cost_inr: Math.round(dailyFoodCost / 3 / people) },
      ];
    }

    dayPlans.push(dayPlan);
  }

  // ─── Step 5: Cost Breakdown ──────────────────────────────────
  const costBreakdown = {
    transport_outbound: selectedOutbound.price_inr * people,
    transport_return: selectedReturn.price_inr * people,
    last_mile_cabs: totalCabCost,
    stay: stayCost,
    food: totalFoodCost,
    activities: totalActivityCost * people,
    local_travel: totalLocalTravel,
    total: 0,
  };
  costBreakdown.total = Object.values(costBreakdown).reduce((sum, val) => sum + val, 0) - costBreakdown.total;

  // Ensure we're strictly within budget (enforce knapsack constraint)
  if (costBreakdown.total > budget_inr) {
    console.log(`⚠️  Optimizer: Total ${costBreakdown.total} exceeds budget ${budget_inr}, adjusting activities and buffers...`);
    let overBy = costBreakdown.total - budget_inr;

    // Step A: Replace paid activities with free cultural gems or trim them
    for (const dp of dayPlans) {
      if (overBy <= 0) break;
      if (!dp.activities) continue;
      for (let i = dp.activities.length - 1; i >= 0; i--) {
        const act = dp.activities[i];
        if ((act.cost_inr || 0) > 0) {
          const actTotal = (act.cost_inr || 0) * people;
          // Look for an unused free alternative
          const freeAlt = [...activities.outdoor, ...activities.indoor].find(
            a => (a.cost_inr === 0 || !a.cost_inr) && !usedActivities.has(a.name)
          );
          if (freeAlt) {
            usedActivities.add(freeAlt.name);
            dp.activities[i] = {
              name: freeAlt.name,
              type: 'outdoor',
              place_type: freeAlt.place_type || 'Hidden Gem',
              duration_hours: freeAlt.duration_hours,
              cost_inr: 0,
              category: freeAlt.category,
              description: freeAlt.description,
              time: act.time,
              time_slot: act.time_slot,
            };
          } else {
            dp.activities.splice(i, 1);
          }
          totalActivityCost -= (act.cost_inr || 0);
          costBreakdown.activities = Math.max(0, totalActivityCost * people);
          overBy -= actTotal;
          if (overBy <= 0) break;
        }
      }
    }

    // Step B: If still over, scale food down toward baseline
    if (overBy > 0) {
      const foodDeduction = Math.min(overBy, costBreakdown.food * 0.35);
      costBreakdown.food -= foodDeduction;
      overBy -= foodDeduction;
    }

    // Step C: If still over, scale local travel
    if (overBy > 0) {
      const travelDeduction = Math.min(overBy, costBreakdown.local_travel * 0.4);
      costBreakdown.local_travel -= travelDeduction;
      overBy -= travelDeduction;
    }

    costBreakdown.total = Object.entries(costBreakdown)
      .filter(([key]) => key !== 'total')
      .reduce((sum, [, val]) => sum + val, 0);
  }

  const result = {
    origin,
    destination,
    days,
    people,
    budget_inr,
    preferences,
    constraints: { max_travel_hours_per_day, earliest_start_time: effectiveWakeUpTime },
    user_memory: {
      wakeUpTime: effectiveWakeUpTime,
      dietary: user_memory?.dietary || (isVegetarian ? ['vegetarian'] : ['any']),
      pace: travelPace,
      extracted_notes: user_memory?.extracted_notes || [],
    },
    day_plans: dayPlans,
    cost_breakdown: costBreakdown,
    selected_transport_outbound: selectedOutbound,
    selected_transport_return: selectedReturn,
    selected_stay: selectedStay,
    weather: destinationWeather,
    budget_remaining: Math.max(0, budget_inr - costBreakdown.total),
    local_pick: selectedStay.is_local_homestay ? {
      name: selectedStay.name,
      owner: selectedStay.local_owner_name,
      why: `Supporting local ${selectedStay.type} run by ${selectedStay.local_owner_name}. ${selectedStay.description}`,
    } : null,
    safety_scorecard: evaluateSafety(
      destination,
      dayPlans,
      selectedStay,
      selectedOutbound,
      user_memory
    ),
  };

  console.log(`✅ Optimizer: Itinerary built — ${days} days, total ₹${costBreakdown.total} / ₹${budget_inr} budget`);
  return result;
}

module.exports = { optimizeItinerary };
