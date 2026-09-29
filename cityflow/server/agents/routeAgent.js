const transitData = require('../data/delhi-transit.json');

// Haversine distance in km between two lat/lng pairs
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// Comprehensive Delhi NCR landmark coordinates dictionary (ground truth from OpenStreetMap)
const DELHI_LOCATIONS = {
  'dwarka': [28.5921, 77.0460],
  'dwarka sec 21': [28.5523, 77.0586],
  'dwarka sector 21': [28.5523, 77.0586],
  'dwarka sec 10': [28.5815, 77.0573],
  'dwarka sec 8': [28.5693, 77.0718],
  'connaught place': [28.6315, 77.2167],
  'cp': [28.6315, 77.2167],
  'rajiv chowk': [28.6328, 77.2197],
  'kashmere gate': [28.6665, 77.2255],
  'huda city centre': [28.4593, 77.0724],
  'millennium city centre': [28.4593, 77.0724],
  'noida sec 62': [28.6279, 77.3622],
  'noida city centre': [28.5746, 77.3561],
  'gurgaon cyber hub': [28.4986, 77.0898],
  'cyber hub': [28.4986, 77.0898],
  'saket': [28.5244, 77.2066],
  'hauz khas': [28.5432, 77.2065],
  'nehru place': [28.5494, 77.2528],
  'rohini': [28.7149, 77.1145],
  'pitampura': [28.6980, 77.1328],
  'chandni chowk': [28.6506, 77.2303],
  'red fort': [28.6562, 77.2410],
  'india gate': [28.6129, 77.2295],
  'karol bagh': [28.6514, 77.1907],
  'lajpat nagar': [28.5709, 77.2433],
  'south extension': [28.5728, 77.2223],
  'greater kailash': [28.5401, 77.2403],
  'vasant kunj': [28.5284, 77.1554],
  'janakpuri': [28.6219, 77.0878],
  'patel nagar': [28.6579, 77.1652],
  'ito': [28.6297, 77.2418],
  'pragati maidan': [28.6186, 77.2431],
  'supreme court': [28.6186, 77.2431],
  'jln stadium': [28.5828, 77.2344],
  'aiims': [28.5686, 77.2078],
  'dhaula kuan': [28.5921, 77.1617],
  'airport t3': [28.5562, 77.1000],
  'igi airport': [28.5562, 77.1000],
  'new delhi railway station': [28.6430, 77.2194],
  'ndls': [28.6430, 77.2194],
  'old delhi railway station': [28.6619, 77.2307],
  'delhi': [28.6139, 77.2090],
};

const geoCache = new Map();

