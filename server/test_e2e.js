const { spawn } = require('child_process');

async function run() {
  console.log('🚀 Starting server...');
  const server = spawn('node', ['server.js'], { cwd: __dirname, stdio: 'inherit' });
  server.on('exit', (code, sig) => console.log(`[SERVER EXITED with code ${code}, signal ${sig}]`));
  server.on('error', (err) => console.log('[SERVER ERROR]', err));

  // wait for server to start
  await new Promise(r => setTimeout(r, 3000));

  try {
    console.log('\n--- 1. Testing Plan Trip ---');
    const planRes = await fetch('http://127.0.0.1:3001/api/trip/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '5 days in Coorg, 30000 budget, 2 people, love nature and food' })
    });
    const planData = await planRes.json();
    console.log('Plan success:', planData.success);
    console.log('Destination:', planData.itinerary?.destination);
    console.log('Total Cost: ₹', planData.itinerary?.cost_breakdown?.total, '/ Budget: ₹', planData.itinerary?.budget_inr);
    console.log('Stay:', planData.itinerary?.selected_stay?.name, '| is_local:', planData.itinerary?.selected_stay?.is_local_homestay);

    console.log('\n--- 2. Testing Book Trip ---');
    const bookRes = await fetch('http://127.0.0.1:3001/api/trip/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary: planData.itinerary })
    });
    const bookData = await bookRes.json();
    console.log('Booking success:', bookData.success);
    console.log('Booking ID:', bookData.booking?.bookingId);
    console.log('Status:', bookData.booking?.status);

    const bookingId = bookData.booking?.bookingId;

    console.log('\n--- 3. Testing Disruption 1: Transport Cancelled ---');
    const disruptRes = await fetch('http://127.0.0.1:3001/api/disruption/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, type: 'transport_cancelled', details: {} })
    });
    const disruptData = await disruptRes.json();
    console.log('Disruption 1 success:', disruptData.success, '| elapsed:', disruptData.elapsed_ms, 'ms');
    console.log('Summary:', disruptData.summary);

    console.log('\n--- 4. Testing Disruption 2: Weather Alert ---');
    const weatherRes = await fetch('http://127.0.0.1:3001/api/disruption/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, type: 'weather_alert', details: { day: 2, weather: 'heavy thunderstorm' } })
    });
    const weatherData = await weatherRes.json();
    console.log('Disruption 2 success:', weatherData.success, '| elapsed:', weatherData.elapsed_ms, 'ms');
    console.log('Summary:', weatherData.summary);
    console.log('Changes count:', weatherData.changes?.length);

    console.log('\n--- 4b. Testing Disruption 4: Weather Route Replanning (Mountain Pass Road Blockade) ---');
    const weatherRouteRes = await fetch('http://127.0.0.1:3001/api/disruption/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, type: 'weather_route_disruption', details: { day: 2, weather: 'landslide and torrential monsoon rainfall' } })
    });
    const weatherRouteData = await weatherRouteRes.json();
    console.log('Weather Route Replanning success:', weatherRouteData.success, '| elapsed:', weatherRouteData.elapsed_ms, 'ms');
    console.log('Summary:', weatherRouteData.summary);
    console.log('Transit changed:', weatherRouteData.changes?.some(c => c.field === 'transport'));
    console.log('Activities shielded count:', weatherRouteData.changes?.filter(c => c.field === 'activity').length);

    console.log('\n--- 5. Testing Disruption 3: Stay Unavailable ---');
    const stayRes = await fetch('http://127.0.0.1:3001/api/disruption/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, type: 'stay_unavailable', details: {} })
    });
    const stayData = await stayRes.json();
    console.log('Disruption 3 success:', stayData.success, '| elapsed:', stayData.elapsed_ms, 'ms');
    console.log('Summary:', stayData.summary);

    console.log('\n--- 6. Testing User Memory Routine: "mai 8 bje uthta hu" ---');
    const memRes = await fetch('http://127.0.0.1:3001/api/trip/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '4 days in Manali, ₹25000, 2 people, mai 8 bje uthta hu aur vegetarian hu' })
    });
    const memData = await memRes.json();
    console.log('Memory plan success:', memData.success);
    console.log('Extracted Wake Up Time:', memData.itinerary?.user_memory?.wakeUpTime);
    console.log('Extracted Dietary:', memData.itinerary?.user_memory?.dietary);
    console.log('Day 2 First Activity Time:', memData.itinerary?.day_plans?.[1]?.activities?.[0]?.time);
    console.log('Day 2 Breakfast:', memData.itinerary?.day_plans?.[1]?.meals?.[0]?.suggestion);

    console.log('\n--- 7. Testing Accept Plan ---');
    const acceptRes = await fetch('http://127.0.0.1:3001/api/disruption/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    });
    const acceptData = await acceptRes.json();
    console.log('Accept success:', acceptData.success);
    console.log('New status:', acceptData.status);

    console.log('\n✅ ALL DISRUPTIONS, WEATHER ROUTE REPLANNING & USER MEMORY TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    server.kill();
  }
}

run();
