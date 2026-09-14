const { parseIntent } = require('../agents/intentAgent');
const { getTransportOptions } = require('../agents/transportAgent');
const { getStayOptions } = require('../agents/stayAgent');
const { getActivities } = require('../agents/activityAgent');
const { optimizeItinerary } = require('../agents/optimizer');

/**
 * Planner/Orchestrator — Sequential pipeline with SSE status updates.
 * Intent → Transport → Stay → Activity → Optimizer → Response
 */

async function planTrip(userPrompt, sendStatus, userMemory = null, explicitParams = null) {
  const steps = [];
  const emit = (step, status, data = null) => {
    const entry = { step, status, timestamp: Date.now(), data };
    steps.push(entry);
    if (sendStatus) sendStatus(entry);
  };

  try {
    // ─── Step 1: Intent Agent & User Memory ──────────────────
    emit('intent', 'running');

    // Append traveler routine text and memory notes from settings as dynamic context
    let promptWithContext = userPrompt;
    if (userMemory?.routineText && typeof userMemory.routineText === 'string') {
      promptWithContext += `\n[Traveler Routine & Context from Settings]: ${userMemory.routineText}`;
    }
    if (Array.isArray(userMemory?.notes) && userMemory.notes.length > 0) {
      const activeNotes = userMemory.notes.map(n => (typeof n === 'string' ? n : n.text)).filter(Boolean);
      if (activeNotes.length > 0) {
        promptWithContext += `\n[Traveler Habit Notes]: ${activeNotes.join('; ')}`;
      }
    }

    const constraints = await parseIntent(promptWithContext);

    // Apply explicit parameters from UI if provided (overriding LLM default/hallucination)
    if (explicitParams && typeof explicitParams === 'object') {
      if (explicitParams.destination && typeof explicitParams.destination === 'string' && explicitParams.destination.trim()) {
        constraints.destination = explicitParams.destination.trim();
      }
      if (explicitParams.origin && typeof explicitParams.origin === 'string' && explicitParams.origin.trim()) {
        constraints.origin = explicitParams.origin.trim();
      }
      if (explicitParams.days && !isNaN(Number(explicitParams.days))) {
        constraints.days = Number(explicitParams.days);
      }
      if (explicitParams.people && !isNaN(Number(explicitParams.people))) {
        constraints.people = Number(explicitParams.people);
      }
      if (explicitParams.budget && !isNaN(Number(explicitParams.budget))) {
        constraints.budget_inr = Number(explicitParams.budget);
      }
    }

    // Merge explicitly provided userMemory with prompt-extracted memory
    const mergedMemory = {
      wakeUpTime: userMemory?.wakeUpTime || constraints.user_memory?.wakeUpTime || '08:00',
      dietary: Array.from(new Set([...(userMemory?.dietary || []), ...(constraints.user_memory?.dietary || [])])),
      pace: userMemory?.pace || constraints.user_memory?.pace || 'moderate',
      routineText: userMemory?.routineText || '',
      extracted_notes: Array.from(new Set([
        ...(Array.isArray(userMemory?.notes) ? userMemory.notes.map(n => typeof n === 'string' ? n : n.text) : []),
        ...(constraints.user_memory?.extracted_notes || [])
      ])),
    };
    constraints.user_memory = mergedMemory;
    constraints.constraints = constraints.constraints || {};
    constraints.constraints.earliest_start_time = mergedMemory.wakeUpTime;

    emit('intent', 'complete', {
      destination: constraints.destination,
      days: constraints.days,
      budget: constraints.budget_inr,
      people: constraints.people,
      user_memory: mergedMemory,
    });

    // ─── Step 2: Transport Agent ─────────────────────────────
    emit('transport', 'running');
    const [outboundOptions, returnOptions] = await Promise.all([
      getTransportOptions(
        constraints.origin,
        constraints.destination,
        constraints.budget_inr,
        constraints.constraints.max_travel_hours_per_day
      ),
      getTransportOptions(
        constraints.destination,
        constraints.origin,
        constraints.budget_inr,
        constraints.constraints.max_travel_hours_per_day
      )
    ]);
    emit('transport', 'complete', {
      outbound_count: outboundOptions.length,
      return_count: returnOptions.length,
      best_outbound: outboundOptions[0]?.operator,
      best_return: returnOptions[0]?.operator,
    });

    // ─── Step 3: Stay Agent ──────────────────────────────────
    emit('stay', 'running');
    const stayOptions = await getStayOptions(
      constraints.destination,
      constraints.people,
      constraints.budget_inr / (constraints.days * constraints.people)
    );
    emit('stay', 'complete', {
      count: stayOptions.length,
      top_pick: stayOptions[0]?.name,
      is_local: stayOptions[0]?.is_local_homestay,
    });

    // ─── Step 4: Activity & Weather Agent ───────────────────
    emit('activity', 'running');
    const activities = await getActivities(constraints.destination, constraints.preferences);
    emit('activity', 'complete', {
      outdoor_count: activities.outdoor.length,
      indoor_count: activities.indoor.length,
      food_specialties: activities.food_specialties.length,
      weather_monitored: true,
    });

    // ─── Step 5: Optimizer ───────────────────────────────────
    emit('optimizer', 'running');
    const itinerary = await optimizeItinerary(
      constraints,
      outboundOptions,
      returnOptions,
      stayOptions,
      activities
    );
    emit('optimizer', 'complete', {
      total_cost: itinerary.cost_breakdown.total,
      budget_remaining: itinerary.budget_remaining,
      stay_name: itinerary.selected_stay?.name,
      is_local_pick: itinerary.local_pick !== null,
      weather_summary: itinerary.weather?.summary,
    });

    // ─── Done ────────────────────────────────────────────────
    emit('done', 'complete');

    return {
      success: true,
      itinerary,
      steps,
      constraints,
      transport_options: {
        outbound: outboundOptions,
        return: returnOptions,
      },
      stay_options: stayOptions,
      activities: activities,
    };

  } catch (error) {
    emit('error', 'failed', { message: error.message });
    return {
      success: false,
      error: error.message,
      steps,
    };
  }
}

module.exports = { planTrip };
