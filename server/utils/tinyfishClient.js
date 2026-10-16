/**
 * TinyFish Web Tools Client for Wandr Server-Side Agents.
 * Wraps @tiny-fish/sdk search and fetch capabilities with lazy ESM import.
 */

const TIMEOUT_MS = 3500; // 3.5s max

function withTimeout(promise, ms = TIMEOUT_MS, label = 'Operation') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

let cachedClient = null;

async function getClient() {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) {
    throw new Error('TINYFISH_API_KEY environment variable is not configured');
  }

  const { TinyFish } = await import('@tiny-fish/sdk');
  cachedClient = new TinyFish({ apiKey, timeout: 3500, maxRetries: 0 });
  return cachedClient;
}

/**
 * TinySearch — live web search, returns results with title, url, snippet.
 * @param {string} query - Search query
 * @param {number} maxResults - Max results (default 5)
 * @returns {Promise<Array<{title: string, url: string, snippet: string}>>}
 */
async function tinySearch(query, maxResults = 5) {
  try {
    const client = await getClient();
    const res = await withTimeout(
      client.search.query({ query }),
      TIMEOUT_MS,
      `TinySearch "${query}"`
    );
    const results = (res.results || []).slice(0, maxResults);
    return results.map(r => ({
      title: r.title || '',
      url: r.url || '',
      snippet: r.snippet || '',
      site_name: r.site_name || '',
      date: r.date || '',
    }));
  } catch (err) {
    console.warn(`⚠️ [TinyFish Search] query "${query}" failed: ${err.message}`);
    throw err;
  }
}

/**
 * TinyFetch — fetches a URL, returns clean markdown.
 * @param {string} url - Target URL
 * @returns {Promise<string>} Clean markdown content
 */
async function tinyFetch(url) {
  try {
    const client = await getClient();
    const res = await withTimeout(
      client.fetch.getContents({
        urls: [url],
        format: 'markdown',
      }),
      TIMEOUT_MS,
      `TinyFetch "${url}"`
    );

    const item = res.results?.[0];
    if (item && item.text) {
      return item.text;
    }
    return '';
  } catch (err) {
    console.warn(`⚠️ [TinyFish Fetch] URL "${url}" failed: ${err.message}`);
    throw err;
  }
}

module.exports = {
  tinySearch,
  tinyFetch,
};
