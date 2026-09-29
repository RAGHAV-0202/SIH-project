import React, { useEffect, useRef, useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import L from 'leaflet';

// High-performance, zero-API-key basemap tile layers (no watermarks)
const BASEMAPS = {
  osmHot: {
    name: 'OSM Transit',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Humanitarian OSM',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  },
  esriStreet: {
    name: 'Esri Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  },
  esriCanvas: {
    name: 'Light Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 16
  }
};

// Verified Delhi NCR transport hubs & landmarks (ground truth coordinates)
const DELHI_STATION_COORDS = {
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'ndls': [28.6430, 77.2194],
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
  'old delhi railway station': [28.6619, 77.2307],
};

const MAJOR_HUBS = [
  { name: 'Rajiv Chowk', coords: [28.6328, 77.2197], lines: 'Blue & Yellow Line Interchange' },
  { name: 'Kashmere Gate', coords: [28.6665, 77.2255], lines: 'Red, Yellow & Violet Line Interchange' },
  { name: 'Hauz Khas', coords: [28.5432, 77.2065], lines: 'Yellow & Magenta Line Interchange' },
  { name: 'Central Secretariat', coords: [28.6146, 77.2119], lines: 'Yellow & Violet Line Interchange' },
  { name: 'Dhaula Kuan', coords: [28.5921, 77.1617], lines: 'Airport Express & Ring Road Feeder' },
];

const memoryGeoCache = new Map();

async function geocodeLocation(placeName, fallback = [28.6139, 77.2090]) {
  if (!placeName || typeof placeName !== 'string') return fallback;
  const clean = placeName.trim().toLowerCase();

  // 1. Direct dictionary match
  if (DELHI_STATION_COORDS[clean]) return DELHI_STATION_COORDS[clean];

  // 2. Exact word match
  for (const [key, coords] of Object.entries(DELHI_STATION_COORDS)) {
    if (clean === key) return coords;
  }

  // 3. Memory cache
  if (memoryGeoCache.has(clean)) return memoryGeoCache.get(clean);

  try {
    const saved = localStorage.getItem(`geo_${clean}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      memoryGeoCache.set(clean, parsed);
      return parsed;
    }
  } catch {}

  // 4. Genuine OpenStreetMap Nominatim geocoding across India
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&countrycodes=in&limit=1`, {
      headers: { 'User-Agent': 'CityFlow-Client-Geocode/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        memoryGeoCache.set(clean, coords);
        try { localStorage.setItem(`geo_${clean}`, JSON.stringify(coords)); } catch {}
        return coords;
      }
    }
  } catch {}

  return fallback;
}

// Custom Pill Marker Icon adapted from previous prototype
function createPillMarkerIcon(color, text, iconEmoji) {
  return L.divIcon({
    className: 'custom-pill-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
        <div style="background-color: ${color}; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.18); border: 2px solid white; display: flex; align-items: center; gap: 5px; font-family: 'Inter', sans-serif;">
          <span>${iconEmoji || '📍'}</span>
          <span>${text}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${color};"></div>
      </div>
    `,
    iconSize: [110, 42],
    iconAnchor: [55, 40]
  });
}

// Vehicle Midpoint Badge Icon
function createVehicleBadgeIcon(bgColor, emoji) {
  return L.divIcon({
    className: 'vehicle-midpoint-marker',
    html: `
      <div style="background: ${bgColor}; color: white; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid white; font-size: 14px;">
        ${emoji}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

// Calculate smooth curved trajectory between two coordinate points
function generateCurvedPoints(p1, p2, curvature = 0.05, numPoints = 15) {
  if (!p1 || !p2) return [p1 || [28.6139, 77.2090], p2 || [28.6139, 77.2090]];
  if (Math.abs(p1[0] - p2[0]) < 0.0001 && Math.abs(p1[1] - p2[1]) < 0.0001) {
    return [p1, [p1[0] + 0.0008, p1[1] + 0.0008]];
  }
  const points = [];
  const dx = p2[1] - p1[1];
  const dy = p2[0] - p1[0];
  const normalX = -dy * curvature;
  const normalY = dx * curvature;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const midX = p1[1] + t * dx + 4 * t * (1 - t) * normalX;
    const midY = p1[0] + t * dy + 4 * t * (1 - t) * normalY;
    points.push([midY, midX]);
  }
  return points;
}

const osrmCache = new Map();

// Fetch realistic turn-by-turn road geometry via OpenStreetMap OSRM routing
async function fetchRoadGeometry(p1, p2) {
  if (!p1 || !p2) return [p1, p2];
  const key = `${p1[0].toFixed(3)},${p1[1].toFixed(3)}_${p2[0].toFixed(3)},${p2[1].toFixed(3)}`;
  if (osrmCache.has(key)) return osrmCache.get(key);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        const latLngs = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        if (latLngs.length > 1) {
          osrmCache.set(key, latLngs);
          return latLngs;
        }
      }
    }
  } catch (e) {}

  const fallback = generateCurvedPoints(p1, p2, 0.08);
  osrmCache.set(key, fallback);
  return fallback;
}

// Authentic DMRC Blue Line station coordinates
const BLUE_LINE_WAYPOINTS = [
  [28.5523, 77.0586], // Dwarka Sec 21
  [28.5693, 77.0718], // Dwarka Sec 8
  [28.5746, 77.0645], // Dwarka Sec 9
  [28.5815, 77.0573], // Dwarka Sec 10
  [28.5878, 77.0505], // Dwarka Sec 11
  [28.5921, 77.0460], // Dwarka Sec 12
  [28.6190, 77.0320], // Dwarka Mor
  [28.6294, 77.0777], // Janakpuri West
  [28.6366, 77.0967], // Tilak Nagar
  [28.6492, 77.1232], // Rajouri Garden
  [28.6578, 77.1425], // Moti Nagar
  [28.6579, 77.1652], // Patel Nagar
  [28.6514, 77.1907], // Karol Bagh
  [28.6441, 77.2003], // Jhandewalan
  [28.6391, 77.2091], // RK Ashram Marg
  [28.6328, 77.2197]  // Rajiv Chowk
];

// Authentic DMRC Yellow Line station coordinates
const YELLOW_LINE_WAYPOINTS = [
  [28.6665, 77.2255], // Kashmere Gate
  [28.6506, 77.2303], // Chandni Chowk
  [28.6430, 77.2194], // New Delhi
  [28.6328, 77.2197], // Rajiv Chowk
  [28.6231, 77.2144], // Patel Chowk
  [28.6146, 77.2119], // Central Secretariat
  [28.5746, 77.2095], // INA
  [28.5686, 77.2078], // AIIMS
  [28.5432, 77.2065], // Hauz Khas
  [28.5244, 77.2066], // Saket
  [28.4593, 77.0724]  // HUDA City Centre
];

function getMetroLineCoordinates(fromName, toName, p1, p2) {
  const f = (fromName || '').toLowerCase();
  const t = (toName || '').toLowerCase();

  const isBlue = (f.includes('dwarka') || t.includes('dwarka')) && 
      (f.includes('rajiv') || t.includes('connaught') || t.includes('cp') || f.includes('cp') || t.includes('mandi') || f.includes('mandi') || t.includes('rajiv'));

  if (isBlue) {
    return f.includes('dwarka') ? BLUE_LINE_WAYPOINTS : [...BLUE_LINE_WAYPOINTS].reverse();
  }

  const isYellow = (f.includes('kashmere') || f.includes('samaypur') || f.includes('azadpur')) && 
      (t.includes('hauz') || t.includes('saket') || t.includes('gurgaon') || t.includes('huda') || t.includes('cyber') || t.includes('rajiv'));

  if (isYellow) {
    return YELLOW_LINE_WAYPOINTS;
  }

  // Geographic waypoint alignment for Blue Line
  if (p1 && p2) {
    const distSq = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    let minD1 = Infinity, idx1 = -1;
    let minD2 = Infinity, idx2 = -1;
    BLUE_LINE_WAYPOINTS.forEach((pt, idx) => {
      const d1 = distSq(pt, p1);
      const d2 = distSq(pt, p2);
      if (d1 < minD1) { minD1 = d1; idx1 = idx; }
      if (d2 < minD2) { minD2 = d2; idx2 = idx; }
    });
    if (minD1 < 0.005 && minD2 < 0.005 && idx1 !== idx2) {
      return idx1 < idx2
        ? BLUE_LINE_WAYPOINTS.slice(idx1, idx2 + 1)
        : BLUE_LINE_WAYPOINTS.slice(idx2, idx1 + 1).reverse();
    }
  }

  return generateCurvedPoints(p1, p2, 0.05);
}

export default function RouteMap({
  route,
  origin = 'Dwarka Sec 21',
  destination = 'Connaught Place',
  isDetailsOpen = true,
  onToggleDetails
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [basemapKey, setBasemapKey] = useState('osmHot');

  // Invalidate map size whenever bottom drawer is opened or collapsed
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 500);
    }
  }, [isDetailsOpen]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true
    }).setView([28.6139, 77.2090], 12);

    // Initial zero-key basemap tile layer
    const activeBasemap = BASEMAPS[basemapKey] || BASEMAPS.osmHot;
    tileLayerRef.current = L.tileLayer(activeBasemap.url, {
      maxZoom: activeBasemap.maxZoom,
      subdomains: activeBasemap.subdomains || 'abc',
      attribution: activeBasemap.attribution
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate size to guarantee tiles load without blank spots
    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 500);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update basemap layer when user changes style
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const activeBasemap = BASEMAPS[basemapKey] || BASEMAPS.osmHot;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(activeBasemap.url, {
      maxZoom: activeBasemap.maxZoom,
      subdomains: activeBasemap.subdomains || 'abc',
      attribution: activeBasemap.attribution
    }).addTo(mapInstanceRef.current);
  }, [basemapKey]);

  // Update Route / Render Map
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;
    lg.clearLayers();

    let isMounted = true;

    async function renderMap() {
      // 1. Resolve Origin and Destination coordinates
      const originCoords = await geocodeLocation(origin, [28.5523, 77.0586]);
      const destCoords = await geocodeLocation(destination, [28.6315, 77.2167]);

      if (!isMounted) return;

      // Add Origin Marker (Terracotta pill)
      L.marker(originCoords, {
        icon: createPillMarkerIcon('#C26D38', origin, '🛫')
      }).addTo(lg).bindPopup(`<b>Origin</b>: ${origin}`);

      // Add Destination Marker (Forest Emerald pill)
      L.marker(destCoords, {
        icon: createPillMarkerIcon('#006C4A', destination, '🎯')
      }).addTo(lg).bindPopup(`<b>Destination</b>: ${destination}`);

      // If a route with segments is selected
      if (route && route.segments && route.segments.length > 0) {
        const allPoints = [];

        for (let i = 0; i < route.segments.length; i++) {
          const seg = route.segments[i];
          let p1 = seg.fromCoords;
          let p2 = seg.toCoords;

          if (!p1) p1 = await geocodeLocation(seg.from, originCoords);
          if (!p2) p2 = await geocodeLocation(seg.to, destCoords);

          if (!isMounted) return;

          allPoints.push(p1);
          allPoints.push(p2);

          const segType = (seg.type || 'walk').toLowerCase();

          // ─── AUTHENTIC MULTI-LAYER TRANSIT VISUALIZATION ───
          if (segType === 'metro') {
            const polyCoords = getMetroLineCoordinates(seg.from, seg.to, p1, p2);
            polyCoords.forEach(pt => allPoints.push(pt));

            // Metro Track: Steel rail base + sleeper ties + colored glow
            L.polyline(polyCoords, {
              color: '#1E293B',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round'
            }).addTo(lg);

            L.polyline(polyCoords, {
              color: '#F8FAFC',
              weight: 4,
              opacity: 0.95,
              dashArray: '5, 9'
            }).addTo(lg);

            L.polyline(polyCoords, {
              color: seg.line_color || '#C26D38',
              weight: 3,
              opacity: 0.9
            }).addTo(lg).bindPopup(`
              <div style="font-family: 'Inter', sans-serif; padding: 4px;">
                <strong style="color: #C26D38; font-size: 13px;">🚇 DMRC Metro: ${seg.from} ➔ ${seg.to}</strong><br/>
                <span style="font-size: 12px; color: #4F5D72;">${seg.duration} min | ₹${seg.cost} | ${seg.line || 'Metro Line'}</span>
              </div>
            `);

            // Midpoint vehicle badge
            const midIndex = Math.floor(polyCoords.length / 2);
            const mid = polyCoords[midIndex] || [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
            L.marker(mid, { icon: createVehicleBadgeIcon('#C26D38', '🚇') }).addTo(lg);

          } else if (segType === 'bus') {
            const polyCoords = await fetchRoadGeometry(p1, p2);
            polyCoords.forEach(pt => allPoints.push(pt));

            // Bus Highway: Asphalt base + emerald road surface + white dashed lane line
            L.polyline(polyCoords, {
              color: '#064E3B',
              weight: 7,
              opacity: 0.85,
              lineCap: 'round'
            }).addTo(lg);

            L.polyline(polyCoords, {
              color: '#059669',
              weight: 4,
              opacity: 1
            }).addTo(lg);

            L.polyline(polyCoords, {
              color: '#FFFFFF',
              weight: 1.5,
              opacity: 0.95,
              dashArray: '6, 8'
            }).addTo(lg).bindPopup(`
              <div style="font-family: 'Inter', sans-serif; padding: 4px;">
                <strong style="color: #006C4A; font-size: 13px;">🚌 DTC Bus: ${seg.from} ➔ ${seg.to}</strong><br/>
                <span style="font-size: 12px; color: #4F5D72;">${seg.duration} min | ₹${seg.cost} | ${seg.line || 'DTC Route'}</span>
              </div>
            `);

            const midIndex = Math.floor(polyCoords.length / 2);
            const mid = polyCoords[midIndex] || [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
            L.marker(mid, { icon: createVehicleBadgeIcon('#006C4A', '🚌') }).addTo(lg);

          } else if (segType === 'cab' || segType === 'auto' || segType === 'bike') {
            const polyCoords = await fetchRoadGeometry(p1, p2);
            polyCoords.forEach(pt => allPoints.push(pt));

            const isCab = segType === 'cab';
            const color = isCab ? '#E11D48' : '#D97706';
            const emoji = isCab ? '🚗' : (segType === 'bike' ? '🛵' : '🛺');

            L.polyline(polyCoords, {
              color,
              weight: 5,
              opacity: 0.9,
              lineCap: 'round'
            }).addTo(lg).bindPopup(`
              <div style="font-family: 'Inter', sans-serif; padding: 4px;">
                <strong style="color: ${color}; font-size: 13px;">${emoji} ${seg.type.toUpperCase()}: ${seg.from} ➔ ${seg.to}</strong><br/>
                <span style="font-size: 12px; color: #4F5D72;">${seg.duration} min | ₹${seg.cost}</span>
              </div>
            `);

            const midIndex = Math.floor(polyCoords.length / 2);
            const mid = polyCoords[midIndex] || [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
            L.marker(mid, { icon: createVehicleBadgeIcon(color, emoji) }).addTo(lg);

          } else {
            // Walk segment: Dotted walking trail
            L.polyline([p1, p2], {
              color: '#64748B',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '6, 6'
            }).addTo(lg).bindPopup(`<b>🚶‍♂️ Walking Leg</b>: ${seg.from} ➔ ${seg.to} (${seg.duration} min)`);
          }

          // Transfer waypoint marker
          if (i > 0) {
            L.circleMarker(p1, {
              radius: 6,
              fillColor: '#FFFFFF',
              color: '#131B2E',
              weight: 3,
              fillOpacity: 1
            }).addTo(lg).bindPopup(`<strong>Transfer Hub</strong>: ${seg.from}`);
          }
        }

        // Fit map bounds to show complete multimodal trajectory
        if (allPoints.length > 0) {
          const bounds = L.latLngBounds(allPoints);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        }

      } else {
        // Default Mode: Plot authentic turn-by-turn road corridor between origin & destination
        const defaultPath = await fetchRoadGeometry(originCoords, destCoords);
        if (!isMounted) return;

        // Base road casing
        L.polyline(defaultPath, {
          color: '#1E293B',
          weight: 6,
          opacity: 0.85,
          lineCap: 'round'
        }).addTo(lg);

        // Vibrant terracotta corridor highway ribbon
        L.polyline(defaultPath, {
          color: '#C26D38',
          weight: 4,
          opacity: 0.95,
          lineCap: 'round'
        }).addTo(lg).bindPopup(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px;">
            <strong style="color: #C26D38; font-size: 13px;">⚡ Direct Transit Corridor: ${origin} ➔ ${destination}</strong><br/>
            <span style="font-size: 12px; color: #4F5D72;">Click <em>Dispatch Multimodal Route</em> to view all Pareto-optimal transit options</span>
          </div>
        `);

        // Center dashes
        L.polyline(defaultPath, {
          color: '#FFFFFF',
          weight: 1.5,
          opacity: 0.95,
          dashArray: '6, 8'
        }).addTo(lg);

        // Midpoint badge
        const midIndex = Math.floor(defaultPath.length / 2);
        const mid = defaultPath[midIndex] || [(originCoords[0] + destCoords[0]) / 2, (originCoords[1] + destCoords[1]) / 2];
        L.marker(mid, { icon: createVehicleBadgeIcon('#C26D38', '⚡') }).addTo(lg);

        // Major interchange hubs on the map
        MAJOR_HUBS.forEach(hub => {
          L.circleMarker(hub.coords, {
            radius: 5,
            fillColor: '#C26D38',
            color: '#FFFFFF',
            weight: 2,
            fillOpacity: 0.9
          }).addTo(lg).bindPopup(`<strong>DMRC Interchange</strong>: ${hub.name}<br/><small>${hub.lines}</small>`);
        });

        // Fit to full corridor road path
        const bounds = L.latLngBounds(defaultPath);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
      }

      // Ensure tile sizes are refreshed
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    renderMap();

    return () => {
      isMounted = false;
    };
  }, [route, origin, destination]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#FAF8FF] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Floating Basemap Style Switcher */}
      <div className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-1.5 text-xs font-semibold text-[#131B2E]">
        <div className="flex items-center gap-1 text-[#C26D38] font-bold text-[11px] uppercase tracking-wider pr-1 border-r border-slate-200 font-display">
          <Layers className="w-3.5 h-3.5" />
          <span>Tiles</span>
        </div>
        <button
          type="button"
          onClick={() => setBasemapKey('osmHot')}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            basemapKey === 'osmHot'
              ? 'bg-[#C26D38] text-white shadow-2xs font-bold'
              : 'text-[#4F5D72] hover:bg-slate-100'
          }`}
          title="OpenStreetMap Humanitarian Daylight Transit Tiles"
        >
          OSM Transit
        </button>
        <button
          type="button"
          onClick={() => setBasemapKey('esriStreet')}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            basemapKey === 'esriStreet'
              ? 'bg-[#C26D38] text-white shadow-2xs font-bold'
              : 'text-[#4F5D72] hover:bg-slate-100'
          }`}
          title="Esri World Street High-Resolution Arterial Map"
        >
          Esri Streets
        </button>
        <button
          type="button"
          onClick={() => setBasemapKey('esriCanvas')}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            basemapKey === 'esriCanvas'
              ? 'bg-[#C26D38] text-white shadow-2xs font-bold'
              : 'text-[#4F5D72] hover:bg-slate-100'
          }`}
          title="Minimal High-Contrast Gray Canvas"
        >
          Light Canvas
        </button>

        {onToggleDetails && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              type="button"
              onClick={onToggleDetails}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isDetailsOpen
                  ? 'bg-[#006C4A] text-white shadow-2xs font-bold'
                  : 'text-[#4F5D72] hover:bg-slate-100 hover:text-[#131B2E]'
              }`}
              title={isDetailsOpen ? 'Hide bottom journey panel for full map' : 'Show journey details panel'}
            >
              {isDetailsOpen ? <EyeOff className="w-3.5 h-3.5 text-[#C26D38]" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isDetailsOpen ? 'Hide Panel' : 'Show Panel'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
