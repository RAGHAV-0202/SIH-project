const Groq = require('groq-sdk');

function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY || 'missing_key' });
}

const GROQ_FALLBACK_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'groq/compound-mini',
  'groq/compound',
];

/**
 * Executes a Groq completion with automatic model cascading on 429 rate limit or errors.
 */
async function callGroqWithFallback({
  messages,
  temperature = 0.1,
  max_tokens = 1500,
  response_format = null,
  preferredModel = null,
}) {
  const groq = getGroqClient();
  const modelsToTry = [
    ...(preferredModel ? [preferredModel] : []),
    ...(process.env.GROQ_MODEL ? [process.env.GROQ_MODEL] : []),
    ...GROQ_FALLBACK_MODELS.filter(
      (m) => m !== preferredModel && m !== process.env.GROQ_MODEL
    ),
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const payload = {
        model,
        messages,
        temperature,
        max_tokens,
      };
      if (response_format) {
        payload.response_format = response_format;
      }

      let completion;
      try {
        completion = await groq.chat.completions.create(payload);
      } catch (innerErr) {
        // If response_format is rejected by specific model, retry without it
        if (response_format && innerErr.message && (innerErr.message.includes('response_format') || innerErr.message.includes('json_object'))) {
          delete payload.response_format;
          completion = await groq.chat.completions.create(payload);
        } else {
          throw innerErr;
        }
      }

      const content = completion.choices[0]?.message?.content;
      if (content) {
        return {
          content,
          modelUsed: model,
          completion,
        };
      }
    } catch (err) {
      lastError = err;
      const status = err.status || (err.response ? err.response.status : 'ERR');
      console.warn(`⚠️ Groq model [${model}] failed (${status}: ${err.message}). Trying next fallback model...`);
    }
  }

  throw lastError || new Error('All Groq fallback models failed');
}

module.exports = {
  getGroqClient,
  groq: {
    get chat() {
      return getGroqClient().chat;
    }
  },
  callGroqWithFallback,
  GROQ_FALLBACK_MODELS,
};
