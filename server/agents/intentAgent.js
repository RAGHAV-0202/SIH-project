const { z } = require('zod');
const { callGroqWithFallback, GROQ_FALLBACK_MODELS } = require('../utils/groqClient');

// Zod schema for validated output
const TripConstraintsSchema = z.object({
  origin: z.string().default('Delhi'),
  destination: z.string().min(1),
  days: z.coerce.number().int().min(1).max(30).default(4),
  people: z.coerce.number().int().min(1).max(20).default(2),
  budget_inr: z.coerce.number().min(1000).default(25000),
  lodging: z.string().default('homestay'),
  pace: z.string().default('moderate'),
  preferences: z.array(z.string()).default([]),
  constraints: z.object({
    max_travel_hours_per_day: z.coerce.number().min(1).max(24).default(8),
    earliest_start_time: z.string().nullish().transform(v => v || '08:00'),
  }).default({}),
  user_memory: z.object({
    wakeUpTime: z.string().nullish().transform(v => v || '08:00'),
    dietary: z.array(z.string()).nullish().transform(v => v || []),
    pace: z.string().nullish().transform(v => v || 'moderate'),
    extracted_notes: z.array(z.string()).nullish().transform(v => v || []),
  }).default({}),
});

const SYSTEM_PROMPT = `You are a world-class travel intent parser and trip extraction AI.
Given a user's natural language trip request (which may be in English, Hinglish, or shorthand), extract structured trip parameters with extreme precision and accuracy.

CRITICAL INSTRUCTIONS:
1. Output ONLY a valid JSON object matching the requested schema. No markdown backticks, no comments, no extra text.
2. DESTINATION:
   - Carefully extract the destination city/town/region/state.
   - Clean and format properly (e.g. "2 days in chandigarh" -> "Chandigarh", "coorg" -> "Coorg", "spiti" -> "Spiti Valley", "manali" -> "Manali", "jaipur" -> "Jaipur", "goa" -> "Goa", "rishikesh" -> "Rishikesh", "meghalaya" -> "Meghalaya").
   - Do NOT include filler words like "trip", "tour", "explore" in the destination name.
3. DURATION (days):
   - Extract the number of days (e.g. "2 days", "2d", "a weekend" -> 2). Default is 4 if not specified.
4. TRAVELERS (people):
   - Extract the number of travelers (e.g. "3 people" -> 3, "for 3" -> 3, "solo" -> 1, "couple" -> 2, "family of 4" -> 4). Default is 2 if not specified.
5. BUDGET (budget_inr):
   - Extract the total budget in INR. Parse expressions like "25000 rs", "₹25k", "25,000", "25000 rupees" -> 25000. Default is 25000.
6. LODGING:
   - "homestay" if homestay, village home, local stay is mentioned or default.
   - "boutique" if hotel, luxury, resort, boutique stay is mentioned.
7. PACE:
   - "relaxed" if user says "aaram se", "slow", "relaxed", "unrushed".
   - "acclimatize" if user mentions high altitude, safe, oxygen buffer, acclimatization.
   - "fast" if "express", "quick", "full speed", "fast".
   - Default is "moderate".
8. PREFERENCES:
   - Array of tags like "nature", "heritage", "food", "cafes", "culture", "adventure", "relaxation", "photography".
9. ORIGIN:
   - Carefully extract the departure/origin city if specified (e.g. "from Mumbai" -> "Mumbai", "from Bangalore" -> "Bangalore", "starting Delhi" -> "Delhi"). If origin is explicitly provided, use it. If not mentioned at all, use "Delhi".
10. USER MEMORY & ROUTINES (Hinglish/English):
   - Wake up routine (e.g. "mai 8 bje uthta hu", "wake up at 8 AM") -> earliest_start_time: "08:00", wakeUpTime: "08:00", note: "Wakes up at 08:00".
   - Food/dietary ("veg", "pure veg", "jain", "non-veg") -> dietary: ["vegetarian"] etc.

SCHEMA TEMPLATE:
{
  "origin": "Delhi",
  "destination": "Chandigarh",
  "days": 2,
  "people": 3,
  "budget_inr": 25000,
  "lodging": "homestay",
  "pace": "moderate",
  "preferences": ["city tour", "food"],
  "constraints": {
    "max_travel_hours_per_day": 8,
    "earliest_start_time": "08:00"
  },
  "user_memory": {
    "wakeUpTime": "08:00",
    "dietary": [],
    "pace": "moderate",
    "extracted_notes": []
  }
}`;

