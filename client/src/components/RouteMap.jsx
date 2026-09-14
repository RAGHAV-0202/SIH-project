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
  wayanad: [11.6854, 76.1320],
  ooty: [11.4102, 76.6950],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],
  coorg: [12.3375, 75.8069],
  madurai: [9.9252, 78.1198],
  guwahati: [26.1445, 91.7362],
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
  chittorgarh: [24.8887, 74.6269]
};

function resolveCoords(cityName, fallback = [28.6139, 77.2090]) {
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

    const originCoords = resolveCoords(cleanOrigin, [28.6139, 77.2090]);
    const destCoords = resolveCoords(cleanDest, [32.2396, 77.1887]);

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
    const mode = selectedOption?.mode || 'road';
    const isFlight = mode.includes('flight');
    const isTrain = mode.includes('train');

    let routeCoords = [];
    let polylineOptions = {};

    if (isFlight) {
      // Arched air trajectory
      routeCoords = getArchedPoints(originCoords, destCoords);
      polylineOptions = {
        color: '#0284C7',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8'
      };
    } else if (isTrain) {
      // Rail Corridor - if intermediate nodes exist, pass through them
      if (corridorNodes && corridorNodes.length > 2) {
        routeCoords = [originCoords];
        corridorNodes.slice(1, -1).forEach(node => {
          routeCoords.push(resolveCoords(node.label, originCoords));
        });
        routeCoords.push(destCoords);
      } else {
        routeCoords = [originCoords, destCoords];
      }
      polylineOptions = {
        color: '#D97706',
        weight: 4,
        opacity: 0.9,
        dashArray: '12, 6'
      };
    } else {
      // Road / Highway (Bus or Cab)
      if (corridorNodes && corridorNodes.length > 2) {
        routeCoords = [originCoords];
        corridorNodes.slice(1, -1).forEach(node => {
          routeCoords.push(resolveCoords(node.label, originCoords));
        });
        routeCoords.push(destCoords);
      } else {
        routeCoords = [originCoords, destCoords];
      }
      polylineOptions = {
        color: '#059669',
        weight: 4,
        opacity: 0.9
      };
    }

    L.polyline(routeCoords, polylineOptions).addTo(map);

    // Intermediate waypoint markers if available
    if (corridorNodes && corridorNodes.length > 2) {
      corridorNodes.slice(1, -1).forEach(node => {
        const coords = resolveCoords(node.label, null);
        if (coords) {
          L.circleMarker(coords, {
            radius: 5,
            fillColor: '#475569',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
          }).addTo(map).bindPopup(`<b>Waypoint</b>: ${node.label} (${node.alt || 'Transit'})`);
        }
      });
    }

    // Fit map to show both markers nicely with padding
    const bounds = L.latLngBounds([originCoords, destCoords]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });

    // Trigger map resize after render to avoid tile blanking
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
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
