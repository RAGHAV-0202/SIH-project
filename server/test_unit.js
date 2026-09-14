require('dotenv').config();
const { parseIntent, extractMemoryHeuristics } = require('./agents/intentAgent');
const { evaluateRouteWeather, getDestinationWeather } = require('./agents/weatherAgent');
const { optimizeItinerary } = require('./agents/optimizer');
const { getTransportOptions } = require('./agents/transportAgent');
const { getStayOptions } = require('./agents/stayAgent');
const { getActivities } = require('./agents/activityAgent');

async function testUnit() {
  console.log('=== TEST 1: Heuristic & Intent Routine Extraction ("mai 8 bje uthta hu") ===');
  const prompt1 = '4 days in Manali, 25000 budget, 2 people, mai 8 bje uthta hu aur vegetarian hu';
  const mem1 = extractMemoryHeuristics(prompt1);
  console.log('Extracted memory:', mem1);
  if (mem1.wakeUpTime !== '08:00') throw new Error(`Expected 08:00, got ${mem1.wakeUpTime}`);
  if (!mem1.dietary.includes('vegetarian')) throw new Error('Expected vegetarian in dietary');

  const intent1 = await parseIntent(prompt1);
  console.log('Intent parsed wakeUpTime:', intent1.user_memory?.wakeUpTime);
  console.log('Intent parsed earliest_start_time:', intent1.constraints?.earliest_start_time);
  if (intent1.constraints?.earliest_start_time !== '08:00') throw new Error('Earliest start time not 08:00');

  console.log('\n=== TEST 2: Optimizer with 8:00 AM Wake Up Routine ===');
  const transportOut = await getTransportOptions('Delhi', 'Manali', 25000, 14);
  const transportRet = await getTransportOptions('Manali', 'Delhi', 25000, 14);
  const stays = await getStayOptions('Manali', 2, 2500);
  const acts = await getActivities('Manali', ['nature']);

  const itinerary = await optimizeItinerary(intent1, transportOut, transportRet, stays, acts);
  console.log('Day 2 Routine:', itinerary.day_plans[1].routine);
  console.log('Day 2 First Activity Time:', itinerary.day_plans[1].activities[0]?.time);
  console.log('Day 2 Breakfast:', itinerary.day_plans[1].meals[0]?.suggestion);

  if (itinerary.day_plans[1].routine?.wake_up_time !== '08:00') throw new Error('Routine wake up time mismatch');
  if (itinerary.day_plans[1].activities[0]?.time !== '09:00') throw new Error(`Expected first activity at 09:00, got ${itinerary.day_plans[1].activities[0]?.time}`);
  if (!itinerary.day_plans[1].meals[0]?.suggestion.includes('Pure Veg')) throw new Error('Expected Pure Veg in breakfast');

  console.log('\n=== TEST 3: Weather Route Safety Hazard Evaluation ===');
  const hazard = evaluateRouteWeather('Delhi', 'Manali', 'torrential monsoon and landslide risk');
  console.log('Hazard assessment:', hazard);
  if (!hazard.isHazardous) throw new Error('Expected route to be hazardous');
  if (!hazard.safeCorridor) throw new Error('Expected safe corridor recommendation');

  console.log('\n=== TEST 4: Weather Route Replanning Execution ===');
  const { handleWeatherRouteDisruption } = require('./agents/replanningAgent');
  const replanResult = await handleWeatherRouteDisruption(itinerary, {
    day: 2,
    weather: 'landslide on mountain highway and torrential rain',
  });
  console.log('Summary:', replanResult.summary);
  console.log('Changes count:', replanResult.changes.length);
  console.log('Transit change:', replanResult.changes.find(c => c.field === 'transport'));
  console.log('Activity changes:', replanResult.changes.filter(c => c.field === 'activity').length);

  if (!replanResult.changes.some(c => c.field === 'transport')) {
    throw new Error('Expected transport reroute in weather route replanning');
  }

  console.log('\n=== TEST 5: Women & Solo Traveler Safety Scorecard ===');
  const safety = itinerary.safety_scorecard;
  console.log('Safety index:', safety.safety_index);
  console.log('Status label:', safety.status_label);
  console.log('Badges count:', safety.badges?.length);
  console.log('Emergency police hotline:', safety.emergency_directory?.police);
  console.log('Women helpline:', safety.emergency_directory?.women_helpline);

  if (!safety || safety.safety_index < 75) {
    throw new Error('Invalid safety scorecard');
  }
  if (!safety.emergency_directory?.women_helpline) {
    throw new Error('Missing women emergency helpline');
  }

  console.log('\n🎉 ALL IN-PROCESS UNIT TESTS PASSED!');
}

testUnit().catch(err => {
  console.error('❌ Unit test failed:', err);
  process.exit(1);
});
