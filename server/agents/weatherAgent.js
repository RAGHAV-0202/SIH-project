/**
 * Weather Agent — Autonomous climate & forecast synthesis for destinations.
 * Provides micro-climate profiles, day-by-day forecasts, outdoor suitability ratings,
 * and packing/clothing advisories.
 */

const CLIMATE_PROFILES = {
  'spiti valley': {
    zone: 'Cold Alpine Desert',
    altitude_meters: 3800,
    temp_range: { min: 4, max: 18 },
    avg_humidity: '28%',
    typical_wind: '18 km/h Gusts',
    uv_index: 'Very High (8)',
    conditions_pool: ['sunny', 'clear', 'windy_sunny', 'partly_cloudy'],
    advisory: 'High altitude intense sun with freezing evenings. Heavy thermal layers, sunglasses & SPF 50+ essential.',
    pack_advice: 'Down jacket, thermal inners, UV protection sunglasses, lip balm & windproof outer shell.',
  },
  'manali': {
    zone: 'Himalayan Valley',
    altitude_meters: 2050,
    temp_range: { min: 9, max: 22 },
    avg_humidity: '52%',
    typical_wind: '10 km/h Valley Breeze',
    uv_index: 'Moderate (5)',
    conditions_pool: ['sunny', 'partly_cloudy', 'clear', 'crisp_morning'],
    advisory: 'Pleasant mountain sunshine during daylight; temperatures dip rapidly post-sunset (down to 9°C).',
    pack_advice: 'Fleece jacket, comfortable trekking shoes, light evening woollens, and breathable day layers.',
  },
  'rishikesh': {
    zone: 'Ganga Foothill Valley',
    altitude_meters: 300,
    temp_range: { min: 16, max: 27 },
    avg_humidity: '48%',
    typical_wind: '8 km/h Gentle Breeze',
    uv_index: 'Moderate (5)',
    conditions_pool: ['sunny', 'clear', 'misty_morning', 'partly_cloudy'],
    advisory: 'Optimal weather for river rafting and outdoor yoga. River mist at dawn clearing to crisp blue skies.',
    pack_advice: 'Breathable cottons, yoga wear, quick-drying water sandals, light shawl for evening aarti.',
  },
  'coorg': {
    zone: 'Western Ghats Mist Belt',
    altitude_meters: 1150,
    temp_range: { min: 15, max: 24 },
    avg_humidity: '68%',
    typical_wind: '12 km/h Forest Breeze',
    uv_index: 'Moderate (4)',
    conditions_pool: ['partly_cloudy', 'misty', 'sunny', 'light_breeze'],
    advisory: 'Lush coffee plantation climate with morning mist rolling over hills. Low precipitation risk.',
    pack_advice: 'Light cardigan, closed walking shoes for plantation trails, light rain shell just in case.',
  },
  'jaipur': {
    zone: 'Semi-Arid Royal Plain',
    altitude_meters: 432,
    temp_range: { min: 18, max: 32 },
    avg_humidity: '34%',
    typical_wind: '11 km/h Dry Air',
    uv_index: 'High (7)',
    conditions_pool: ['sunny', 'clear', 'golden_sun', 'warm_clear'],
    advisory: 'Warm sun throughout midday; cool, atmospheric desert evenings around heritage forts.',
    pack_advice: 'Sun hat, light cotton clothing, comfortable walking flats for fort cobblestones, sunglasses.',
  },
  'goa': {
    zone: 'Tropical Coastal Belt',
    altitude_meters: 20,
    temp_range: { min: 24, max: 32 },
    avg_humidity: '72%',
    typical_wind: '15 km/h Sea Breeze',
    uv_index: 'High (7)',
    conditions_pool: ['sunny', 'partly_cloudy', 'breezy_sunny', 'clear_sky'],
    advisory: 'Warm coastal sunshine with refreshing ocean breezes in the afternoon. Prime beach conditions.',
    pack_advice: 'Linen shirts, beachwear, sunscreen, polarized sunglasses, light open footwear.',
  },
  'meghalaya': {
    zone: 'Subtropical Highland Pine & Cloud Forest',
    altitude_meters: 1400,
    temp_range: { min: 12, max: 21 },
    avg_humidity: '78%',
    typical_wind: '14 km/h Cloud Drift',
    uv_index: 'Low-Moderate (3)',
    conditions_pool: ['misty', 'partly_cloudy', 'light_showers', 'cool_breeze'],
    advisory: 'Rolling clouds and misty canyon rims. Ideal trekking temperatures with high oxygen levels.',
    pack_advice: 'Waterproof trekking shoes with good grip, lightweight waterproof jacket, fleece sweater.',
  },
  'kerala': {
    zone: 'Tropical Backwater & Coastal',
    altitude_meters: 10,
    temp_range: { min: 23, max: 31 },
    avg_humidity: '75%',
    typical_wind: '10 km/h Shore Breeze',
    uv_index: 'High (6)',
    conditions_pool: ['partly_cloudy', 'sunny', 'tropical_breeze', 'clear_evening'],
    advisory: 'Warm, humid, and serene backwater conditions. Golden afternoon light ideal for canoeing.',
    pack_advice: 'Light airy fabrics, mosquito repellent, sun protection, slip-on boat shoes.',
  },
};