// Dynamic geocoding with OpenStreetMap Nominatim and cached fallbacks
async function resolveCoordinates(placeName, defaultCoords = [28.6139, 77.2090]) {
  if (!placeName || typeof placeName !== 'string') return { lat: defaultCoords[0], lng: defaultCoords[1], source: 'DEFAULT' };
  const clean = placeName.trim().toLowerCase();

  // 1. Direct dictionary match
  if (DELHI_LOCATIONS[clean]) {
    const [lat, lng] = DELHI_LOCATIONS[clean];
    return { lat, lng, source: 'DELHI_KNOWLEDGE_BASE' };
  }

  // 2. Exact word match
  for (const [key, coords] of Object.entries(DELHI_LOCATIONS)) {
    if (clean === key) {
      return { lat: coords[0], lng: coords[1], source: 'DELHI_KNOWLEDGE_EXACT' };
    }
  }

  // 3. In-memory cache
  if (geoCache.has(clean)) {
    return geoCache.get(clean);
  }

  // 4. Live OpenStreetMap Nominatim request across India
  try {
    const query = `${encodeURIComponent(placeName)}`;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&limit=1`, {
      headers: { 'User-Agent': 'CityFlow-AI-UrbanTransit/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          source: 'LIVE_OSM_NOMINATIM'
        };
        geoCache.set(clean, result);
        return result;
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // Default Central Delhi
  const fallback = { lat: defaultCoords[0], lng: defaultCoords[1], source: 'FALLBACK_CENTRAL_DELHI' };
  geoCache.set(clean, fallback);
  return fallback;
}

// Find nearest metro station in DMRC dataset
function findNearestMetroStation(lat, lng) {
  let nearest = null;
  let minDistance = Infinity;
  let lineInfo = null;

  for (const line of transitData.metro.lines) {
    for (const station of line.stations) {
      const d = haversineDistance(lat, lng, station.lat, station.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = station;
        lineInfo = line;
      }
    }
  }

  return { station: nearest, distance: minDistance, line: lineInfo };
}

// Standard Indian urban transit emission factors (kg CO2 per passenger-km)
// Sources: Central Pollution Control Board (CPCB) & International Energy Agency (IEA)
const CARBON_RATES = {
  walk: 0,
  cycle: 0,
  metro: 0.008, // Delhi Metro electric grid intensity per passenger-km
  bus: 0.025,   // DTC CNG/Electric bus per passenger-km
  auto: 0.065,  // CNG Three-wheeler auto
  cab: 0.120,   // Four-wheeler cab
  bike: 0.040   // Two-wheeler bike taxi
};

const getCarbon = (mode, dist, people) =>
  Math.round((CARBON_RATES[mode] || 0) * dist * (['metro', 'bus'].includes(mode) ? people : 1) * 1000) / 1000;

// Official Delhi Metro distance-based fare slab
function getMetroFare(distanceKm) {
  if (distanceKm <= 2) return 10;
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 12) return 30;
  if (distanceKm <= 21) return 40;
  if (distanceKm <= 32) return 50;
  return 60;
}

async function generateRoutes(intent, context = {}) {
  const { origin, destination, people = 1, preferences = [] } = intent;
  const weather = context.weather || {};
  const traffic = context.traffic || { modifier: 1.0, isPeak: false };

  // Resolve real ground-truth coordinates
  const originCoord = await resolveCoordinates(origin, [28.5921, 77.0460]);
  const destCoord = await resolveCoordinates(destination, [28.6315, 77.2167]);

  const directDistance = Math.max(1.5, haversineDistance(originCoord.lat, originCoord.lng, destCoord.lat, destCoord.lng));

  // Find nearest metro stations
  const originMetro = findNearestMetroStation(originCoord.lat, originCoord.lng);
  const destMetro = findNearestMetroStation(destCoord.lat, destCoord.lng);

  // PS 26205: Check if request is for Last-Mile Logistics Delivery Routing
  if (intent.mode === 'delivery') {
    return generateLogisticsRoutes(intent, context, originCoord, destCoord, directDistance, originMetro, destMetro);
  }

  const metroRideDistance = Math.max(2, haversineDistance(
    originMetro.station.lat, originMetro.station.lng,
    destMetro.station.lat, destMetro.station.lng
  ));

  // Metro travel time calculation: ~32 km/h average commercial speed + dwell time
  const estStops = Math.max(2, Math.round(metroRideDistance / 1.3));
  const metroRideTimeMin = Math.round((metroRideDistance / 32) * 60) + Math.round(estStops * 0.75);
  const singleMetroFare = getMetroFare(metroRideDistance);

  // Weather impact checks
  const isRain = weather.isRain || /rain/i.test(weather.condition || '');
  const isHeat = weather.isExtremeHeat || (weather.temp >= 40);

  // First mile / Last mile walking limits
  const firstMileDist = originMetro.distance;
  const firstMileTime = Math.round(firstMileDist * 12); // ~5 km/h walk

  const lastMileDist = destMetro.distance;
  const lastMileTime = Math.round(lastMileDist * 12);

  // Assemble Route 1: Rapid Metro Multi-Modal
  const metroSegments = [];

  // First mile
  if (firstMileDist > 1.2 || isRain) {
    metroSegments.push({
      mode: 'auto',
      from: { name: origin, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${originMetro.station.name} Metro`, lat: originMetro.station.lat, lng: originMetro.station.lng },
      distance_km: firstMileDist,
      duration_min: Math.max(5, Math.round(firstMileDist * 3.5 * traffic.modifier)),
      cost_inr: 30,
      instructions: `Quick E-Rickshaw/Auto to ${originMetro.station.name} Metro Gate 1`,
      carbon_kg: getCarbon('auto', firstMileDist, 1),
      line_color: '#F59E0B'
    });
  } else {
    metroSegments.push({
      mode: 'walk',
      from: { name: origin, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${originMetro.station.name} Metro`, lat: originMetro.station.lat, lng: originMetro.station.lng },
      distance_km: firstMileDist,
      duration_min: firstMileTime,
      cost_inr: 0,
      instructions: `Walk ${firstMileDist} km to ${originMetro.station.name} Metro`,
      carbon_kg: 0,
      line_color: '#94A3B8'
    });
  }

  // Metro line segment
  metroSegments.push({
    mode: 'metro',
    from: { name: originMetro.station.name, lat: originMetro.station.lat, lng: originMetro.station.lng },
    to: { name: destMetro.station.name, lat: destMetro.station.lat, lng: destMetro.station.lng },
    distance_km: metroRideDistance,
    duration_min: metroRideTimeMin + (traffic.crowd_delay_min || 2),
    cost_inr: singleMetroFare * people,
    instructions: `Board ${originMetro.line.name} towards ${destMetro.station.name} (${estStops} stops)`,
    line_name: originMetro.line.name,
    stops: estStops,
    carbon_kg: getCarbon('metro', metroRideDistance, people),
    line_color: originMetro.line.color || '#003DA5'
  });

  // Last mile
  if (lastMileDist > 0.8 || isRain) {
    metroSegments.push({
      mode: 'auto',
      from: { name: `${destMetro.station.name} Metro`, lat: destMetro.station.lat, lng: destMetro.station.lng },
      to: { name: destination, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: lastMileDist,
      duration_min: Math.max(4, Math.round(lastMileDist * 3.2 * traffic.modifier)),
      cost_inr: 25,
      instructions: `Take Auto / E-Rickshaw to ${destination}`,
      carbon_kg: getCarbon('auto', lastMileDist, 1),
      line_color: '#F59E0B'
    });
  } else {
    metroSegments.push({
      mode: 'walk',
      from: { name: `${destMetro.station.name} Metro`, lat: destMetro.station.lat, lng: destMetro.station.lng },
      to: { name: destination, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: lastMileDist,
      duration_min: lastMileTime,
      cost_inr: 0,
      instructions: `Walk ${lastMileDist} km to ${destination}`,
      carbon_kg: 0,
      line_color: '#94A3B8'
    });
  }

  const metroTotalTime = metroSegments.reduce((s, seg) => s + seg.duration_min, 0);
  const metroTotalCost = metroSegments.reduce((s, seg) => s + seg.cost_inr, 0);
  const metroTotalDist = metroSegments.reduce((s, seg) => s + seg.distance_km, 0);
  const metroTotalCarbon = metroSegments.reduce((s, seg) => s + seg.carbon_kg, 0);

  // Route 2: Direct Cab (Uber / Ola)
  const cabDist = Math.round(directDistance * 1.25 * 10) / 10;
  const cabDuration = Math.round((cabDist / (traffic.isPeak ? 18 : 34)) * 60);
  const cabCost = Math.round(50 + cabDist * 14 * (traffic.isPeak ? 1.3 : 1.0));
  const cabCarbon = getCarbon('cab', cabDist, 1);

  const cabSegments = [
    {
      mode: 'cab',
      from: { name: origin, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: destination, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: cabDist,
      duration_min: cabDuration,
      cost_inr: cabCost,
      instructions: `Direct ride via Uber/Ola (${cabDist} km across city arterial roads)`,
      carbon_kg: cabCarbon,
      line_color: '#EF4444'
    }
  ];

  // Route 3: DTC City Bus (Cheapest / Eco-friendly)
  const busDist = Math.round(directDistance * 1.35 * 10) / 10;
  const busDuration = Math.round((busDist / (traffic.isPeak ? 14 : 22)) * 60) + 12; // with dwell & wait
  const busFare = 20 * people;
  const busCarbon = getCarbon('bus', busDist, people);

  const busSegments = [
    {
      mode: 'walk',
      from: { name: origin, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${origin} Bus Terminal`, lat: originCoord.lat + 0.002, lng: originCoord.lng + 0.002 },
      distance_km: 0.4,
      duration_min: 6,
      cost_inr: 0,
      instructions: `Walk to ${origin} DTC Bus Stop`,
      carbon_kg: 0,
      line_color: '#94A3B8'
    },
    {
      mode: 'bus',
      from: { name: `${origin} Bus Terminal`, lat: originCoord.lat + 0.002, lng: originCoord.lng + 0.002 },
      to: { name: `${destination} Bus Stand`, lat: destCoord.lat - 0.002, lng: destCoord.lng - 0.002 },
      distance_km: busDist,
      duration_min: busDuration,
      cost_inr: busFare,
      instructions: `Take DTC Route 501 / 544 Express Low-Floor AC Bus towards ${destination}`,
      line_name: 'DTC AC Express',
      carbon_kg: busCarbon,
      line_color: '#10B981'
    },
    {
      mode: 'walk',
      from: { name: `${destination} Bus Stand`, lat: destCoord.lat - 0.002, lng: destCoord.lng - 0.002 },
      to: { name: destination, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: 0.3,
      duration_min: 4,
      cost_inr: 0,
      instructions: `Walk 300m to ${destination}`,
      carbon_kg: 0,
      line_color: '#94A3B8'
    }
  ];

  // Route 4: EV Bike / Metro Hybrid (Express Commute)
  const bikeDist = Math.round(directDistance * 1.15 * 10) / 10;
  const bikeDuration = Math.round((bikeDist / (traffic.isPeak ? 22 : 36)) * 60);
  const bikeCost = Math.round(20 + bikeDist * 7.5);
  const bikeCarbon = getCarbon('bike', bikeDist, 1);

  const bikeSegments = [
    {
      mode: 'bike',
      from: { name: origin, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: destination, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: bikeDist,
      duration_min: bikeDuration,
      cost_inr: bikeCost,
      instructions: `Rapido / Uber Moto Bike Taxi (lane-splitting agility through peak traffic)`,
      carbon_kg: bikeCarbon,
      line_color: '#F59E0B'
    }
  ];

  return [
    {
      id: 'route-metro-express',
      name: 'Smart Multimodal (Metro + Feeder)',
      summary: `${originMetro.station.name} (${originMetro.line.name}) → ${destMetro.station.name}`,
      total_time_min: metroTotalTime,
      total_cost_inr: metroTotalCost,
      total_distance_km: Math.round(metroTotalDist * 10) / 10,
      carbon_kg: Math.round(metroTotalCarbon * 100) / 100,
      comfort_score: isRain ? 9 : 8,
      mainMode: 'metro',
      segments: metroSegments,
      geocodingMetadata: {
        origin: originCoord,
        destination: destCoord
      }
    },
    {
      id: 'route-dtc-bus',
      name: 'Green Corridors (DTC Low-Floor Bus)',
      summary: `DTC AC Express Bus via Dedicated Bus Lane`,
      total_time_min: busDuration + 10,
      total_cost_inr: busFare,
      total_distance_km: Math.round((busDist + 0.7) * 10) / 10,
      carbon_kg: Math.round(busCarbon * 100) / 100,
      comfort_score: 7,
      mainMode: 'bus',
      segments: busSegments,
      geocodingMetadata: {
        origin: originCoord,
        destination: destCoord
      }
    },
    {
      id: 'route-direct-cab',
      name: 'Door-to-Door Cab (Uber / Ola)',
      summary: `Direct cab via Arterial Highway corridors`,
      total_time_min: cabDuration,
      total_cost_inr: cabCost,
      total_distance_km: cabDist,
      carbon_kg: Math.round(cabCarbon * 100) / 100,
      comfort_score: 9,
      mainMode: 'cab',
      segments: cabSegments,
      geocodingMetadata: {
        origin: originCoord,
        destination: destCoord
      }
    },
    {
      id: 'route-rapido-bike',
      name: 'Express Bike Taxi (Rapido / Moto)',
      summary: `Quickest congestion bypass for solo commuter`,
      total_time_min: bikeDuration,
      total_cost_inr: bikeCost,
      total_distance_km: bikeDist,
      carbon_kg: Math.round(bikeCarbon * 100) / 100,
      comfort_score: isRain ? 3 : 7,
      mainMode: 'bike',
      segments: bikeSegments,
      geocodingMetadata: {
        origin: originCoord,
        destination: destCoord
      }
    }
  ];
}

/**
 * Last-Mile Logistics & Urban Freight Optimizer (SIH PS 26205)
 * Synthesizes multi-modal cargo routes combining EV freight, off-peak metro cargo, and two-wheeler couriers.
 */
function generateLogisticsRoutes(intent, context, originCoord, destCoord, directDistance, originMetro, destMetro) {
  const weightKg = intent.payload_weight_kg || 5;
  const traffic = context.traffic || { modifier: 1.0, isPeak: false };
  const origin = intent.origin || 'Dwarka Sec 21';
  const destination = intent.destination || 'Connaught Place';

  // 1. Off-Peak Metro Freight + EV Courier (DMRC Cargo Pilot)
  const metroRideDist = Math.max(2, haversineDistance(
    originMetro.station.lat, originMetro.station.lng,
    destMetro.station.lat, destMetro.station.lng
  ));
  const metroTransitTime = Math.round((metroRideDist / 32) * 60) + 14;
  const metroFreightCost = Math.round(40 + weightKg * 5 + metroRideDist * 1.5);
  const metroFreightCarbon = Math.round(metroRideDist * 0.005 * weightKg * 100) / 100;

  const metroLogisticsSegments = [
    {
      mode: 'bike',
      from: { name: `${origin} (Pickup)`, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${originMetro.station.name} Cargo Intake`, lat: originMetro.station.lat, lng: originMetro.station.lng },
      distance_km: originMetro.distance,
      duration_min: Math.max(8, Math.round(originMetro.distance * 4 * traffic.modifier)),
      cost_inr: 25,
      instructions: `First-Mile EV 2W courier delivery to ${originMetro.station.name} DMRC cargo bay`,
      carbon_kg: 0.02,
      line_color: '#006C4A'
    },
    {
      mode: 'metro',
      from: { name: `${originMetro.station.name} Cargo Bay`, lat: originMetro.station.lat, lng: originMetro.station.lng },
      to: { name: `${destMetro.station.name} Cargo Hub`, lat: destMetro.station.lat, lng: destMetro.station.lng },
      distance_km: metroRideDist,
      duration_min: metroTransitTime,
      cost_inr: metroFreightCost - 50,
      instructions: `Off-Peak Metro Cargo Bay transit via ${originMetro.line.name} (zero road congestion)`,
      line_name: `${originMetro.line.name} Freight`,
      carbon_kg: metroFreightCarbon,
      line_color: '#C26D38'
    },
    {
      mode: 'bike',
      from: { name: `${destMetro.station.name} Cargo Hub`, lat: destMetro.station.lat, lng: destMetro.station.lng },
      to: { name: `${destination} (Delivery)`, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: destMetro.distance,
      duration_min: Math.max(6, Math.round(destMetro.distance * 3.5 * traffic.modifier)),
      cost_inr: 25,
      instructions: `Last-Mile EV courier drop to ${destination}`,
      carbon_kg: 0.02,
      line_color: '#006C4A'
    }
  ];

  // 2. Dedicated EV Commercial Cargo Van (Euler HiLoad / Tata Ace EV)
  const vanDist = Math.round(directDistance * 1.25 * 10) / 10;
  const vanDuration = Math.round((vanDist / (traffic.isPeak ? 16 : 28)) * 60);
  const vanCost = Math.round(180 + vanDist * 16 + weightKg * 3);
  const vanCarbon = Math.round(vanDist * 0.035 * 100) / 100;

  const vanSegments = [
    {
      mode: 'cab',
      from: { name: `${origin} (Warehouse / Pickup)`, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${destination} (Consignee Drop)`, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: vanDist,
      duration_min: vanDuration,
      cost_inr: vanCost,
      instructions: `Direct EV Freight Van (Tata Ace EV · 500kg capacity) via Arterial Logistics bypass`,
      carbon_kg: vanCarbon,
      line_color: '#006C4A'
    }
  ];

  // 3. Hyperlocal Two-Wheeler Express Courier (Rapido / Shadowfax Delivery)
  const bikeDist = Math.round(directDistance * 1.15 * 10) / 10;
  const bikeDuration = Math.round((bikeDist / (traffic.isPeak ? 22 : 36)) * 60);
  const bikeCost = Math.round(45 + bikeDist * 9 + (weightKg > 10 ? 30 : 0));
  const bikeCarbon = Math.round(bikeDist * 0.04 * 100) / 100;

  const bikeSegments = [
    {
      mode: 'bike',
      from: { name: `${origin} (Doorstep)`, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${destination} (Recipient)`, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: bikeDist,
      duration_min: bikeDuration,
      cost_inr: bikeCost,
      instructions: `Express 2W Parcel Courier (Rapido Delivery · Sub-45 min SLA)`,
      carbon_kg: bikeCarbon,
      line_color: '#D97706'
    }
  ];

  // 4. Local Wholesale Market E-Loader (Wholesale B2B)
  const loaderDist = Math.round(directDistance * 1.2 * 10) / 10;
  const loaderDuration = Math.round((loaderDist / 18) * 60) + 12;
  const loaderCost = Math.round(85 + loaderDist * 12);
  const loaderCarbon = Math.round(loaderDist * 0.015 * 100) / 100;

  const loaderSegments = [
    {
      mode: 'auto',
      from: { name: `${origin} (Market Depot)`, lat: originCoord.lat, lng: originCoord.lng },
      to: { name: `${destination} (Retail Store)`, lat: destCoord.lat, lng: destCoord.lng },
      distance_km: loaderDist,
      duration_min: loaderDuration,
      cost_inr: loaderCost,
      instructions: `Heavy E-Loader Rickshaw (Sadar/Nehru Place Merchant distribution corridor)`,
      carbon_kg: loaderCarbon,
      line_color: '#D97706'
    }
  ];

  return [
    {
      id: 'logistics-metro-freight',
      name: 'Eco-Rail Freight (Off-Peak Metro + EV Feeder)',
      summary: `DMRC Non-Peak Baggage Car + EV 2W Delivery (${weightKg}kg)`,
      total_time_min: metroTransitTime + 18,
      total_cost_inr: metroFreightCost,
      total_distance_km: Math.round((metroRideDist + originMetro.distance + destMetro.distance) * 10) / 10,
      carbon_kg: metroFreightCarbon,
      comfort_score: 9,
      mainMode: 'metro',
      is_logistics: true,
      payload_capacity_kg: 50,
      sla_type: 'Scheduled Metro Slot',
      segments: metroLogisticsSegments,
      geocodingMetadata: { origin: originCoord, destination: destCoord }
    },
    {
      id: 'logistics-hyperlocal-2w',
      name: 'Hyperlocal Express Courier (Rapido Delivery)',
      summary: `Urgent point-to-point 2W parcel delivery (${weightKg}kg)`,
      total_time_min: bikeDuration,
      total_cost_inr: bikeCost,
      total_distance_km: bikeDist,
      carbon_kg: bikeCarbon,
      comfort_score: 8,
      mainMode: 'bike',
      is_logistics: true,
      payload_capacity_kg: 15,
      sla_type: 'Urgent Express (<45 min)',
      segments: bikeSegments,
      geocodingMetadata: { origin: originCoord, destination: destCoord }
    },
    {
      id: 'logistics-ev-van',
      name: 'Dedicated Commercial EV Van (Tata Ace EV)',
      summary: `Heavy cargo dispatch via Ring Road logistics bypass`,
      total_time_min: vanDuration,
      total_cost_inr: vanCost,
      total_distance_km: vanDist,
      carbon_kg: vanCarbon,
      comfort_score: 9,
      mainMode: 'cab',
      is_logistics: true,
      payload_capacity_kg: 500,
      sla_type: 'Bulk Cargo Transit',
      segments: vanSegments,
      geocodingMetadata: { origin: originCoord, destination: destCoord }
    },
    {
      id: 'logistics-eloader',
      name: 'Market E-Loader (Wholesale B2B Distribution)',
      summary: `Local zero-emission merchant logistics feeder`,
      total_time_min: loaderDuration,
      total_cost_inr: loaderCost,
      total_distance_km: loaderDist,
      carbon_kg: loaderCarbon,
      comfort_score: 7,
      mainMode: 'auto',
      is_logistics: true,
      payload_capacity_kg: 250,
      sla_type: 'Economical B2B Distribution',
      segments: loaderSegments,
      geocodingMetadata: { origin: originCoord, destination: destCoord }
    }
  ];
}

module.exports = { generateRoutes, generateLogisticsRoutes };