// Heuristic extractors for Hinglish and memory
function extractMemoryHeuristics(prompt) {
  const p = (prompt || '').toLowerCase();
  const notes = [];
  let wakeUpTime = null;
  let dietary = [];
  let pace = null;

  // Match wake up patterns: "mai 8 bje uthta hu", "8 baje uthta hu", "wake up at 8", "subah 8:00 baje", "8 am"
  const wakeRegexes = [
    /(?:mai|hum|me|i)?\s*(?:subah)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:bje|baje|am|o'?clock)?\s*(?:ko)?\s*(?:uth(?:ta|te|ti|na)|wake\s*up)/i,
    /(?:wake\s*up|uth(?:ta|te|ti)\s*hu|uthna)\s*(?:at|around|ko)?\s*(\d{1,2})(?::(\d{2}))?\s*(?:am|pm|bje|baje)?/i,
    /(\d{1,2})(?::(\d{2}))?\s*(?:bje|baje|am)\s*(?:ko)?\s*uth/i,
  ];

  for (const reg of wakeRegexes) {
    const match = p.match(reg);
    if (match) {
      const hour = parseInt(match[1], 10);
      const min = match[2] ? match[2] : '00';
      if (hour >= 1 && hour <= 12) {
        const formatted = `${String(hour).padStart(2, '0')}:${min}`;
        wakeUpTime = formatted;
        notes.push(`Wakes up at ${formatted}`);
        break;
      }
    }
  }

  // Dietary
  if (/(?:pure\s*veg|vegetarian|shakahari|jain)/i.test(p)) {
    dietary.push('vegetarian');
    notes.push('Prefers vegetarian food');
  } else if (/(?:non-?veg|meat|chicken)/i.test(p)) {
    dietary.push('non-vegetarian');
    notes.push('Enjoys non-vegetarian food');
  }

  // Pace
  if (/(?:aaram\s*se|slow\s*travel|relaxed|unrushed|sukoon)/i.test(p)) {
    pace = 'relaxed';
    notes.push('Prefers relaxed, unrushed travel');
  } else if (/(?:fast|quick|pack\s*everything|full\s*speed)/i.test(p)) {
    pace = 'fast';
  }

  return { wakeUpTime, dietary, pace, notes };
}