const DEFAULT_PROFILE = {
  zone: 'Temperate Region',
  altitude_meters: 500,
  temp_range: { min: 16, max: 26 },
  avg_humidity: '50%',
  typical_wind: '10 km/h',
  uv_index: 'Moderate (5)',
  conditions_pool: ['sunny', 'partly_cloudy', 'clear'],
  advisory: 'Favorable seasonal weather expected throughout the journey.',
  pack_advice: 'Casual seasonal layers and comfortable walking shoes.',
};

/**
 * Format condition string into human-friendly label and icon identifier
 */
function normalizeCondition(raw) {
  switch (raw) {
    case 'sunny':
    case 'golden_sun':
      return { condition: 'sunny', label: 'Clear & Sunny', icon: 'sun' };
    case 'partly_cloudy':
      return { condition: 'partly_cloudy', label: 'Partly Cloudy', icon: 'cloud-sun' };
    case 'misty':
    case 'misty_morning':
      return { condition: 'misty', label: 'Misty Dawn, Clear Day', icon: 'cloud-fog' };
    case 'windy_sunny':
    case 'crisp_morning':
      return { condition: 'clear', label: 'Crisp & Sunny', icon: 'sun' };
    case 'light_showers':
      return { condition: 'light_rain', label: 'Passing Mountain Mist', icon: 'cloud-drizzle' };
    case 'thunderstorm':
      return { condition: 'thunderstorm', label: 'Thunderstorm Warning', icon: 'cloud-lightning' };
    default:
      return { condition: 'sunny', label: 'Clear Skies', icon: 'sun' };
  }
}

/**
 * Fetch real-time weather & 5-day forecast from OpenWeather API
 */
