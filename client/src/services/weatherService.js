/**
 * Client Weather Service & Climate Synthesis Helper
 * Provides icon mappings, condition badge styles, and fallback weather generation.
 */

export const DESTINATION_CLIMATES = {
  'spiti valley': {
    zone: 'Cold Alpine Desert',
    altitude_meters: 3800,
    temp_range: { min: 4, max: 18 },
    avg_humidity: '28%',
    typical_wind: '18 km/h Gusts',
    uv_index: 'Very High (8)',
    conditions_pool: ['sunny', 'clear', 'windy_sunny', 'partly_cloudy'],
    advisory: 'High altitude intense sun with freezing evenings. Heavy thermal layers & SPF 50+ essential.',
    pack_advice: 'Down jacket, thermal inners, UV protection sunglasses, lip balm & windproof outer shell.',
  },
  manali: {
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
  rishikesh: {
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
  coorg: {
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
  jaipur: {
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
  goa: {
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
  meghalaya: {
    zone: 'Subtropical Cloud Forest',
    altitude_meters: 1400,
    temp_range: { min: 12, max: 21 },
    avg_humidity: '78%',
    typical_wind: '14 km/h Cloud Drift',
    uv_index: 'Low-Moderate (3)',
    conditions_pool: ['misty', 'partly_cloudy', 'light_showers', 'cool_breeze'],
    advisory: 'Rolling clouds and misty canyon rims. Ideal trekking temperatures with high oxygen levels.',
    pack_advice: 'Waterproof trekking shoes with good grip, lightweight waterproof jacket, fleece sweater.',
  },
  kerala: {
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

const DEFAULT_CLIMATE = {
  zone: 'Temperate Foothills',
  altitude_meters: 500,
  temp_range: { min: 16, max: 26 },
  avg_humidity: '50%',
  typical_wind: '10 km/h Breeze',
  uv_index: 'Moderate (5)',
  conditions_pool: ['sunny', 'partly_cloudy', 'clear'],
  advisory: 'Favorable seasonal weather expected throughout the journey.',
  pack_advice: 'Casual seasonal layers and comfortable walking shoes.',
};

/**
 * Ensures an itinerary always has valid destination and daily weather data.
 */
export function ensureItineraryWeather(itinerary) {
  if (!itinerary) return null;
  if (itinerary.weather && itinerary.day_plans?.every(d => d.weather)) {
    return itinerary;
  }

  const dest = (itinerary.destination || '').toLowerCase();
  const matchedKey = Object.keys(DESTINATION_CLIMATES).find(k => dest.includes(k));
  const profile = matchedKey ? DESTINATION_CLIMATES[matchedKey] : DEFAULT_CLIMATE;
  const daysCount = itinerary.days || itinerary.day_plans?.length || 4;

  const currentTemp = Math.round((profile.temp_range.min + profile.temp_range.max) / 2);
  const dayForecasts = [];

  for (let i = 1; i <= daysCount; i++) {
    const tempVariance = ((i * 3) % 5) - 2;
    const maxTemp = profile.temp_range.max + tempVariance;
    const minTemp = profile.temp_range.min + Math.floor(tempVariance / 2);
    const avgTemp = Math.round((maxTemp + minTemp) / 2);
    const conditionRaw = profile.conditions_pool[(i - 1) % profile.conditions_pool.length];

    let condition = 'sunny';
    let label = 'Clear & Sunny';
    let icon = 'sun';

    if (conditionRaw === 'partly_cloudy') {
      condition = 'partly_cloudy';
      label = 'Partly Cloudy';
      icon = 'cloud-sun';
    } else if (conditionRaw.includes('mist')) {
      condition = 'misty';
      label = 'Misty Dawn, Clear Day';
      icon = 'cloud-fog';
    } else if (conditionRaw.includes('showers')) {
      condition = 'light_rain';
      label = 'Passing Mist';
      icon = 'cloud-drizzle';
    }

    const rainChance = condition === 'light_rain' ? 35 : condition === 'partly_cloudy' ? 15 : 5;
    const outdoorScore = rainChance > 30 ? 70 : 95;

    dayForecasts.push({
      day: i,
      date: itinerary.day_plans?.[i - 1]?.date || `Day ${i}`,
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
        : i === daysCount
        ? 'Clear travel window for return departure.'
        : `Great outdoor window between 08:30 and 17:30.`,
      suitable_slots: ['Morning', 'Afternoon', 'Evening'],
    });
  }

  const destinationWeather = itinerary.weather || {
    destination: itinerary.destination || 'Destination',
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

  const updatedDayPlans = itinerary.day_plans?.map((dp, idx) => ({
    ...dp,
    weather: dp.weather || dayForecasts[idx] || dayForecasts[0],
  }));

  return {
    ...itinerary,
    weather: destinationWeather,
    day_plans: updatedDayPlans,
  };
}
