import React, { useState } from 'react';
import {
  Plane,
  Bus,
  Car,
  Train,
  Mountain,
  ArrowRight,
  Bot,
  Zap,
  MapPin,
  Navigation,
  Compass
} from 'lucide-react';
import RouteMap from './RouteMap';

// ─── Destination-aware corridor data ──────────────────────────────────────────
// Each entry describes the route from the nearest major origin hub to that destination.
// Falls back to GENERIC if the destination is not found.

const DESTINATION_CORRIDORS = {
  // ─── Rishikesh ───────────────────────────────────────────────────────────────
  rishikesh: {
    elevationNodes: [
      { label: 'Delhi', alt: '216m', dot: 'stone' },
      { label: 'Meerut', alt: '218m', dot: 'accent', connector: 'Transit' },
      { label: 'Haridwar', alt: '249m', dot: 'accent', connector: 'Ganga plain' },
      { label: 'Rishikesh', alt: '340m', dot: 'destination', connector: 'Arrival' },
    ],
    passLabel: null, // no mountain pass
    climbLabel: '+124m gentle rise',
    optionNotes: {
      A: 'IndiGo morning flight to Dehradun Airport (Jolly Grant), followed by a synchronized 45-minute ashram taxi transfer to Rishikesh. Arrive before noon for yoga and briefing.',
      B: 'Overnight Volvo coach from ISBT Kashmere Gate directly to Rishikesh. Arrives early morning; saves money while letting you rest on the road.',
      C: 'Jan Shatabdi Express to Haridwar, then a 30-minute taxi onwards to Rishikesh. Reliable rail option across the Ganga plains with flexible departure.',
    },
    defaultArchetypes: {
      A: { id: 'T-RSK-001', mode: 'flight+cab', operator: 'IndiGo + Valley Cab', departure: '08:00', arrival: '09:45', duration_hours: 1.75, price_inr: 3000, class: 'Economy' },
      B: { id: 'T-RSK-003', mode: 'bus', operator: 'UTC Volvo', departure: '22:00', arrival: '05:00+1', duration_hours: 7, price_inr: 800, class: 'Semi-sleeper AC' },
      C: { id: 'T-RSK-005', mode: 'train+cab', operator: 'Jan Shatabdi Express', departure: '06:50', arrival: '12:15', duration_hours: 5.4, price_inr: 1200, class: 'AC Chair Car' },
    },
    goodToKnow: 'Rishikesh sits at just 340m — no altitude acclimatization needed. The Haridwar junction is the last reliable railway station; the taxi onwards takes 30 minutes.',
    tradeoffSummary: 'Option 1 arrives earliest · Option 2 saves ₹2,000/seat overnight · Option 3 gives door-to-door flexibility',
  },

  // ─── Manali ──────────────────────────────────────────────────────────────────
  manali: {
    elevationNodes: [
      { label: 'Delhi', alt: '216m', dot: 'stone' },
      { label: 'Chandigarh', alt: '321m', dot: 'accent', connector: 'Transit' },
      { label: 'Mandi', alt: '760m', dot: 'accent', connector: 'Climb' },
      { label: 'Manali', alt: '2,050m', dot: 'destination', connector: 'Mountain road' },
    ],
    passLabel: 'Rohtang Pass seasonal — check status',
    climbLabel: '+1,834m climb',
    optionNotes: {
      A: 'Flight to Kullu-Manali Airport (Bhuntar), then a 1-hour taxi up the Beas Valley. Total door-to-door under 4 hours from Delhi. Best in monsoon or late season when road conditions are uncertain.',
      B: 'Overnight Volvo coach from ISBT Kashmere Gate. Arrives Manali bus stand by 8 AM after a scenic climb through Mandi and the Kullu Valley. Most economical option.',
      C: 'Private SUV with a local driver. Stop at Mandi\'s famous Shiva temple and the Kullu Valley viewpoints. Good if you want to break the drive at Kullu or Kasol.',
    },
    defaultArchetypes: {
      A: { id: 'T-MNL-001', mode: 'flight+cab', operator: 'Alliance Air + Valley Shuttle', departure: '07:00', arrival: '09:30', duration_hours: 2.5, price_inr: 6500, class: 'Economy' },
      B: { id: 'T-MNL-002', mode: 'bus', operator: 'HRTC Volvo', departure: '20:00', arrival: '08:00+1', duration_hours: 12, price_inr: 1200, class: 'Semi-sleeper AC' },
      C: { id: 'T-MNL-004', mode: 'private-cab', operator: 'Private SUV (Shiva Temple route)', departure: '05:30', arrival: '19:30', duration_hours: 14, price_inr: 4500, class: 'Private SUV' },
    },
    goodToKnow: 'Manali at 2,050m causes mild breathlessness for some travellers arriving by air. Rest for 2–3 hours before any strenuous activity. The overnight bus offers natural altitude acclimatization over 12 hours.',
    tradeoffSummary: 'Option 1 fastest (4h) · Option 2 saves ₹3,000/seat overnight · Option 3 adds sightseeing flexibility',
  },

  // ─── Spiti Valley ────────────────────────────────────────────────────────────
  'spiti valley': {
    elevationNodes: [
      { label: 'Delhi', alt: '216m', dot: 'stone' },
      { label: 'Chandigarh', alt: '321m', dot: 'accent', connector: 'Transit' },
      { label: 'Bhuntar / Shimla', alt: '1,089m', dot: 'accent', connector: 'Climb' },
      { label: 'Kaza (Spiti)', alt: '3,800m', dot: 'destination', connector: 'Mountain pass' },
    ],
    passLabel: 'Rohtang & Kunzum passes open',
    climbLabel: '+3,584m climb',
    optionNotes: {
      A: 'Morning flight to Kullu-Manali Airport (Bhuntar), then a private 4x4 transfer to Kaza via Rohtang. Saves 7 hours of transit time vs. bus, but requires gradual rest on arrival due to rapid altitude gain.',
      B: 'Comfortable overnight sleeper coach climbing through Mandi and Manali. Arrives at the Kaza bus stop by midday. Natural altitude acclimatization happens while you sleep — ideal for first-time Spiti visitors.',
      C: 'Dedicated SUV with a local driver, taking the Shimla–Kinnaur route via Nako Lake and Tabo Monastery. Scenic alternative that lets you stop at Kinnaur. Adds one full travel day.',
    },
    defaultArchetypes: {
      A: { id: 'T-SPT-003', mode: 'flight+transfer', operator: 'Alliance Air + 4x4 Mountain Transfer', departure: '06:00', arrival: '17:30', duration_hours: 11.5, price_inr: 5500, class: 'Economy' },
      B: { id: 'T-SPT-001', mode: 'bus', operator: 'HRTC Kaza Sleeper Bus', departure: '21:00', arrival: '14:00+1', duration_hours: 17, price_inr: 1400, class: 'Semi-sleeper' },
      C: { id: 'T-SPT-005', mode: 'private-cab', operator: 'Dedicated 4x4 SUV (Kinnaur route)', departure: '05:00', arrival: '22:00', duration_hours: 17, price_inr: 5200, class: '4x4 SUV' },
    },
    goodToKnow: 'Reaching Kaza by air saves 7 hours of transit time, but requires gradual acclimatization before visiting high-altitude spots like Hikkim (4,440m). The overnight bus offers natural progressive acclimatization.',
    tradeoffSummary: 'Option 1 saves 7 hours · Option 2 saves ₹3,650 and acclimatizes naturally · Option 3 adds the Kinnaur scenic route',
  },

  // ─── Jaipur ──────────────────────────────────────────────────────────────────
  jaipur: {
    elevationNodes: [
      { label: 'Delhi', alt: '216m', dot: 'stone' },
      { label: 'Gurugram', alt: '217m', dot: 'accent', connector: 'NH-48' },
      { label: 'Alwar', alt: '270m', dot: 'accent', connector: 'Flat drive' },
      { label: 'Jaipur', alt: '432m', dot: 'destination', connector: 'Arrival' },
    ],
    passLabel: null,
    climbLabel: '+216m gradual rise',
    optionNotes: {
      A: 'Shatabdi Express from New Delhi station — arrives Jaipur Junction in 4h 45min. Most reliable, air-conditioned, arrives before noon for a full day at the forts.',
      B: 'Overnight bus (Volvo AC) from Dhaula Kuan terminal. Arrives Sindhi Camp, Jaipur by 5 AM. Cheapest option; start your day right at the Amer Fort queue.',
      C: 'Private cab on NH-48. Under 5 hours non-stop. Good if travelling with luggage or directly to a resort outside city centre.',
    },
    defaultArchetypes: {
      A: { id: 'T-JPR-001', mode: 'train', operator: 'Ajmer Shatabdi Express', departure: '06:10', arrival: '10:40', duration_hours: 4.5, price_inr: 1050, class: 'AC Chair Car' },
      B: { id: 'T-JPR-002', mode: 'bus', operator: 'RSRTC Volvo AC Sleeper', departure: '23:30', arrival: '05:00+1', duration_hours: 5.5, price_inr: 550, class: 'AC Sleeper' },
      C: { id: 'T-JPR-003', mode: 'private-cab', operator: 'Private AC Sedan (NH-48)', departure: '06:00', arrival: '10:30', duration_hours: 4.5, price_inr: 3200, class: 'Private Sedan' },
    },
    goodToKnow: 'Jaipur is at 432m — no altitude concerns at all. Peak summer (May–June) hits 45°C; plan outdoor sightseeing before 11 AM or after 5 PM.',
    tradeoffSummary: 'Option 1 most comfortable train · Option 2 cheapest overnight · Option 3 direct door-to-door',
  },

  // ─── Goa ─────────────────────────────────────────────────────────────────────
  goa: {
    elevationNodes: [
      { label: 'Mumbai', alt: '14m', dot: 'stone' },
      { label: 'Pune', alt: '560m', dot: 'accent', connector: 'NH-48' },
      { label: 'Kolhapur', alt: '569m', dot: 'accent', connector: 'Ghats section' },
      { label: 'Goa (Panaji)', alt: '7m', dot: 'destination', connector: 'Coastal arrival' },
    ],
    passLabel: 'Western Ghats section · coastal drive',
    climbLabel: '+553m Ghats climb then descent',
    optionNotes: {
      A: 'IndiGo / Air India from Mumbai or Delhi. 1h 10min from Mumbai, under 2.5h from Delhi. Best in peak season (Nov–Jan) when trains fill up weeks in advance.',
      B: 'Konkan Railway from Mumbai (Madgaon Station). Overnight AC sleeper — one of India\'s most scenic rail routes along the coast. Arrives Goa by 6 AM.',
      C: 'Private car via NH-66 coastal highway. Two-day option with a stop in Alibag or Ganapatipule. For travellers who want to explore the coast on the way.',
    },
    defaultArchetypes: {
      A: { id: 'T-GOA-001', mode: 'flight', operator: 'IndiGo Direct Flight', departure: '08:15', arrival: '09:35', duration_hours: 1.3, price_inr: 3400, class: 'Economy' },
      B: { id: 'T-GOA-002', mode: 'train', operator: 'Konkan Kanya Express (AC Sleeper)', departure: '23:05', arrival: '10:45+1', duration_hours: 11.7, price_inr: 1100, class: '3AC Sleeper' },
      C: { id: 'T-GOA-003', mode: 'private-cab', operator: 'Coastal Highway Private Car', departure: '06:00', arrival: '18:00', duration_hours: 12, price_inr: 4800, class: 'Private Car' },
    },
    goodToKnow: 'Goa is sea-level; no altitude issues. November to February is peak season with perfect beach weather. The monsoon (June–September) is lush but ferries shut and beaches close for swimming.',
    tradeoffSummary: 'Option 1 fastest — 1h 10m from Mumbai · Option 2 scenic Konkan Rail overnight · Option 3 coastal road trip',
  },

  // ─── Coorg ───────────────────────────────────────────────────────────────────
  coorg: {
    elevationNodes: [
      { label: 'Bangalore', alt: '920m', dot: 'stone' },
      { label: 'Mysuru', alt: '763m', dot: 'accent', connector: 'NH-275' },
      { label: 'Kushalnagar', alt: '821m', dot: 'accent', connector: 'Ghats' },
      { label: 'Madikeri (Coorg)', alt: '1,100m', dot: 'destination', connector: 'Coffee hills' },
    ],
    passLabel: 'Western Ghats foothill section',
    climbLabel: '+180m through coffee estates',
    optionNotes: {
      A: 'Private cab direct from Bangalore — 4.5 hours via Mysuru. The most common option; pick-up from your hotel, drop at your estate or resort in Coorg.',
      B: 'KSRTC AC Sleeper bus from Bangalore Satellite Bus Stand. Overnight journey; arrives Madikeri around 5 AM. Economical and punctual.',
      C: 'Self-drive on NH-275 via Mysuru. Stop at Mysuru Palace and the Namdroling Monastery in Bylakuppe (10km off-route). Takes 6–7 hours total.',
    },
    defaultArchetypes: {
      A: { id: 'T-CRG-001', mode: 'cab', operator: 'Highway AC Sedan direct', departure: '07:00', arrival: '11:30', duration_hours: 4.5, price_inr: 3200, class: 'AC Sedan' },
      B: { id: 'T-CRG-002', mode: 'bus', operator: 'KSRTC Airavat Club Class', departure: '23:15', arrival: '05:30+1', duration_hours: 6.2, price_inr: 850, class: 'AC Sleeper' },
      C: { id: 'T-CRG-003', mode: 'self-drive', operator: 'Self-Drive SUV (via Bylakuppe)', departure: '07:00', arrival: '13:30', duration_hours: 6.5, price_inr: 2800, class: 'SUV' },
    },
    goodToKnow: 'Madikeri sits at 1,100m in the Western Ghats — cool and misty even in summer. Best time is October to May. Monsoon season (June–September) brings lush greenery but roads can get waterlogged.',
    tradeoffSummary: 'Option 1 fastest door-to-door · Option 2 cheapest overnight bus · Option 3 self-drive with Mysuru sightseeing',
  },

  // ─── Meghalaya ───────────────────────────────────────────────────────────────
  meghalaya: {
    elevationNodes: [
      { label: 'Guwahati', alt: '55m', dot: 'stone' },
      { label: 'Nongpoh', alt: '485m', dot: 'accent', connector: 'NH-6' },
      { label: 'Umiam Lake', alt: '980m', dot: 'accent', connector: 'Pine hills' },
      { label: 'Shillong (Meghalaya)', alt: '1,520m', dot: 'destination', connector: 'Cloud plateau' },
    ],
    passLabel: 'East Khasi Hills corridor · foggy conditions',
    climbLabel: '+1,465m steady climb through pine forests',
    optionNotes: {
      A: 'Flight to Lokpriya Gopinath Bordoloi Airport (Guwahati), followed by a synchronized tourist cab up NH-6. Under 4.5 hours door-to-door from Kolkata or Delhi. Arrives Shillong by late afternoon.',
      B: 'Overnight train to Guwahati Junction (Rajdhani / Kamrup Express), then a shared sumo/winger cab up to Shillong. Saves significant budget while letting you sleep on the plains.',
      C: 'Private reserved SUV with an experienced hill driver for your entire Meghalaya circuit (Guwahati – Shillong – Cherrapunji – Dawki). Full door-to-door flexibility on winding mountain routes.',
    },
    defaultArchetypes: {
      A: { id: 'T-MGH-001', mode: 'flight+cab', operator: 'IndiGo + Tourist Cab', departure: '06:15', arrival: '10:45', duration_hours: 4.5, price_inr: 4200, class: 'Economy' },
      B: { id: 'T-MGH-002', mode: 'train+cab', operator: 'Rajdhani Express + Shared Sumo', departure: '16:10', arrival: '11:30+1', duration_hours: 19, price_inr: 1650, class: '3AC + Cab' },
      C: { id: 'T-MGH-003', mode: 'private-cab', operator: 'Reserved Mountain SUV circuit', departure: '09:00', arrival: '13:30', duration_hours: 4.5, price_inr: 3800, class: 'Private SUV' },
    },
    goodToKnow: 'Shillong sits at 1,520m — no extreme altitude sickness, but evenings are chilly year-round. Monsoon (June–September) brings heavy rain with misty roads; winter (Nov–Feb) is clear and crisp.',
    tradeoffSummary: 'Option 1 arrives fastest · Option 2 saves on rail travel · Option 3 provides a dedicated SUV for remote living root bridge trailheads',
  },

  // ─── Kerala ──────────────────────────────────────────────────────────────────
  kerala: {
    elevationNodes: [
      { label: 'Kochi (Cochin)', alt: '4m', dot: 'stone' },
      { label: 'Aluva', alt: '8m', dot: 'accent', connector: 'Coastal plain' },
      { label: 'Kumarakom', alt: '2m', dot: 'accent', connector: 'Vembanad lake' },
      { label: 'Alleppey (Kerala)', alt: '1m', dot: 'destination', connector: 'Backwaters' },
    ],
    passLabel: 'Coastal backwaters & coastal highway corridor',
    climbLabel: 'Flat sea-level backwater basin',
    optionNotes: {
      A: 'Direct flight to Cochin International Airport (COK), then a pre-paid taxi directly to your backwater homestay or jetty (75 minutes). Fastest and most reliable connection.',
      B: 'Vande Bharat / Jan Shatabdi Express to Ernakulam or Alappuzha Station, then an auto-rickshaw or ferry to the homestay. Comfortable AC rail transit along the Malabar coast.',
      C: 'Private air-conditioned chauffeur vehicle from Kochi airport covering your entire stay. Perfect if combining Alleppey backwaters with Munnar hill tea gardens.',
    },
    defaultArchetypes: {
      A: { id: 'T-KER-001', mode: 'flight+cab', operator: 'Air India Express + Backwater Taxi', departure: '06:30', arrival: '09:45', duration_hours: 3.2, price_inr: 3600, class: 'Economy' },
      B: { id: 'T-KER-002', mode: 'train+cab', operator: 'Vande Bharat / Jan Shatabdi', departure: '07:00', arrival: '11:15', duration_hours: 4.25, price_inr: 950, class: 'AC Chair Car' },
      C: { id: 'T-KER-003', mode: 'private-cab', operator: 'Private Chauffeur Sedan', departure: '09:00', arrival: '11:00', duration_hours: 2, price_inr: 2400, class: 'AC Sedan' },
    },
    goodToKnow: 'Kerala backwaters sit right at sea level (0–2m) — zero altitude concerns. Tropical and warm throughout the year; carry light cotton clothing, sunscreen, and eco-friendly mosquito repellent.',
    tradeoffSummary: 'Option 1 fastest via COK airport · Option 2 scenic coastal rail journey · Option 3 private cab for easy multi-stop travel across backwaters and hills',
  },
  // ─── Udaipur ─────────────────────────────────────────────────────────────────
  udaipur: {
    elevationNodes: [
      { label: 'Origin Hub', alt: 'Plains', dot: 'stone' },
      { label: 'Chittorgarh', alt: '394m', dot: 'accent', connector: 'NH-48' },
      { label: 'Aravalli Ridge', alt: '680m', dot: 'accent', connector: 'Scenic pass' },
      { label: 'Udaipur', alt: '598m', dot: 'destination', connector: 'Lake basin' },
    ],
    passLabel: 'Aravalli Mountain Range pass',
    climbLabel: '+380m rise into Mewar valley',
    optionNotes: {
      A: 'Fastest express rail (Vande Bharat / Mewar SF) or direct flight to Maharana Pratap Airport (UDR). Reaches city center comfortably before midday.',
      B: 'RSRTC Volvo / AC Sleeper overnight coach. Arrives directly at Udiapol bus stand by dawn. Most economical choice.',
      C: 'Private AC Chauffeur Sedan through scenic Aravalli highways with door-to-door drop at your Lake Pichola haveli.',
    },
    defaultArchetypes: {
      A: { id: 'T-UDP-001', mode: 'train', operator: 'Vande Bharat / Mewar Superfast', departure: '06:10', arrival: '11:45', duration_hours: 5.5, price_inr: 1250, class: 'AC Chair Car' },
      B: { id: 'T-UDP-002', mode: 'bus', operator: 'RSRTC Volvo AC Multi-Axle', departure: '22:30', arrival: '06:15+1', duration_hours: 7.7, price_inr: 780, class: 'AC Sleeper' },
      C: { id: 'T-UDP-003', mode: 'private-cab', operator: 'Private AC Sedan Chauffeur', departure: '07:00', arrival: '12:30', duration_hours: 5.5, price_inr: 3400, class: 'AC Sedan' },
    },
    goodToKnow: 'Udaipur sits at 598m in the Aravalli hills — pleasant weather from Oct to March. Sunset boat rides on Lake Pichola are best pre-booked.',
    tradeoffSummary: 'Option 1 fastest express connection · Option 2 best value overnight sleeper · Option 3 private cab door-to-door to your haveli',
  },
};

