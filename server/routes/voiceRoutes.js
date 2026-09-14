const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getGroqClient, callGroqWithFallback } = require('../utils/groqClient');
const { toFile } = require('groq-sdk');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

/**
 * POST /api/voice/transcribe-audio
 * Accepts audio recording from client, uses Groq Whisper model (whisper-large-v3)
 * to accurately transcribe speech in English or Hindi.
 */
router.post('/transcribe-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No audio file received' });
    }

    const language = (req.body.language || 'en').toLowerCase();
    const groq = getGroqClient();

    const file = await toFile(
      req.file.buffer,
      req.file.originalname || 'speech.webm',
      { type: req.file.mimetype || 'audio/webm' }
    );

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language: language === 'hi' ? 'hi' : 'en',
      response_format: 'json',
      temperature: 0.0,
    });

    res.json({
      success: true,
      text: transcription.text || '',
    });
  } catch (error) {
    console.error('⚠️ Groq Whisper transcription error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Speech transcription failed',
    });
  }
});

/**
 * POST /api/voice/transcribe-synthesize
 * Accepts user transcript, previous conversation history, and current accumulated plan.
 * Uses Groq multi-model fallback to extract structured parameters and dynamically generate the next question.
 */
router.post('/transcribe-synthesize', async (req, res) => {
  const { transcript = '', currentPlan = {}, language = 'EN' } = req.body;
  const isHindi = (language || '').toUpperCase() === 'HI';

  // If user has not spoken or provided anything yet, return initial greeting question
  if (!transcript || !transcript.trim()) {
    const defaultQuestion = isHindi
      ? 'नमस्ते! आप कहाँ घूमना चाहते हैं? (Where would you like to explore?)'
      : 'Where would you like to explore? Tell me your dream destination!';

    return res.json({
      success: true,
      data: {
        destination: currentPlan.destination || null,
        days: currentPlan.days || null,
        people: currentPlan.people || null,
        budget: currentPlan.budget || null,
        lodgingMode: currentPlan.lodgingMode || null,
        vibe: currentPlan.vibe || null,
      },
      nextQuestion: defaultQuestion,
      isReady: false,
    });
  }

  try {
    const prompt = `You are Wandr AI, an interactive voice and multimodal travel intake assistant for Indian trips.
The user is speaking or typing their trip preferences.

Current known details so far:
- Destination: ${currentPlan.destination || 'Not provided'}
- Duration (days): ${currentPlan.days ? currentPlan.days + ' days' : 'Not provided'}
- Travelers: ${currentPlan.people ? currentPlan.people + ' travelers' : 'Not provided'}
- Budget (INR): ${currentPlan.budget ? '₹' + currentPlan.budget : 'Not provided'}
- Lodging preference: ${currentPlan.lodgingMode || 'Not provided'}
- Style/vibe: ${currentPlan.vibe || 'Not provided'}

User's new message: "${transcript}"

INSTRUCTIONS:
1. Extract any newly provided parameters from the user's message:
   - destination: Capitalized city, town, valley, or state (e.g. "Chandigarh", "Coorg", "Spiti Valley", "Goa", "Rishikesh", "Jaipur", "Manali", "Meghalaya"). Do not include words like "trip" or "tour".
   - days: Duration in integer days (e.g. "2 days", "a weekend" -> 2, "4 days" -> 4).
   - people: Integer traveler count (e.g. "for 3 people" -> 3, "solo" -> 1, "couple" -> 2, "4 friends" -> 4).
   - budget: Total budget in Indian Rupees as integer (e.g. "25000 rs", "₹25,000", "25k" -> 25000).
   - lodgingMode: "homestay" if homestay/village stay mentioned, "boutique" if hotel/resort/boutique mentioned.
   - vibe: Short phrase describing the travel theme (e.g. "Peaceful nature & river views", "Heritage forts and culinary walks").

2. Merge with existing details. If a field was not mentioned in the new message, keep the previous value.

3. Determine if ALL 4 core details (destination, days, people, budget) are now filled:
   - isReady: true if destination AND days AND people AND budget are all present and valid numbers/strings, false otherwise.

4. Generate the next conversational speech for the user (in ${isHindi ? 'warm, friendly Hindi / Hinglish' : 'warm, conversational, friendly English'}):
   - If destination is missing: Ask where they would like to explore.
   - If destination is set, but days or people are missing: Acknowledge the destination warmly (e.g. "Chandigarh is a fantastic choice!") and ask how many days and travelers will be going.
   - If destination, days, and people are set, but budget is missing: Acknowledge the duration & group (e.g. "Got it, 3 days for 2 travelers!") and ask what their approximate budget in Rupees is.
   - If ALL details are provided (isReady: true): Warmly say thank you, confirm all received details clearly, and confirm that everything is received and planning can now begin! (e.g. "Thank you! Everything is received. You're planning a 3-day trip to Chandigarh for 2 travelers with a budget of ₹25,000. Let's start planning your journey!")

Return ONLY valid JSON (no markdown, no backticks):
{
  "destination": "string or null",
  "days": number or null,
  "people": number or null,
  "budget": number or null,
  "lodgingMode": "homestay | boutique | null",
  "vibe": "string or null",
  "nextQuestion": "conversational spoken response from assistant",
  "isReady": true or false
}`;

    const { content, modelUsed } = await callGroqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    let cleaned = content.trim();
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];

    const parsed = JSON.parse(cleaned);

    const mergedData = {
      destination: parsed.destination || currentPlan.destination || null,
      days: parsed.days ? Number(parsed.days) : (currentPlan.days ? Number(currentPlan.days) : null),
      people: parsed.people ? Number(parsed.people) : (currentPlan.people ? Number(currentPlan.people) : null),
      budget: parsed.budget ? Number(parsed.budget) : (currentPlan.budget ? Number(currentPlan.budget) : null),
      lodgingMode: parsed.lodgingMode || currentPlan.lodgingMode || 'homestay',
      vibe: parsed.vibe || currentPlan.vibe || 'Curated local exploration',
    };

    const isReady = Boolean(
      mergedData.destination &&
      mergedData.days &&
      mergedData.people &&
      mergedData.budget
    );

    let nextQ = parsed.nextQuestion;
    if (!nextQ) {
      if (!mergedData.destination) {
        nextQ = isHindi ? 'Aap kahan ghumna chahte hain?' : 'Where would you like to explore?';
      } else if (!mergedData.days || !mergedData.people) {
        nextQ = isHindi
          ? `${mergedData.destination} ke liye kitne din aur kitne log jaa rahe hain?`
          : `Great choice! How many days and travelers are you planning for ${mergedData.destination}?`;
      } else if (!mergedData.budget) {
        nextQ = isHindi
          ? 'Aapka approximate budget kitna hai?'
          : `What is your estimated total budget in Rupees for ${mergedData.destination}?`;
      } else {
        nextQ = isHindi
          ? `धन्यवाद! सभी विवरण प्राप्त हो गए हैं। ${mergedData.destination} में ${mergedData.days} दिन, ${mergedData.people} यात्रियों के लिए ₹${mergedData.budget.toLocaleString('en-IN')} का बजट। चलिए आपकी यात्रा की योजना बनाना शुरू करते हैं!`
          : `Thank you! Everything is received. You're planning ${mergedData.days} days in ${mergedData.destination} for ${mergedData.people} travelers with a budget of ₹${mergedData.budget.toLocaleString('en-IN')}. Let's start planning!`;
      }
    }

    res.json({
      success: true,
      data: mergedData,
      nextQuestion: nextQ,
      isReady,
      modelUsed,
    });
  } catch (error) {
    console.warn('⚠️ Voice AI route error, using resilient regex heuristic:', error.message);
    
    // Heuristic fallback if LLM is unreachable
    const raw = transcript.toLowerCase();
    const destMatch = transcript.match(/(?:in|to|for)\s+([A-Za-z\s]+?)(?=[,\.\?!]|\s+(?:under|for|with|inr|rs|₹|\d|days|day)|$)/i);
    const dayMatch = transcript.match(/(\d+)\s*(?:days|day)/i);
    const peopleMatch = transcript.match(/(\d+)\s*(?:people|travelers|guests|persons)/i);
    const budgetMatch = transcript.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,6}|\d{1,2}k)/i);

    let budget = currentPlan.budget || null;
    if (budgetMatch) {
      let bRaw = budgetMatch[1].replace(/,/g, '').toLowerCase();
      if (bRaw.endsWith('k')) bRaw = parseInt(bRaw, 10) * 1000;
      budget = parseInt(bRaw, 10);
    }

    const fallbackData = {
      destination: (destMatch && destMatch[1] ? destMatch[1].trim() : currentPlan.destination) || null,
      days: dayMatch ? parseInt(dayMatch[1], 10) : (currentPlan.days || null),
      people: peopleMatch ? parseInt(peopleMatch[1], 10) : (currentPlan.people || null),
      budget: budget,
      lodgingMode: currentPlan.lodgingMode || 'homestay',
      vibe: currentPlan.vibe || 'Curated local exploration',
    };

    const isReady = Boolean(fallbackData.destination && fallbackData.days && fallbackData.people && fallbackData.budget);

    let nextQ = 'Tell me more about your trip!';
    if (!fallbackData.destination) nextQ = isHindi ? 'Aap kahan ghumna chahte hain?' : 'Where would you like to explore?';
    else if (!fallbackData.days || !fallbackData.people) nextQ = isHindi ? `${fallbackData.destination} ke liye kitne din aur kitne log?` : `How many days and travelers for ${fallbackData.destination}?`;
    else if (!fallbackData.budget) nextQ = isHindi ? 'Aapka approximate budget kitna hai?' : 'What is your estimated total budget in Rupees?';
    else nextQ = isHindi
      ? `धन्यवाद! सभी विवरण प्राप्त हो गए हैं। ${fallbackData.destination} में ${fallbackData.days} दिन, ${fallbackData.people} यात्रियों के लिए ₹${fallbackData.budget ? fallbackData.budget.toLocaleString('en-IN') : ''}। चलिए योजना शुरू करते हैं!`
      : `Thank you! Everything is received. You're planning ${fallbackData.days} days in ${fallbackData.destination} for ${fallbackData.people} travelers with a budget of ₹${fallbackData.budget ? fallbackData.budget.toLocaleString('en-IN') : ''}. Let's start planning!`;

    res.json({
      success: true,
      data: fallbackData,
      nextQuestion: nextQ,
      isReady,
      modelUsed: 'heuristic-fallback',
    });
  }
});

module.exports = router;