function fallbackParse(userPrompt) {
  const p = (userPrompt || '').toLowerCase();
  // Dynamic destination extraction from natural language patterns:
  // e.g. "in <Destination>", "to <Destination>", "visit <Destination>", "trip to <Destination>", "<Destination> for 3 days"
  let destination = null;

  // 1. Check preposition patterns: "in Manali", "to Varanasi", "visiting Munnar", "trip to Leh"
  const prepMatch = p.match(/(?:in|to|visit|visiting|explore|exploring|for)\s+([a-zA-Z\s]{2,25}?)(?=[,\.\?!]|\s+(?:under|for|with|inr|rs|₹|\d|days|day|budget|from|departing)|$)/i);
  if (prepMatch && prepMatch[1]) {
    const candidate = prepMatch[1].trim();
    if (!['the', 'a', 'my', 'our', 'some', 'any', 'solo', 'couple'].includes(candidate.toLowerCase())) {
      destination = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  // 2. Check prefix pattern: e.g. "4 days in Manali" or "Manali 4 days"
  if (!destination) {
    const leadMatch = p.match(/^([a-zA-Z\s]{3,20}?)(?=[,\.\?!]|\s+(?:trip|tour|\d+\s*days?|for|under|budget)|$)/i);
    if (leadMatch && leadMatch[1]) {
      const candidate = leadMatch[1].trim();
      if (!['i', 'we', 'want', 'plan', 'need', 'give', 'suggest', '4 days', '3 days', '2 days'].includes(candidate.toLowerCase())) {
        destination = candidate.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  // 3. Fallback to clean extract or prompt subject
  if (!destination) {
    // Extract first capitalized or prominent location word
    const words = (userPrompt || '').split(/[\s,]+/);
    for (const w of words) {
      if (w.length > 2 && !['days', 'budget', 'people', 'from', 'with', 'plan', 'trip', 'want'].includes(w.toLowerCase())) {
        destination = w.charAt(0).toUpperCase() + w.slice(1);
        break;
      }
    }
  }

  if (!destination) {
    destination = 'Manali';
  }

  const dayMatch = p.match(/(\d+)\s*day/i);
  const days = dayMatch ? Math.min(Math.max(parseInt(dayMatch[1], 10), 1), 30) : 4;

  const budgetMatch = p.match(/(?:₹|rs\.?|inr)?\s*(\d{4,6}|\d{1,2}k)/i);
  let budget_inr = 25000;
  if (budgetMatch) {
    let raw = budgetMatch[1].toLowerCase();
    if (raw.endsWith('k')) {
      budget_inr = parseInt(raw, 10) * 1000;
    } else {
      budget_inr = parseInt(raw, 10);
    }
  }

  const peopleMatch = p.match(/(\d+)\s*(?:people|person|traveler|travelers|pax)/i);
  const people = peopleMatch ? parseInt(peopleMatch[1], 10) : (p.includes('solo') ? 1 : 2);

  // Origin extraction: "from <Origin>" or "departing <Origin>"
  let origin = 'Delhi';
  const originMatch = p.match(/(?:from|starting from|departing from|ex-?)\s+([a-zA-Z\s]{3,20}?)(?=[,\.\?!]|\s+(?:to|in|under|for|with|inr|rs|₹|\d|days|day)|$)/i);
  if (originMatch && originMatch[1] && !['the', 'a', 'my'].includes(originMatch[1].trim().toLowerCase())) {
    const origWords = originMatch[1].trim().split(' ');
    origin = origWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  const mem = extractMemoryHeuristics(userPrompt);

  return {
    origin,
    destination,
    days,
    people,
    budget_inr,
    lodging: p.includes('hotel') ? 'boutique' : 'homestay',
    pace: mem.pace || 'moderate',
    preferences: ['nature', 'relaxation'],
    constraints: {
      max_travel_hours_per_day: 8,
      earliest_start_time: mem.wakeUpTime || '08:00',
    },
    user_memory: {
      wakeUpTime: mem.wakeUpTime || '08:00',
      dietary: mem.dietary.length > 0 ? mem.dietary : ['any'],
      pace: mem.pace || 'moderate',
      extracted_notes: mem.notes,
    },
    modelUsed: 'heuristic-fallback',
  };
}

/**
 * Main parser: uses callGroqWithFallback to prevent 429 rate limit errors
 */
async function parseIntent(userPrompt) {
  let parsed = null;
  let successfulModel = null;

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'mock-api-key') {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ];

      const startTime = Date.now();
      const { content, modelUsed } = await callGroqWithFallback({
        messages,
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      let cleaned = content.trim();
      if (cleaned.includes('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) cleaned = jsonMatch[0];

      const jsonData = JSON.parse(cleaned);
      parsed = TripConstraintsSchema.parse(jsonData);
      successfulModel = modelUsed;

      const elapsed = Date.now() - startTime;
      console.log(`✅ Intent Agent: Extracted successfully using [${modelUsed}] in ${elapsed}ms:`, {
        destination: parsed.destination,
        days: parsed.days,
        people: parsed.people,
        budget_inr: parsed.budget_inr,
      });
    } catch (err) {
      console.warn('⚠️ Intent Agent fallback chain exhausted or offline, using deterministic parser:', err.message);
    }
  }

  if (!parsed) {
    parsed = fallbackParse(userPrompt);
    successfulModel = 'deterministic-fallback';
  }

  parsed.modelUsed = successfulModel;

  // Enrich with regex-detected memory heuristics to guarantee Hinglish routine support
  const heuristics = extractMemoryHeuristics(userPrompt);
  if (heuristics.wakeUpTime) {
    parsed.constraints = parsed.constraints || {};
    parsed.constraints.earliest_start_time = heuristics.wakeUpTime;
    parsed.user_memory = parsed.user_memory || {};
    parsed.user_memory.wakeUpTime = heuristics.wakeUpTime;
    if (!parsed.user_memory.extracted_notes?.includes(`Wakes up at ${heuristics.wakeUpTime}`)) {
      parsed.user_memory.extracted_notes = [...(parsed.user_memory.extracted_notes || []), `Wakes up at ${heuristics.wakeUpTime}`];
    }
  }

  if (heuristics.dietary?.length > 0) {
    parsed.user_memory = parsed.user_memory || {};
    parsed.user_memory.dietary = Array.from(new Set([...(parsed.user_memory.dietary || []), ...heuristics.dietary]));
  }

  if (heuristics.pace) {
    parsed.user_memory = parsed.user_memory || {};
    parsed.user_memory.pace = heuristics.pace;
  }

  return parsed;
}

module.exports = { parseIntent, TripConstraintsSchema, extractMemoryHeuristics, GROQ_FALLBACK_MODELS };