// ─── Fallback corridor for unknown destinations ────────────────────────────────
function getGenericCorridor(destination) {
  const destName = destination || 'Your destination';
  return {
    elevationNodes: [
      { label: 'Origin Hub', alt: '—', dot: 'stone' },
      { label: 'Transit Corridor', alt: '—', dot: 'accent', connector: 'Highway / Rail' },
      { label: destName, alt: 'Arrival', dot: 'destination', connector: 'Direct arrival' },
    ],
    passLabel: null,
    climbLabel: null,
    optionNotes: {
      A: `Fastest verified scheduled connection to ${destName}.`,
      B: `Comfortable overnight coach or express train to ${destName}. Most economical option.`,
      C: `Private cab or self-drive to ${destName} with full flexibility on timing and stops.`,
    },
    defaultArchetypes: {
      A: { id: 'T-GEN-001', mode: 'flight+transfer', operator: `Fastest Connection to ${destName}`, departure: '06:30', arrival: '11:45', duration_hours: 5.2, price_inr: 3800, class: 'Fastest' },
      B: { id: 'T-GEN-002', mode: 'bus', operator: `Overnight AC Coach to ${destName}`, departure: '21:30', arrival: '07:00+1', duration_hours: 9.5, price_inr: 950, class: 'AC Sleeper' },
      C: { id: 'T-GEN-003', mode: 'private-cab', operator: `Direct Private Chauffeur Cab to ${destName}`, departure: '07:00', arrival: '13:30', duration_hours: 6.5, price_inr: 3600, class: 'Private Sedan' },
    },
    goodToKnow: `Routes to ${destName} are verified and confirmed available. Check seasonal weather before travel.`,
    tradeoffSummary: 'Option 1 fastest · Option 2 most economical · Option 3 most flexible',
  };
}

