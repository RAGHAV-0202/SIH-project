const { parseIntent } = require('../agents/intentAgent');
const { getTrafficConditions } = require('../agents/trafficAgent');
const { getWeather } = require('../agents/weatherAgent');
const { generateRoutes } = require('../agents/routeAgent');
const { optimizeRoutes } = require('../agents/optimizerAgent');

async function planRoutes(userInput, overrides = {}) {
  const intent = await parseIntent(userInput);
  if (overrides.origin) intent.origin = overrides.origin;
  if (overrides.destination) intent.destination = overrides.destination;
  if (overrides.mode) intent.mode = overrides.mode;
  if (overrides.payload_weight_kg) intent.payload_weight_kg = overrides.payload_weight_kg;
  if (overrides.budget) intent.budget_inr = overrides.budget;
  if (overrides.pref) intent.preferences = [overrides.pref.toLowerCase()];
  const traffic = await getTrafficConditions();
  const weather = await getWeather();
  
  const context = { traffic, weather };
  let routes = await generateRoutes(intent, context);
  routes = optimizeRoutes(routes, intent);
  
  return { intent, context, routes };
}

async function planStream(userInput, res, overrides = {}) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (step, status, message, data = null) => {
    res.write(`data: ${JSON.stringify({ step, status, message, data })}\n\n`);
  };

  try {
    sendEvent('intent', 'running', 'Understanding your request...');
    const intent = await parseIntent(userInput);
    if (overrides.mode) intent.mode = overrides.mode;
    if (overrides.payload_weight_kg) intent.payload_weight_kg = overrides.payload_weight_kg;
    sendEvent('intent', 'done', 'Request parsed', { intent });

    sendEvent('traffic', 'running', 'Checking live traffic...');
    const traffic = await getTrafficConditions();
    sendEvent('traffic', 'done', 'Traffic fetched', { traffic });

    sendEvent('weather', 'running', 'Checking weather conditions...');
    const weather = await getWeather();
    sendEvent('weather', 'done', 'Weather fetched', { weather });

    sendEvent('route', 'running', 'Generating multimodal routes...');
    let routes = await generateRoutes(intent, { traffic, weather });
    sendEvent('route', 'done', 'Routes generated');

    sendEvent('optimize', 'running', 'Optimizing and ranking routes...');
    routes = optimizeRoutes(routes, intent);
    sendEvent('optimize', 'done', 'Routes optimized', { routes });

    sendEvent('complete', 'done', 'Planning complete', { intent, context: { traffic, weather }, routes });
  } catch (error) {
    sendEvent('error', 'failed', error.message);
  } finally {
    res.end();
  }
}

module.exports = { planRoutes, planStream };