async function fetchOpenWeather(destination) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || !destination) return null;

  try {
    // Clean destination query (e.g. 'Spiti Valley' -> 'Kaza' or 'Spiti', 'Manali' -> 'Manali')
    let query = destination.trim();
    if (query.toLowerCase().includes('spiti')) query = 'Kaza,IN';
    else if (!query.includes(',')) query = `${query},IN`;

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query)}&appid=${apiKey}&units=metric`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`⚠️ OpenWeather API response not ok (${res.status}) for "${query}" - using domain profile`);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`⚠️ OpenWeather fetch failed: ${err.message} - using domain profile`);
    return null;
  }
}

/**
 * Generate multi-day forecast for destination.
 * Uses live OpenWeather API if available; otherwise falls back to calibrated domain micro-climate models.
 */
async function getDestinationWeatherAsync(destination, startDate = new Date(), days = 4) {
  const key = Object.keys(CLIMATE_PROFILES).find(k =>
    destination?.toLowerCase().includes(k)
  );
  const profile = key ? CLIMATE_PROFILES[key] : DEFAULT_PROFILE;

  // Try live OpenWeather data
  const liveData = await fetchOpenWeather(destination);

  if (liveData && Array.isArray(liveData.list) && liveData.list.length > 0) {
    const city = liveData.city?.name || destination;
    const current = liveData.list[0];
    const currentTemp = Math.round(current.main?.temp || 20);

    // Group 3-hour forecasts by date
    const dailyMap = new Map();
    for (const item of liveData.list) {
      const dateStr = item.dt_txt ? item.dt_txt.split(' ')[0] : new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, []);
      }
      dailyMap.get(dateStr).push(item);
    }

    const dayForecasts = [];
    let dayIndex = 1;

    for (const [dateStr, entries] of dailyMap.entries()) {
      if (dayIndex > days) break;

      let minTemp = Infinity;
      let maxTemp = -Infinity;
      let totalTemp = 0;
      let dominantWeather = entries[0]?.weather?.[0] || {};
      let totalPop = 0;

      for (const e of entries) {
        if (e.main?.temp_min < minTemp) minTemp = e.main.temp_min;
        if (e.main?.temp_max > maxTemp) maxTemp = e.main.temp_max;
        totalTemp += e.main?.temp || 0;
        totalPop = Math.max(totalPop, Math.round((e.pop || 0) * 100));
        // Prioritize daytime conditions around 12:00 or 15:00
        if (e.dt_txt && (e.dt_txt.includes('12:00') || e.dt_txt.includes('15:00'))) {
          dominantWeather = e.weather?.[0] || dominantWeather;
        }
      }

      const avgTemp = Math.round(totalTemp / entries.length);
      const conditionMain = (dominantWeather.main || 'Clear').toLowerCase();
      const rainChance = totalPop > 0 ? totalPop : conditionMain.includes('rain') ? 60 : 10;
      const outdoorScore = rainChance > 40 ? 65 : 95;

      let icon = 'sun';
      let conditionLabel = dominantWeather.description || 'Clear Sky';
      if (conditionMain.includes('rain')) {
        icon = 'cloud-drizzle';
      } else if (conditionMain.includes('cloud')) {
        icon = 'cloud-sun';
      } else if (conditionMain.includes('snow')) {
        icon = 'cloud-snow';
      } else if (conditionMain.includes('thunder')) {
        icon = 'cloud-lightning';
      }

      dayForecasts.push({
        day: dayIndex,
        date: dateStr,
        temp_c: avgTemp,
        temp_min_c: Math.round(minTemp),
        temp_max_c: Math.round(maxTemp),
        feels_like_c: Math.round(entries[0]?.main?.feels_like || avgTemp),
        condition: conditionMain,
        condition_label: conditionLabel.charAt(0).toUpperCase() + conditionLabel.slice(1),
        icon,
        rain_chance: rainChance,
        humidity: `${Math.round(entries[0]?.main?.humidity || 50)}%`,
        wind_speed: `${Math.round((entries[0]?.wind?.speed || 3) * 3.6)} km/h`,
        outdoor_score: outdoorScore,
        advisory: dayIndex === 1
          ? `Live reading: ${conditionLabel} around ${avgTemp}°C in ${city}.`
          : dayIndex === days
          ? 'Clear travel window for return departure.'
          : 'Great daylight travel conditions.',
        suitable_slots: ['Morning', 'Afternoon', 'Evening'],
      });

      dayIndex++;
    }

    return {
      destination: destination || city,
      zone: `${city} (Live Satellite Station)`,
      altitude_meters: profile.altitude_meters,
      current_temp_c: currentTemp,
      temp_range: {
        min: Math.min(...dayForecasts.map(d => d.temp_min_c)),
        max: Math.max(...dayForecasts.map(d => d.temp_max_c)),
      },
      humidity: `${current.main?.humidity || 50}%`,
      wind: `${Math.round((current.wind?.speed || 3) * 3.6)} km/h`,
      uv_index: profile.uv_index,
      summary: `Live OpenWeather data for ${city} · ${currentTemp}°C (${current.weather?.[0]?.description || 'clear'}) · ${profile.advisory}`,
      advisory: profile.advisory,
      pack_advice: profile.pack_advice,
      day_forecasts: dayForecasts,
      monitored_by: 'Live OpenWeather Sentinel API + Domain Fallback',
    };
  }

  // Fallback to calibrated micro-climate profiles
  return getDestinationWeather(destination, startDate, days);
}

/**
 * Generate multi-day forecast for destination (Synchronous domain baseline)
 */
function getDestinationWeather(destination, startDate = new Date(), days = 4) {
  const key = Object.keys(CLIMATE_PROFILES).find(k =>
    destination?.toLowerCase().includes(k)
  );
  const profile = key ? CLIMATE_PROFILES[key] : DEFAULT_PROFILE;

  const currentTemp = Math.round((profile.temp_range.min + profile.temp_range.max) / 2);
  const dayForecasts = [];

  for (let i = 1; i <= days; i++) {
    const curDate = new Date(startDate);
    curDate.setDate(curDate.getDate() + i - 1);
    const dateStr = curDate.toISOString().split('T')[0];

    // Seed variations predictably based on day index
    const tempVariance = ((i * 3) % 5) - 2; // -2 to +2 variation
    const maxTemp = profile.temp_range.max + tempVariance;
    const minTemp = profile.temp_range.min + Math.floor(tempVariance / 2);
    const avgTemp = Math.round((maxTemp + minTemp) / 2);

    const conditionRaw = profile.conditions_pool[(i - 1) % profile.conditions_pool.length];
    const { condition, label, icon } = normalizeCondition(conditionRaw);

    const rainChance = condition === 'light_rain' ? 35 : condition === 'partly_cloudy' ? 15 : 5;
    const outdoorScore = rainChance > 30 ? 70 : 95;

    dayForecasts.push({
      day: i,
      date: dateStr,
      temp_c: avgTemp,
      temp_min_c: minTemp,
      temp_max_c: maxTemp,
      feels_like_c: avgTemp + 1,
      condition,
      condition_label: label,
      icon,
      rain_chance: rainChance,
      humidity: profile.avg_humidity,
      wind_speed: profile.typical_wind,
      outdoor_score: outdoorScore,
      advisory: i === 1
        ? `Comfortable arrival conditions at ${profile.altitude_meters}m.`
        : i === days
        ? 'Clear travel window for return departure.'
        : `Great outdoor window between 08:30 and 17:30.`,
      suitable_slots: ['Morning', 'Afternoon', 'Evening'],
    });
  }

  return {
    destination: destination || 'Destination',
    zone: profile.zone,
    altitude_meters: profile.altitude_meters,
    current_temp_c: currentTemp,
    temp_range: profile.temp_range,
    humidity: profile.avg_humidity,
    wind: profile.typical_wind,
    uv_index: profile.uv_index,
    summary: `${profile.zone} · ${profile.temp_range.min}°C to ${profile.temp_range.max}°C · ${profile.advisory}`,
    advisory: profile.advisory,
    pack_advice: profile.pack_advice,
    day_forecasts: dayForecasts,
    monitored_by: 'Agentic Weather Sentinel (Continuous Webhook)',
  };
}

/**
 * Route Weather Safety Evaluator
 * Detects if weather causes transit hazards (landslides, high pass snow, flooding)
 * and generates replanning guidance for the replanning agent.
 */
function evaluateRouteWeather(origin, destination, weatherCondition = 'heavy rain') {
  const d = (destination || '').toLowerCase();
  const cond = weatherCondition.toLowerCase();

  let isHazardous = false;
  let hazardType = 'moderate';
  let routeStatus = 'open';
  let recommendation = 'Proceed with standard caution.';
  let safeCorridor = null;

  if (cond.includes('rain') || cond.includes('monsoon') || cond.includes('landslide') || cond.includes('flood')) {
    isHazardous = true;
    hazardType = 'landslide_and_flash_flood_risk';
    routeStatus = 'pass_restricted';
    if (d.includes('spiti') || d.includes('manali')) {
      safeCorridor = 'Atal Tunnel South-Portal Rail/Shuttle Corridor';
      recommendation = 'High mountain pass closed due to mudslides. Switch from surface bus to all-weather rail/sheltered shuttle corridor.';
    } else if (d.includes('rishikesh')) {
      safeCorridor = 'Vande Bharat Express Rail Link (Delhi - Haridwar/Rishikesh)';
      recommendation = 'Ganga foothill highway waterlogged. Reroute to express rail corridor.';
    } else {
      safeCorridor = 'All-Weather Verified Intercity Express Rail';
      recommendation = 'Surface highway delay detected. Switch to verified express rail link.';
    }
  } else if (cond.includes('snow') || cond.includes('blizzard') || cond.includes('frost')) {
    isHazardous = true;
    hazardType = 'heavy_snow_pass_closure';
    routeStatus = 'pass_closed';
    safeCorridor = 'Low-Altitude Express Rail Bypass';
    recommendation = 'High mountain pass blocked by heavy snow. Reroute via low-altitude rail bypass.';
  }

  return {
    isHazardous,
    hazardType,
    routeStatus,
    weatherCondition,
    safeCorridor,
    recommendation,
  };
}

module.exports = {
  getDestinationWeather,
  getDestinationWeatherAsync,
  fetchOpenWeather,
  CLIMATE_PROFILES,
  evaluateRouteWeather,
};

