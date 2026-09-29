/**
 * Weather Agent for CityFlow AI
 * Queries real-time OpenWeatherMap API using live API key from process.env.OPENWEATHER_API_KEY.
 * Falls back to realistic seasonal weather if network fails or key is a placeholder.
 */

async function getWeather(cityName = 'Delhi') {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey && apiKey !== 'missing_key' && !apiKey.includes('your_') && !apiKey.includes('placeholder')) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)},IN&appid=${apiKey}&units=metric`;
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });

      if (response.ok) {
        const data = await response.json();
        const main = data.weather?.[0]?.main || 'Clear';
        const description = data.weather?.[0]?.description || 'Clear sky';
        const temp = Math.round(data.main?.temp ?? 28);
        const humidity = data.main?.humidity ?? 50;
        const windSpeed = data.wind?.speed ?? 3;

        const isRain = /rain|drizzle|thunderstorm/i.test(main);
        const isExtremeHeat = temp >= 40;
        const safeForWalk = !isRain && !isExtremeHeat;

        return {
          city: data.name || cityName,
          condition: main,
          temp,
          humidity,
          windSpeed,
          description: description.charAt(0).toUpperCase() + description.slice(1),
          safeForWalk,
          isRain,
          isExtremeHeat,
          dataSource: 'LIVE_OPENWEATHER_API',
          rawTimestamp: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn(`[WeatherAgent] Live OpenWeather API request failed (${err.message}). Using fallback data.`);
    }
  }

  // Graceful realistic fallback if offline or placeholder key
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 19;
  return {
    city: cityName,
    condition: 'Clear',
    temp: isNight ? 22 : 31,
    humidity: 58,
    windSpeed: 4.2,
    description: isNight ? 'Clear starry sky' : 'Pleasant sunshine',
    safeForWalk: true,
    isRain: false,
    isExtremeHeat: false,
    dataSource: 'SEASONAL_DELHI_BASELINE_FALLBACK',
    rawTimestamp: new Date().toISOString()
  };
}

module.exports = { getWeather };
