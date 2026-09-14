import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Known coordinates for Indian cities and transport hubs
const CITY_COORDINATES = {
  delhi: [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  ndls: [28.6430, 77.2194],
  manali: [32.2396, 77.1887],
  shimla: [31.1048, 77.1734],
  kullu: [31.9579, 77.1095],
  bhuntar: [31.8790, 77.1542],
  rishikesh: [30.0869, 78.2676],
  haridwar: [29.9457, 78.1642],
  dehradun: [30.3165, 78.0322],
  chandigarh: [30.7333, 76.7794],
  jaipur: [26.9124, 75.7873],
  mumbai: [19.0760, 72.8777],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.3850, 78.4867],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  goa: [15.2993, 74.1240],
  panaji: [15.4909, 73.8278],
  udaipur: [24.5854, 73.7125],
  jodhpur: [26.2389, 73.0243],
  jaisalmer: [26.9157, 70.9083],
  leh: [34.1526, 77.5771],
  ladakh: [34.1526, 77.5771],
  spiti: [32.2461, 78.0349],
  kaza: [32.2276, 78.0710],
  amritsar: [31.6340, 74.8723],
  srinagar: [34.0837, 74.7973],
  agra: [27.1767, 78.0081],
  varanasi: [25.3176, 82.9739],
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  patna: [25.5941, 85.1376],
  kochi: [9.9312, 76.2673],
  munnar: [10.0889, 77.0595],
  alleppey: [9.4981, 76.3388],
  alappuzha: [9.4981, 76.3388],
  aluva: [10.1076, 76.3516],
  kumarakom: [9.6175, 76.4301],
  wayanad: [11.6854, 76.1320],
  ooty: [11.4102, 76.6950],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],
  kushalnagar: [12.4556, 75.9622],
  madikeri: [12.4244, 75.7382],
  coorg: [12.3375, 75.8069],
  madurai: [9.9252, 78.1198],
  guwahati: [26.1445, 91.7362],
  nongpoh: [25.9034, 91.8803],
  umiam: [25.6669, 91.9056],
  'umiam lake': [25.6669, 91.9056],
  shillong: [25.5788, 91.8933],
  gangtok: [27.3314, 88.6138],
  darjeeling: [27.0410, 88.2663],
  dharamshala: [32.2190, 76.3234],
  mcleodganj: [32.2426, 76.3213],
  kasol: [32.0100, 77.3150],
  mandi: [31.7087, 76.9320],
  meerut: [28.9845, 77.7064],
  alwar: [27.5530, 76.6346],
  gurugram: [28.4595, 77.0266],
  noida: [28.5355, 77.3910],
  chittorgarh: [24.8887, 74.6269],
  aravalli: [24.7892, 73.6841]
};

// Global in-memory cache for geocoded coordinates
const memoryGeoCache = new Map();

/**
 * Dynamic Geocoding via OpenStreetMap Nominatim API.
 * 1. Checks in-memory cache
 * 2. Checks browser localStorage cache
 * 3. Checks built-in static dictionary
 * 4. Queries OpenStreetMap Nominatim API dynamically for any city/town/village
 * 5. Caches result for instant zero-latency subsequent lookups
 */