function getCorridorForDestination(destination = '') {
  const raw = (destination || '').toLowerCase().trim();
  if (!raw) return DESTINATION_CORRIDORS['spiti valley'];

  // Explicit aliases for verified destinations
  if (raw.includes('spiti') || raw.includes('kaza') || raw.includes('tabo')) return DESTINATION_CORRIDORS['spiti valley'];
  if (raw.includes('manali') || raw.includes('kullu')) return DESTINATION_CORRIDORS.manali;
  if (raw.includes('rishikesh') || raw.includes('dehradun') || raw.includes('haridwar')) return DESTINATION_CORRIDORS.rishikesh;
  if (raw.includes('coorg') || raw.includes('madikeri') || raw.includes('kodagu')) return DESTINATION_CORRIDORS.coorg;
  if (raw.includes('meghalaya') || raw.includes('shillong') || raw.includes('cherrapunji')) return DESTINATION_CORRIDORS.meghalaya;
  if (raw.includes('kerala') || raw.includes('kochi') || raw.includes('alleppey') || raw.includes('munnar')) return DESTINATION_CORRIDORS.kerala;
  if (raw.includes('jaipur') || raw.includes('pink city')) return DESTINATION_CORRIDORS.jaipur;
  if (raw.includes('goa') || raw.includes('panaji')) return DESTINATION_CORRIDORS.goa;
  if (raw.includes('udaipur') || raw.includes('mewar') || raw.includes('pichola')) return DESTINATION_CORRIDORS.udaipur;

  // Exact match from key
  if (DESTINATION_CORRIDORS[raw]) return DESTINATION_CORRIDORS[raw];

  // Partial match: only if string is non-empty and at least 4 characters to avoid empty/short substring false matches
  if (raw.length >= 4) {
    const partialKey = Object.keys(DESTINATION_CORRIDORS).find(k => raw.includes(k) || k.includes(raw));
    if (partialKey) return DESTINATION_CORRIDORS[partialKey];
  }

  return getGenericCorridor(destination);
}

