const z = require('zod');
const { callGroqWithFallback } = require('../utils/groqClient');

const CommuteRequestSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  arrival_by: z.string().nullish(),
  depart_after: z.string().nullish(),
  budget_inr: z.coerce.number().min(0).default(500),
  preferences: z.array(z.string()).default([]),
  people: z.coerce.number().int().min(1).default(1),
  luggage: z.enum(['none', 'light', 'heavy']).default('none'),
  // PS 26205 Logistics Extension
  mode: z.enum(['commute', 'delivery']).default('commute'),
  delivery_type: z.enum(['standard', 'express', 'eco_cargo', 'heavy']).default('standard'),
  payload_weight_kg: z.coerce.number().min(0.1).default(5),
  accessibility: z.object({
    wheelchair: z.boolean().default(false),
    elderly: z.boolean().default(false),
  }).default({}),
});

async function parseIntent(userInput) {
  // If GROQ_API_KEY is missing or placeholder, go straight to fast regex parser
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'missing_key' || apiKey.includes('your_') || apiKey.includes('placeholder')) {
    return fallbackRegexParser(userInput);
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are a transit and urban logistics intent parser for Delhi NCR (SIH PS 26205).
Extract commute or delivery details from user input.
Return a JSON object conforming to this schema:
{
  "origin": "string",
  "destination": "string",
  "arrival_by": "HH:MM or null",
  "depart_after": "HH:MM or null",
  "budget_inr": number,
  "preferences": ["fastest", "cheapest", "greenest", "least_walking", "accessible"],
  "people": number,
  "mode": "commute" | "delivery",
  "delivery_type": "standard" | "express" | "eco_cargo" | "heavy",
  "payload_weight_kg": number,
  "accessibility": { "wheelchair": boolean, "elderly": boolean }
}
Handle English and Hindi/Hinglish (e.g. "dwarka se cp delivery karni hai 10kg parcel"). Default mode is commute.`
      },
      { role: 'user', content: userInput }
    ];

    const { content } = await callGroqWithFallback({ messages, response_format: { type: 'json_object' } });
    const parsed = JSON.parse(content);
    return CommuteRequestSchema.parse(parsed);
  } catch (error) {
    console.warn('[IntentAgent] LLM parsing failed or skipped, using robust fallback regex parser:', error.message);
    return fallbackRegexParser(userInput);
  }
}

function fallbackRegexParser(input) {
  const lowerInput = (input || '').toLowerCase();
  let origin = 'Dwarka Sec 21';
  let destination = 'Connaught Place';

  // Priority 1: Match standard 'from <origin> to <destination>'
  const fromToMatch = lowerInput.match(/from\s+([^,]+?)\s+to\s+([^,]+?)(?:\s*,|\s+budget|\s+by|\s+preference|$)/i);
  if (fromToMatch) {
    origin = fromToMatch[1].trim();
    destination = fromToMatch[2].trim();
  } else {
    const fromMatch = lowerInput.match(/from\s+([a-z\s0-9]+?)(?:\s+to|\s+se|$)/i) || lowerInput.match(/([a-z\s0-9]+?)\s+se\s+/i);
    if (fromMatch && fromMatch[1].trim()) origin = fromMatch[1].trim();

    const toMatch = lowerInput.match(/(?:se\s+|to\s+)([a-z\s0-9]+?)(?:\s+jaana|\s+jana|\s+delivery|\s+parcel|\s+by|\s+budget|,|$)/i);
    if (toMatch && toMatch[1].trim() && !toMatch[1].trim().startsWith('get from')) {
      destination = toMatch[1].trim();
    }
  }

  let budget_inr = 500;
  const budgetMatch = lowerInput.match(/(\d+)\s*(?:rs|rupees|rupay|inr)/);
  if (budgetMatch) budget_inr = parseInt(budgetMatch[1], 10);

  const preferences = [];
  if (lowerInput.includes('fast') || lowerInput.includes('jaldi') || lowerInput.includes('express')) preferences.push('fastest');
  if (lowerInput.includes('cheap') || lowerInput.includes('sasta') || lowerInput.includes('budget')) preferences.push('cheapest');
  if (lowerInput.includes('green') || lowerInput.includes('eco') || lowerInput.includes('carbon')) preferences.push('greenest');
  if (lowerInput.includes('walk') || lowerInput.includes('paidal')) preferences.push('least_walking');

  // Detect Delivery vs Commute mode
  const isDelivery = /delivery|cargo|parcel|package|courier|bhejna|freight|dispatch|shipment|box|kg/i.test(lowerInput);
  const weightMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|grams)/);
  const payload_weight_kg = weightMatch ? parseFloat(weightMatch[1]) : 5;

  return {
    origin,
    destination,
    arrival_by: null,
    depart_after: null,
    budget_inr,
    preferences,
    people: 1,
    luggage: isDelivery ? 'heavy' : 'none',
    mode: isDelivery ? 'delivery' : 'commute',
    delivery_type: lowerInput.includes('express') ? 'express' : (lowerInput.includes('eco') ? 'eco_cargo' : 'standard'),
    payload_weight_kg,
    accessibility: { wheelchair: false, elderly: false },
  };
}

module.exports = { parseIntent, CommuteRequestSchema, fallbackRegexParser };