async function geocodePlace(placeName, fallback = [28.6139, 77.2090]) {
  if (!placeName || typeof placeName !== 'string') return fallback;
  
  // Clean query: remove parentheticals like "Madikeri (Coorg)" -> "Madikeri Coorg"
  const clean = placeName.replace(/[\(\)]/g, ' ').replace(/\s+/g, ' ').trim();
  const cacheKey = clean.toLowerCase();

  // 1. In-memory cache hit
  if (memoryGeoCache.has(cacheKey)) {
    return memoryGeoCache.get(cacheKey);
  }

  // 2. LocalStorage cache hit
  try {
    const saved = localStorage.getItem(`geo_${cacheKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 2) {
        memoryGeoCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // Ignore localStorage errors (e.g. incognito mode quota)
  }

  // 3. Fast check against built-in dictionary
  const staticMatch = resolveStaticCoords(clean, null);
  if (staticMatch) {
    memoryGeoCache.set(cacheKey, staticMatch);
    return staticMatch;
  }

  // 4. Dynamic query to OpenStreetMap Nominatim
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(clean)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        memoryGeoCache.set(cacheKey, coords);
        try {
          localStorage.setItem(`geo_${cacheKey}`, JSON.stringify(coords));
        } catch (e) {}
        console.log(`📍 Dynamic Geocode resolved: "${placeName}" -> [${coords[0]}, ${coords[1]}]`);
        return coords;
      }
    }
  } catch (err) {
    console.warn(`Dynamic geocoding for "${placeName}" encountered: ${err.message}`);
  }

  // 5. Final fallback
  return resolveStaticCoords(clean, fallback);
}

function resolveStaticCoords(cityName, fallback = [28.6139, 77.2090]) {
  if (!cityName || typeof cityName !== 'string') return fallback;
  const clean = cityName.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  
  // Direct match
  if (CITY_COORDINATES[clean]) return CITY_COORDINATES[clean];

  // Substring match
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  return fallback;
}

// Generate an arched curve (geodesic-like) for flights
function getArchedPoints(start, end, numPoints = 25) {
  const points = [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;
  
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;
  const distance = Math.hypot(lat2 - lat1, lng2 - lng1);
  const archHeight = Math.min(distance * 0.22, 2.5);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * (midLat + archHeight) + t * t * lat2;
    const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * midLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

export default function RouteMap({
  originCity = 'Delhi',
  destinationCity = 'Manali',
  selectedOption = null,
  corridorNodes = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Clean names
  const cleanOrigin = (originCity && !originCity.startsWith('http')) ? originCity : 'Delhi';
  const cleanDest = (destinationCity && !destinationCity.startsWith('http')) ? destinationCity : 'Manali';

  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    async function initMap() {
      // 1. Dynamically geocode origin, destination, and corridor intermediate waypoints
      const originCoords = await geocodePlace(cleanOrigin, [28.6139, 77.2090]);
      const destCoords = await geocodePlace(cleanDest, [32.2396, 77.1887]);

      // Resolve any intermediate corridor waypoints dynamically
      let resolvedWaypoints = [];
      if (corridorNodes && corridorNodes.length > 2) {
        const intermediate = corridorNodes.slice(1, -1);
        resolvedWaypoints = await Promise.all(
          intermediate.map(async (node) => {
            const pt = await geocodePlace(node.label, null);
            return { node, pt };
          })
        );
      }

      if (isCancelled || !mapContainerRef.current) return;

      // Cleanup previous map if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
      });
      mapInstanceRef.current = map;

      // Add standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Marker Icons
      const createCustomIcon = (color, text, iconSvg) => {
        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
              <div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: 600; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white; display: flex; align-items: center; gap: 4px;">
                ${iconSvg || ''}
                <span>${text}</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${color};"></div>
            </div>
          `,
          iconSize: [80, 40],
          iconAnchor: [40, 38]
        });
      };

      const originMarker = L.marker(originCoords, {
        icon: createCustomIcon('#C26D38', cleanOrigin, '🛫')
      }).addTo(map);
      originMarker.bindPopup(`<b>Origin</b><br/>${cleanOrigin}`);

      const destMarker = L.marker(destCoords, {
        icon: createCustomIcon('#059669', cleanDest, '📍')
      }).addTo(map);
      destMarker.bindPopup(`<b>Destination</b><br/>${cleanDest}`);

      // Mode determination
      const mode = (selectedOption?.mode || '').toLowerCase();
      const isFlight = mode.includes('flight') || selectedOption?.operator?.toLowerCase().includes('air') || selectedOption?.operator?.toLowerCase().includes('flight');
      const isTrain = mode.includes('train') || selectedOption?.operator?.toLowerCase().includes('railways') || selectedOption?.operator?.toLowerCase().includes('express') || selectedOption?.operator?.toLowerCase().includes('shatabdi') || selectedOption?.operator?.toLowerCase().includes('vande');

      let routeCoords = [];

      if (isFlight) {
        // 1. FLIGHT: Beautiful Geodesic Arched Sky Route with Halo
        routeCoords = getArchedPoints(originCoords, destCoords);

        // Soft atmospheric halo
        L.polyline(routeCoords, {
          color: '#38BDF8',
          weight: 7,
          opacity: 0.3,
          lineCap: 'round',
        }).addTo(map);

        // Primary flight dashed trajectory
        L.polyline(routeCoords, {
          color: '#0284C7',
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);

        // Add a midpoint airplane marker along the arc
        const midIndex = Math.floor(routeCoords.length / 2);
        const midPoint = routeCoords[midIndex];
        const planeIcon = L.divIcon({
          className: 'plane-flight-marker',
          html: `
            <div style="background: #0284C7; color: white; width: 26px; height: 26px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4); border: 2px solid white; font-size: 13px;">
              ✈️
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker(midPoint, { icon: planeIcon }).addTo(map).bindPopup(`<b>Air Corridor</b>: Direct Flight Path`);

      } else if (isTrain) {
        // 2. RAILWAY TRACK: Multi-layered authentic train track representation with railroad ties
        routeCoords = [originCoords];
        resolvedWaypoints.forEach(({ pt }) => {
          if (pt && (pt[0] !== originCoords[0] || pt[1] !== originCoords[1]) && (pt[0] !== destCoords[0] || pt[1] !== destCoords[1])) {
            routeCoords.push(pt);
          }
        });
        if (routeCoords.length === 1) {
          // Natural curve midpoint if no waypoints
          const midLat = (originCoords[0] + destCoords[0]) / 2;
          const midLng = (originCoords[1] + destCoords[1]) / 2 + 0.08;
          routeCoords.push([midLat, midLng]);
        }
        routeCoords.push(destCoords);

        // Track Base (Steel Rail foundation)
        L.polyline(routeCoords, {
          color: '#1E293B',
          weight: 6,
          opacity: 0.9,
        }).addTo(map);

        // Railroad Sleeper Ties (Intermittent high-contrast dashes)
        L.polyline(routeCoords, {
          color: '#F8FAFC',
          weight: 4,
          opacity: 0.95,
          dashArray: '5, 10',
        }).addTo(map);

        // Center High-Speed Rail Glow
        L.polyline(routeCoords, {
          color: '#D97706',
          weight: 2,
          opacity: 0.9,
        }).addTo(map);

        // Midpoint train station icon
        const midIndex = Math.floor(routeCoords.length / 2);
        const midPoint = routeCoords[midIndex];
        const trainIcon = L.divIcon({
          className: 'train-track-marker',
          html: `
            <div style="background: #D97706; color: white; width: 26px; height: 26px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.4); border: 2px solid white; font-size: 13px;">
              🚆
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker(midPoint, { icon: trainIcon }).addTo(map).bindPopup(`<b>Railway Corridor</b>: Dedicated Indian Railways Track`);

      } else {
        // 3. ROAD / HIGHWAY: Authentic road geometry (solid highway ribbon with center lane dash)
        let roadPath = [originCoords];
        resolvedWaypoints.forEach(({ pt }) => {
          if (pt && (pt[0] !== originCoords[0] || pt[1] !== originCoords[1]) && (pt[0] !== destCoords[0] || pt[1] !== destCoords[1])) {
            roadPath.push(pt);
          }
        });
        if (roadPath.length === 1) {
          // Natural highway curve through real geography
          const midLat = (originCoords[0] + destCoords[0]) / 2 - 0.05;
          const midLng = (originCoords[1] + destCoords[1]) / 2 - 0.04;
          roadPath.push([midLat, midLng]);
        }
        roadPath.push(destCoords);

        // Outer Highway Asphalt Bed
        L.polyline(roadPath, {
          color: '#065F46',
          weight: 7,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Inner Highway Road Surface
        L.polyline(roadPath, {
          color: '#10B981',
          weight: 4,
          opacity: 1.0,
        }).addTo(map);

        // Center Lane Road Dashes
        L.polyline(roadPath, {
          color: '#FFFFFF',
          weight: 1.5,
          opacity: 0.9,
          dashArray: '6, 8',
        }).addTo(map);

        // Midpoint vehicle badge
        const midIndex = Math.floor(roadPath.length / 2);
        const midPoint = roadPath[midIndex];
        const roadIcon = L.divIcon({
          className: 'road-highway-marker',
          html: `
            <div style="background: #059669; color: white; width: 26px; height: 26px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.4); border: 2px solid white; font-size: 13px;">
              ${mode.includes('bus') ? '🚌' : '🚗'}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker(midPoint, { icon: roadIcon }).addTo(map).bindPopup(`<b>National Highway Corridor</b>: Road & Bus Transit`);
      }

      // Intermediate waypoint markers if available
      resolvedWaypoints.forEach(({ node, pt }) => {
        if (pt) {
          L.circleMarker(pt, {
            radius: 5,
            fillColor: '#475569',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
          }).addTo(map).bindPopup(`<b>Waypoint</b>: ${node.label} (${node.alt || 'Transit'})`);
        }
      });

      // Fit map to show all relevant route coordinates nicely with padding
      const allPoints = [originCoords, destCoords, ...resolvedWaypoints.map(w => w.pt).filter(Boolean)];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });

      // Trigger map resize after render to avoid tile blanking
      setTimeout(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cleanOrigin, cleanDest, selectedOption, corridorNodes]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-xs z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