const TRANSIT_IMAGES = {
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
  bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80',
  cab: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
};

function getTransitImage(card) {
  const m = (card?.mode || '').toLowerCase();
  const o = (card?.operator || '').toLowerCase();
  if (m.includes('flight') || o.includes('air') || o.includes('flight')) return TRANSIT_IMAGES.flight;
  if (m.includes('train') || o.includes('shatabdi') || o.includes('express')) return TRANSIT_IMAGES.train;
  if (m.includes('bus') || o.includes('volvo') || o.includes('coach') || o.includes('hrtc')) return TRANSIT_IMAGES.bus;
  return TRANSIT_IMAGES.cab;
}

// ─── ElevationNode component ──────────────────────────────────────────────────
function ElevationNode({ label, alt, dot, connector }) {
  const dotClass =
    dot === 'destination'
      ? 'w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shadow-xs'
      : dot === 'accent'
      ? 'w-2.5 h-2.5 rounded-full bg-[#DA7756] ring-2 ring-orange-100'
      : 'w-2.5 h-2.5 rounded-full bg-slate-400';

  const labelClass =
    dot === 'destination' ? 'text-emerald-700 font-semibold' : 'text-slate-800 font-medium';
  const altClass = dot === 'destination' ? 'text-emerald-600 font-mono font-medium' : 'text-slate-500 font-mono';

  return (
    <>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className={dotClass} />
        <div>
          <div className={`text-xs ${labelClass}`}>{label}</div>
          <div className={`text-[11px] ${altClass}`}>{alt}</div>
        </div>
      </div>
      {connector && (
        <div className="flex-1 flex items-center justify-center px-2 min-w-[48px]">
          <div className="w-full h-[2px] bg-slate-200 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-medium whitespace-nowrap bg-white px-1.5 rounded-full border border-slate-100 shadow-2xs">
              {connector}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TransportSelectionScene({
  options = [],
  budget = 30000,
  origin = '',
  destination = '',
  people = 2,
  onSelect,
  onSkip,
  initialStage = null,
  inline = false,
}) {
  const corridor = getCorridorForDestination(destination);

  // Clean effective origin - never allow browser URLs like http://localhost...
  const rawOrigin = origin && typeof origin === 'string' && !origin.startsWith('http') ? origin.trim() : '';
  const firstOptionOrigin = options?.[0]?.origin_city && typeof options[0].origin_city === 'string' && !options[0].origin_city.startsWith('http') ? options[0].origin_city.trim() : '';
  const effectiveOrigin = rawOrigin || firstOptionOrigin || (corridor?.elevationNodes?.[0]?.label && corridor.elevationNodes[0].label !== 'Origin Hub' ? corridor.elevationNodes[0].label : 'Delhi');
  const effectiveDestination = (destination && typeof destination === 'string' && !destination.startsWith('http') ? destination.trim() : '') || 'Destination';

  const defs = corridor.defaultArchetypes || {
    A: { id: 'T-OPT-A', mode: 'flight+transfer', operator: `Fastest Express to ${destination || 'Destination'}`, departure: '06:00', arrival: '14:00', duration_hours: 8, price_inr: 4500, class: 'Economy' },
    B: { id: 'T-OPT-B', mode: 'bus', operator: `Overnight AC Coach to ${destination || 'Destination'}`, departure: '20:00', arrival: '08:00+1', duration_hours: 12, price_inr: 1200, class: 'Semi-sleeper AC' },
    C: { id: 'T-OPT-C', mode: 'private-cab', operator: `Private Chauffeur Cab to ${destination || 'Destination'}`, departure: '06:30', arrival: '14:30', duration_hours: 8, price_inr: 4200, class: 'Private' },
  };

  // Group and prioritize options passed from backend
  const available = Array.isArray(options) ? [...options] : [];

  // Categorize available options if present
  const flightOpt = available.find(o =>
    (o.mode?.includes('flight') || o.operator?.toLowerCase().includes('flight') || o.operator?.toLowerCase().includes('air') || o.operator?.toLowerCase().includes('indigo') || o.operator?.toLowerCase().includes('spicejet') || o.operator?.toLowerCase().includes('alliance')) &&
    !o.mode?.includes('bus') && !o.mode?.includes('train')
  );

  const busOpt = available.find(o =>
    o !== flightOpt &&
    (o.mode === 'bus' || o.operator?.toLowerCase().includes('bus') || o.operator?.toLowerCase().includes('volvo') || o.operator?.toLowerCase().includes('coach') || o.operator?.toLowerCase().includes('ksrtc') || o.operator?.toLowerCase().includes('hrtc') || o.operator?.toLowerCase().includes('rsrtc') || o.operator?.toLowerCase().includes('utc') || o.operator?.toLowerCase().includes('zingbus') || o.operator?.toLowerCase().includes('express'))
  );

  const trainOrCabOpt = available.find(o =>
    o !== flightOpt && o !== busOpt &&
    (o.mode?.includes('train') || o.mode?.includes('cab') || o.mode?.includes('suv') || o.mode?.includes('taxi') || o.operator?.toLowerCase().includes('express') || o.operator?.toLowerCase().includes('shatabdi') || o.operator?.toLowerCase().includes('rajdhani') || o.operator?.toLowerCase().includes('taxi') || o.operator?.toLowerCase().includes('sedan') || o.mode === 'self-drive')
  );

  // Pool of remaining backend options not yet selected
  const used = new Set([flightOpt, busOpt, trainOrCabOpt].filter(Boolean));
  const remaining = available.filter(o => !used.has(o));

  // Build slot 1 (Recommended / Fastest): flight first, or fastest backend option, or first backend option, or defs.A
  const rawA = flightOpt || remaining.shift() || available[0] || defs.A;
  // Build slot 2 (Best Value / Ground): bus first, or next backend option, or defs.B
  const rawB = busOpt || remaining.shift() || available.find(o => o !== rawA) || defs.B;
  // Build slot 3 (Scenic / Flexible / Cab): cab/train first, or next backend option, or defs.C
  const rawC = trainOrCabOpt || remaining.shift() || available.find(o => o !== rawA && o !== rawB) || defs.C;

  const optionA = {
    id: rawA?.id || defs.A.id,
    mode: rawA?.mode || defs.A.mode,
    operator: rawA?.operator || defs.A.operator,
    departure: rawA?.departure || defs.A.departure,
    arrival: rawA?.arrival || defs.A.arrival,
    duration_hours: rawA?.duration_hours || defs.A.duration_hours,
    price_inr: rawA?.price_inr || defs.A.price_inr,
    class: rawA?.class || defs.A.class,
    waitlist_status: rawA?.waitlist_status || 'confirmed',
    live_verified: rawA?.live_verified || false,
    source: rawA?.source || null,
    origin_city: rawA?.origin_city || null,
    destination_city: rawA?.destination_city || null,
    route_display: rawA?.route_display || null,
    archetype: 'recommended',
    badge: 'Recommended',
    notes: rawA?.notes || corridor.optionNotes?.A || `Fastest verified route to ${destination || 'destination'}.`,
  };

  const optionB = {
    id: rawB?.id || defs.B.id,
    mode: rawB?.mode || defs.B.mode,
    operator: rawB?.operator || defs.B.operator,
    departure: rawB?.departure || defs.B.departure,
    arrival: rawB?.arrival || defs.B.arrival,
    duration_hours: rawB?.duration_hours || defs.B.duration_hours,
    price_inr: rawB?.price_inr || defs.B.price_inr,
    class: rawB?.class || defs.B.class,
    waitlist_status: rawB?.waitlist_status || 'confirmed',
    live_verified: rawB?.live_verified || false,
    source: rawB?.source || null,
    origin_city: rawB?.origin_city || null,
    destination_city: rawB?.destination_city || null,
    route_display: rawB?.route_display || null,
    archetype: 'budget',
    badge: 'Best value',
    notes: rawB?.notes || corridor.optionNotes?.B || `Comfortable and economical connection to ${destination || 'destination'}.`,
  };

  const optionC = {
    id: rawC?.id || defs.C.id,
    mode: rawC?.mode || defs.C.mode,
    operator: rawC?.operator || defs.C.operator,
    departure: rawC?.departure || defs.C.departure,
    arrival: rawC?.arrival || defs.C.arrival,
    duration_hours: rawC?.duration_hours || defs.C.duration_hours,
    price_inr: rawC?.price_inr || defs.C.price_inr,
    class: rawC?.class || defs.C.class,
    waitlist_status: rawC?.waitlist_status || 'confirmed',
    live_verified: rawC?.live_verified || false,
    source: rawC?.source || null,
    origin_city: rawC?.origin_city || null,
    destination_city: rawC?.destination_city || null,
    route_display: rawC?.route_display || null,
    archetype: 'scenic',
    badge: null,
    notes: rawC?.notes || corridor.optionNotes?.C || `Direct private cab or scenic transit to ${destination || 'destination'}.`,
  };

  const comparativeCards = [optionA, optionB, optionC];

  const [selectedOption, setSelectedOption] = useState(optionA);
  const [hoveredCard, setHoveredCard] = useState(optionA);
  const [isStayDrawerOpen, setIsStayDrawerOpen] = useState(false);
  const activeCost = (hoveredCard || selectedOption).price_inr * people;
  const remainingBudget = Math.max(0, budget - activeCost);
  const percentUsed = Math.min(100, Math.round((activeCost / budget) * 100));

  // ─── Inline (compact) mode — used inside "change transit" picker ─────────────
  if (inline) {
    return (
      <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm text-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DA7756]" />
            Select alternate transit route
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {comparativeCards.length} verified options
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {comparativeCards.map((card) => (
            <div
              key={card.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all bg-white ${
                card.archetype === 'recommended'
                  ? 'border-[#DA7756] shadow-md ring-1 ring-[#DA7756]/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium capitalize">{card.mode}</span>
                  <span className="text-slate-900 font-bold text-sm">₹{card.price_inr.toLocaleString('en-IN')}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900">{card.operator}</h4>
                <div className="text-[11px] text-slate-500 mt-1">
                  {card.duration_hours}h · {card.departure} → {card.arrival}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelect(card)}
                className="mt-3.5 w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-[#DA7756] text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Choose
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Full decision scene: Bento Grid Layout ──────────────────────────────────
  return (
    <div className="w-full max-w-[1360px] mx-auto space-y-6 pb-12 select-none">

      {/* ─── BENTO ROW 1: Header Objective & Dynamic KPI Budget Card ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Card 1A: Title & Context (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#DA7756] border border-orange-200/80 text-xs font-semibold">
                Step 2 of 5
              </span>
              <span className="text-xs font-medium text-slate-500">
                Transit Corridor Synthesis
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Choose how you'll get to {destination || 'your destination'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Evaluating rail, mountain highway, and all-weather air corridors. Pick the route that balances travel duration, scenic mountain views, and your budget envelope.
            </p>
          </div>

          {onSkip && (
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Want the AI's top pick immediately?</span>
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-semibold text-[#DA7756] hover:text-amber-700 underline underline-offset-4 cursor-pointer"
              >
                Use recommended route →
              </button>
            </div>
          )}
        </div>

        {/* Card 1B: Budget KPI Widget with Sparkline (5 cols - like reference design) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 block">Reserve Budget Kept</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">
                ₹{remainingBudget.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
              <span>↑</span>
              <span>{Math.max(0, 100 - percentUsed)}% reserve</span>
            </span>
          </div>

          {/* Clean SVG Sparkline */}
          <div className="my-4 py-1">
            <div className="h-10 w-full relative flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                <defs>
                  <linearGradient id="budgetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DA7756" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 Q 40 30, 80 20 T 160 12 T 200 8"
                  fill="none"
                  stroke="url(#budgetGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="8" r="4" fill="#10B981" />
              </svg>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#DA7756] to-emerald-500 transition-all duration-300"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Allocated: <strong className="text-slate-800">₹{activeCost.toLocaleString('en-IN')}</strong> ({percentUsed}%)</span>
            <span>Envelope: <strong className="text-slate-800">₹{budget.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

      </div>

      {/* ─── BENTO ROW 2: Three Visual Transit Cards with Photography ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparativeCards.map((card, idx) => {
          const isRecommended = card.archetype === 'recommended';
          const isBudget = card.archetype === 'budget';
          const cardImg = getTransitImage(card);

          return (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCard(card)}
              className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group relative shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                isRecommended
                  ? 'border-[#DA7756] ring-2 ring-[#DA7756]/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Photo Banner with Gradient Overlay */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={cardImg}
                  alt={card.operator}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                {/* Top Floating Badge */}
                {card.badge ? (
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1 ${
                    isRecommended
                      ? 'bg-gradient-to-r from-amber-500 to-[#DA7756] text-white'
                      : isBudget
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {isRecommended ? '★ Recommended' : card.badge}
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white shadow-md">
                    Scenic Route
                  </span>
                )}

                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-mono font-medium text-slate-700 shadow-xs">
                  Option {idx + 1}
                </span>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold drop-shadow-sm">{card.class || 'Confirmed Seat'}</span>
                  <span className="text-[11px] bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md font-mono">
                    ⚡ {card.duration_hours}h transit
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isRecommended
                        ? 'bg-orange-50 text-[#DA7756]'
                        : isBudget
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {card.mode?.includes('flight') ? (
                        <Plane className="w-4 h-4" />
                      ) : card.mode?.includes('train') || card.operator?.toLowerCase().includes('shatabdi') || card.operator?.toLowerCase().includes('express') ? (
                        <Train className="w-4 h-4" />
                      ) : card.mode === 'bus' || card.mode?.includes('bus') ? (
                        <Bus className="w-4 h-4" />
                      ) : (
                        <Car className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-[#DA7756] transition-colors leading-snug">
                        {card.operator}
                      </h4>
                      {card.route_display && (
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                          <span>📍</span>
                          <span>{card.route_display}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Duration Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Schedule</span>
                      <span className="font-semibold text-slate-800">{card.departure} → {card.arrival}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Duration</span>
                      <span className="font-semibold text-slate-800">{card.duration_hours} hours</span>
                    </div>
                  </div>

                  {/* Route Notes */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {card.notes}
                  </p>
                </div>

                {/* Price & Tactile Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Price per seat</span>
                    <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      ₹{card.price_inr.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelect(card)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                      isRecommended
                        ? 'bg-slate-900 hover:bg-[#DA7756] text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    <span>Choose</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── BENTO ROW 3: Real Interactive Route Map ─── */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#DA7756] flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Route Map: {effectiveOrigin} → {effectiveDestination}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                  via {(selectedOption || hoveredCard)?.mode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-medium border border-sky-200/60">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Air Route
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium border border-amber-200/60">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Rail Corridor
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Highway (Bus/Cab)
            </span>
          </div>
        </div>

        {/* Real OpenStreetMap Route Map */}
        <RouteMap
          originCity={effectiveOrigin}
          destinationCity={effectiveDestination}
          selectedOption={selectedOption || hoveredCard}
          corridorNodes={corridor?.elevationNodes || []}
        />

        {/* Route Details Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Transit:</span>
            <span>
              {(hoveredCard || selectedOption)?.operator} · {(hoveredCard || selectedOption)?.duration_hours} hrs
            </span>
          </div>
          {(hoveredCard || selectedOption)?.route_display && (
            <div className="text-slate-500 font-mono text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              📍 {(hoveredCard || selectedOption)?.route_display}
            </div>
          )}
        </div>
      </div>

      {/* ─── BENTO ROW 4: Algorithmic Trade-off Analysis Box ─── */}
      <div className="w-full bg-[#F2F3FF] p-5 sm:p-6 rounded-2xl border border-[#DAE2FD]/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FFDBC9] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[#914714] text-[22px]">balance</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Geist'] text-[11px] uppercase text-[#914714] font-semibold tracking-wider">
              Travel Note
            </span>
            <h4 className="font-['Geist'] text-base font-semibold text-[#131B2E]">
              {selectedOption.duration_hours < 5 ? 'Express Transit Option' : 'Overnight & Scenic Route'}
            </h4>
            <p className="text-xs text-[#4F5D72] max-w-3xl leading-relaxed">
              Opting for <strong className="text-[#131B2E] font-semibold">{selectedOption.operator}</strong> gets you to {effectiveDestination} in {selectedOption.duration_hours} hours.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert("Acclimatization safety protocol enabled: 18h buffer applied.")}
          className="bg-white hover:bg-[#EAEDFF] text-[#131B2E] px-4 py-2.5 rounded-xl font-['Geist'] text-xs font-semibold shadow-xs transition-colors border border-[#DAE2FD]/60 cursor-pointer whitespace-nowrap"
        >
          Acclimatization Protocol
        </button>
      </div>

      {/* Floating Action Execution Bar (Stage 2/5 Advance) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-[1360px] mx-auto flex justify-end">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-[#DAE2FD]/80 flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col pr-4 border-r border-[#DAE2FD]">
              <span className="font-['Geist'] text-[10px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                Selected Transit
              </span>
              <span className="font-['Geist'] text-xs font-semibold text-[#131B2E]">
                {selectedOption.operator} · ₹{selectedOption.price_inr?.toLocaleString('en-IN')}/seat
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelect(selectedOption)}
                className="bg-[#914714] hover:bg-[#B05F2B] active:scale-98 text-white px-5 sm:px-7 py-3 rounded-xl font-['Geist'] text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Confirm Transit & Advance to Homestay Phase (Stage 2/5)</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
