import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useMemory } from '../context/MemoryContext';
import { planTrip, extractTripIntent } from '../services/api';
import Navbar from '../components/Navbar';
import TransportSelectionScene from '../components/TransportSelectionScene';
import StaySelectionScene from '../components/StaySelectionScene';
import ActivitySelectionScene from '../components/ActivitySelectionScene';
import ExpeditionReviewScene from '../components/ExpeditionReviewScene';
import {
  Compass,
  CheckCircle2,
  Wallet,
  Users,
  Mountain,
  ShieldCheck,
  Cpu,
  ArrowRight,
  MapPin,
  Utensils,
  Brain,
  Sparkles,
  Settings,
  Plus,
  Minus,
  Check,
  Zap,
  Leaf,
  Sliders,
  Home,
  ArrowUpRight,
  HeartPulse,
  WifiOff,
  Handshake,
  Mic,
  Loader2,
} from 'lucide-react';

const CORRIDORS = [
  {
    id: 'spiti',
    sector: 'Spiti Valley',
    tag: 'High-altitude cold desert',
    label: 'Kaza & Pin Valley',
    elevation: 'Himachal Pradesh',
    description: 'Key Monastery, Pin Valley, and mountain homestays.',
    defaultBudget: 28000,
    defaultDays: 5,
    defaultAltitude: 3800,
  },
  {
    id: 'coorg',
    sector: 'Coorg',
    tag: 'Western Ghats highland',
    label: 'Madikeri & spice trails',
    elevation: 'Karnataka',
    description: 'Coffee estates, spice trails, and Kodava homestays.',
    defaultBudget: 22000,
    defaultDays: 4,
    defaultAltitude: 1100,
  },
  {
    id: 'meghalaya',
    sector: 'Meghalaya',
    tag: 'Cloud forest & waterfalls',
    label: 'Sohra & Mawlynnong',
    elevation: 'Northeast India',
    description: 'Living root bridges, clear rivers, and bamboo cottages.',
    defaultBudget: 26000,
    defaultDays: 5,
    defaultAltitude: 1400,
  },
  {
    id: 'udaipur',
    sector: 'Udaipur',
    tag: 'Lakes & heritage',
    label: 'Lake Pichola & old city',
    elevation: 'Rajasthan',
    description: 'Lake Pichola, heritage havelis, and artisan bazaars.',
    defaultBudget: 24000,
    defaultDays: 3,
    defaultAltitude: 600,
  },
];

const DESTINATION_CONFIGS = {
  spiti: {
    budgetBreakdown: [
      { label: 'Homestay / village lodging', pct: 42, color: 'bg-[#C26D38]' },
      { label: '4x4 mountain transit', pct: 38, color: 'bg-[#006C4A]' },
      { label: 'Permits, guides & entries', pct: 20, color: 'bg-[#4F5D72]' },
    ],
    budgetNote: 'Verified local high-clearance drivers and village homestay hosts.',
    seatEfficiencyNote: 'Optimal 4x4 seat efficiency',
    paceOptions: [
      {
        id: 'acclimatize',
        title: 'Acclimatization first',
        desc: 'Max +500m sleeping elevation/day with rest halts in Kaza',
        icon: Leaf,
        color: 'text-[#006C4A]',
      },
      {
        id: 'balanced',
        title: 'Balanced Explorer',
        desc: 'Balanced monastery visits and daytime valley exploration',
        icon: Sliders,
        color: 'text-[#4F5D72]',
      },
      {
        id: 'fast',
        title: 'Fast-track circuit',
        desc: 'Full Kaza-Kunzum loop with early morning departures',
        icon: Zap,
        color: 'text-[#C26D38]',
      },
    ],
    paceBufferNote: 'Altitude acclimatization buffer: Rest day in Kaza included automatically.',
    lodgingModes: [
      { id: 'homestay', label: 'Direct village homestays' },
      { id: 'boutique', label: 'Boutique mountain retreats' },
    ],
    habitationCards: [
      {
        tag: 'Community Impact',
        title: 'Direct Village Economy',
        desc: 'Over 90% of lodging spend goes directly to host families in Langza, Demul, and Kaza.',
        feature: 'Bukhari heating available',
      },
      {
        tag: 'Local Dining',
        title: 'Himalayan Hearth Cuisine',
        desc: 'Freshly roasted barley (tsampa), hot thukpa, local tingmo bread, and warm butter tea.',
        feature: 'Nutritious mountain diet',
      },
      {
        tag: 'Connectivity',
        title: 'Mindful Digital Rest',
        desc: 'Reliable mobile sync in Kaza base town while high-altitude hamlets offer tranquil silence.',
        feature: 'Emergency assistance active',
      },
    ],
  },
  coorg: {
    budgetBreakdown: [
      { label: 'Estate homestays & cottages', pct: 45, color: 'bg-[#C26D38]' },
      { label: 'Local transit & private cab', pct: 30, color: 'bg-[#006C4A]' },
      { label: 'Plantations, falls & entry', pct: 25, color: 'bg-[#4F5D72]' },
    ],
    budgetNote: 'Direct booking with Kodava estate families and verified local drivers.',
    seatEfficiencyNote: 'Comfortable private SUV / sedan capacity',
    paceOptions: [
      {
        id: 'acclimatize',
        title: 'Relaxed & unhurried',
        desc: 'Slow mornings with estate walks, birdwatching, and leisure',
        icon: Leaf,
        color: 'text-[#006C4A]',
      },
      {
        id: 'balanced',
        title: 'Balanced Explorer',
        desc: 'Coffee trails, Abbey Falls, Dubare, and Raja’s Seat sunsets',
        icon: Sliders,
        color: 'text-[#4F5D72]',
      },
      {
        id: 'fast',
        title: 'Active adventure',
        desc: 'Trek to Brahmagiri Peak, river rafting, and spice plantations',
        icon: Zap,
        color: 'text-[#C26D38]',
      },
    ],
    paceBufferNote: 'Plantation buffer: Extra morning time reserved for leisurely estate breakfasts.',
    lodgingModes: [
      { id: 'homestay', label: 'Coffee estate homestays' },
      { id: 'boutique', label: 'Plantation nature resorts' },
    ],
    habitationCards: [
      {
        tag: 'Community Impact',
        title: 'Direct Estate Economy',
        desc: 'Direct earnings to multi-generational Kodava coffee growers in Madikeri and Virajpet.',
        feature: 'Estate plantation walks included',
      },
      {
        tag: 'Local Dining',
        title: 'Kodava Estate Kitchens',
        desc: 'Authentic akki roti, traditional spiced curries, bamboo shoot delicacies, and fresh estate filter coffee.',
        feature: 'Farm-fresh estate ingredients',
      },
      {
        tag: 'Connectivity',
        title: 'Rainforest Sanctuary',
        desc: 'High-speed Wi-Fi in common estate spaces paired with serene, quiet Western Ghats surroundings.',
        feature: 'Full mobile network coverage',
      },
    ],
  },
  meghalaya: {
    budgetBreakdown: [
      { label: 'Khasi village cottages', pct: 40, color: 'bg-[#C26D38]' },
      { label: 'Inter-district transit & taxi', pct: 35, color: 'bg-[#006C4A]' },
      { label: 'Root bridges, falls & guides', pct: 25, color: 'bg-[#4F5D72]' },
    ],
    budgetNote: 'Cooperative village tourism fees and certified local Khasi guides.',
    seatEfficiencyNote: 'Local taxi and private transit capacity',
    paceOptions: [
      {
        id: 'acclimatize',
        title: 'Slow valley pace',
        desc: 'Gentle walks around Mawlynnong village and peaceful Dawki riverbanks',
        icon: Leaf,
        color: 'text-[#006C4A]',
      },
      {
        id: 'balanced',
        title: 'Balanced Explorer',
        desc: 'Sohra waterfalls, living root bridges, and Mawsmai limestone caves',
        icon: Sliders,
        color: 'text-[#4F5D72]',
      },
      {
        id: 'fast',
        title: 'Deep trail trekker',
        desc: 'Double-decker root bridge descent, Rainbow Falls hike, and canyon trails',
        icon: Zap,
        color: 'text-[#C26D38]',
      },
    ],
    paceBufferNote: 'Weather buffer: Daylight allowances reserved for mist and afternoon rain.',
    lodgingModes: [
      { id: 'homestay', label: 'Khasi village bamboo cottages' },
      { id: 'boutique', label: 'Cloud forest eco-lodges' },
    ],
    habitationCards: [
      {
        tag: 'Community Impact',
        title: 'Khasi Village Cooperatives',
        desc: 'Lodging proceeds directly support community maintenance of root bridges and village schools.',
        feature: 'Certified Khasi guides included',
      },
      {
        tag: 'Local Dining',
        title: 'Traditional Khasi Flavors',
        desc: 'Fragrant jadoh rice, wild forest bamboo shoots, organic orange blossom honey, and ginger tea.',
        feature: 'Locally grown organic produce',
      },
      {
        tag: 'Connectivity',
        title: 'Tranquil Highlands',
        desc: 'Strong cellular reception in Shillong and Sohra; undisturbed nature along the root trails.',
        feature: 'Local guide trail coordination',
      },
    ],
  },
  udaipur: {
    budgetBreakdown: [
      { label: 'Heritage havelis & stays', pct: 45, color: 'bg-[#C26D38]' },
      { label: 'City & lake transit', pct: 25, color: 'bg-[#006C4A]' },
      { label: 'Palace entry, boat & culture', pct: 30, color: 'bg-[#4F5D72]' },
    ],
    budgetNote: 'Direct rates for heritage havelis, lake boats, and certified cultural guides.',
    seatEfficiencyNote: 'City cab and auto-rickshaw capacity',
    paceOptions: [
      {
        id: 'acclimatize',
        title: 'Leisurely heritage',
        desc: 'Sunset boat rides on Lake Pichola, rooftop dinners, and artisan walks',
        icon: Leaf,
        color: 'text-[#006C4A]',
      },
      {
        id: 'balanced',
        title: 'Balanced Explorer',
        desc: 'City Palace, Jagdish Temple, Saheliyon Ki Bari, and craft bazaars',
        icon: Sliders,
        color: 'text-[#4F5D72]',
      },
      {
        id: 'fast',
        title: 'Full Mewar circuit',
        desc: 'Adds Kumbhalgarh Fort day trip and Monsoon Palace sunrise excursions',
        icon: Zap,
        color: 'text-[#C26D38]',
      },
    ],
    paceBufferNote: 'Comfort buffer: Outdoor palace tours scheduled during comfortable morning hours.',
    lodgingModes: [
      { id: 'homestay', label: 'Heritage havelis & lake stays' },
      { id: 'boutique', label: 'Royal heritage palaces' },
    ],
    habitationCards: [
      {
        tag: 'Community Impact',
        title: 'Heritage Preservation',
        desc: 'Direct support to traditional haveli restorers, miniature painters, and Mewar craft guilds.',
        feature: 'Lake Pichola views available',
      },
      {
        tag: 'Local Dining',
        title: 'Mewari Royal Cuisine',
        desc: 'Authentic dal baati churma, gatte ki sabzi, ker sangri, and refreshing kulhad lassi.',
        feature: 'Traditional heritage recipes',
      },
      {
        tag: 'Connectivity',
        title: 'Historic City Comfort',
        desc: 'Seamless Wi-Fi and 5G across Old City havelis and lakeside dining terraces.',
        feature: 'Full city connectivity',
      },
    ],
  },
  custom: {
    budgetBreakdown: [
      { label: 'Local Homestays & Lodging', pct: 42, color: 'bg-[#C26D38]' },
      { label: 'Regional Transport', pct: 35, color: 'bg-[#006C4A]' },
      { label: 'Activities, Entry & Guides', pct: 23, color: 'bg-[#4F5D72]' },
    ],
    budgetNote: 'Direct rates for verified community hosts and regional transport.',
    seatEfficiencyNote: 'Local vehicle seat capacity',
    paceOptions: [
      { id: 'acclimatize', title: 'Relaxed Pace', desc: 'Leisurely travel with time for rest and local exploration', icon: Leaf, color: 'text-[#006C4A]' },
      { id: 'balanced', title: 'Balanced Explorer', desc: 'Even mix of activities, sightseeing, and relaxation', icon: Sliders, color: 'text-[#4F5D72]' },
      { id: 'fast', title: 'Fast-Paced', desc: 'Action-packed schedule covering maximum highlights', icon: Zap, color: 'text-[#C26D38]' },
    ],
    paceBufferNote: 'Flexible buffer: Daily schedule calibrated around your preferred waking hour.',
    lodgingModes: [
      { id: 'homestay', label: 'Local Homestays' },
      { id: 'boutique', label: 'Boutique Stays' },
    ],
    habitationCards: [
      { tag: 'Community Impact', title: 'Direct Host Earnings', desc: 'Direct-to-host bookings that keep economic value with local communities.', feature: 'Verified local hosts' },
      { tag: 'Local Dining', title: 'Regional Home Cooking', desc: 'Locally grown produce and authentic regional home-cooked cuisine.', feature: 'Fresh regional food' },
      { tag: 'Connectivity', title: 'Balanced Stay Experience', desc: 'Calibrated stays offering comfortable rest with reliable essentials.', feature: 'Local emergency support' },
    ],
  },
};

export default function Planning() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, updateTrip } = useTrip();
  const { memory, openDrawer } = useMemory();

  // Mode: 'constraint_synthesis' (if not auto-running) or 'workspace_pipeline' (when executing)
  const incomingPrompt = location.state?.prompt || tripData.prompt || '';
  const incomingAutoRun = Boolean(location.state?.autoRun);
  const [currentPrompt, setCurrentPrompt] = useState(incomingPrompt);
  const [freeformPrompt, setFreeformPrompt] = useState(incomingPrompt || '');
  const [originCity, setOriginCity] = useState(location.state?.origin || '');
  const [customDestination, setCustomDestination] = useState(
    location.state?.destination && !CORRIDORS.some(c => c.sector.toLowerCase() === location.state.destination.toLowerCase())
      ? location.state.destination
      : ''
  );
  const [extractionConfidence, setExtractionConfidence] = useState(98.4);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isExecuting, setIsExecuting] = useState(incomingAutoRun);

  // Constraint Synthesis Form State pre-filled from location.state if passed
  const matchedCorridor = CORRIDORS.find(c =>
    location.state?.destination && c.sector.toLowerCase().includes(location.state.destination.toLowerCase())
  ) || (location.state?.destination ? {
    id: 'custom',
    sector: location.state.destination,
    tag: 'Custom Destination',
    label: `${location.state.destination} Bespoke Axis`,
    elevation: 'Terrain Synced',
    description: `Direct expedition synthesis and village habitat mapping for ${location.state.destination}.`,
    defaultBudget: location.state?.budget || 30000,
    defaultDays: location.state?.days || 5,
    defaultAltitude: 3600,
  } : CORRIDORS[0]);

  const [selectedCorridor, setSelectedCorridor] = useState(matchedCorridor);
  const [budgetInr, setBudgetInr] = useState(location.state?.budget || 30000);
  const [days, setDays] = useState(location.state?.days || 5);
  const [people, setPeople] = useState(location.state?.people || 2);
  const [pace, setPace] = useState('acclimatize'); // 'acclimatize' | 'balanced' | 'fast'
  const [altitude, setAltitude] = useState(4550);
  const [spo2BufferEnabled, setSpo2BufferEnabled] = useState(true);
  const [lodgingMode, setLodgingMode] = useState('homestay'); // 'homestay' | 'boutique'
  const [tripNote, setTripNote] = useState('');
  const [isSpawning, setIsSpawning] = useState(false);

  // Prompt NLP Classifier & Auto-filler
  const parseFreeformPrompt = (text) => {
    if (!text || typeof text !== 'string') return;
    const lower = text.toLowerCase();

    // 1. Destination Extraction
    let detectedCorridor = null;
    if (lower.includes('spiti') || lower.includes('kaza') || lower.includes('tabo')) {
      detectedCorridor = CORRIDORS[0];
      setCustomDestination('');
    } else if (lower.includes('coorg') || lower.includes('madikeri') || lower.includes('kodagu')) {
      detectedCorridor = CORRIDORS[1];
      setCustomDestination('');
    } else if (lower.includes('meghalaya') || lower.includes('shillong') || lower.includes('cherrapunji') || lower.includes('sohra') || lower.includes('mawlynnong')) {
      detectedCorridor = CORRIDORS[2];
      setCustomDestination('');
    } else if (lower.includes('udaipur') || lower.includes('rajasthan') || lower.includes('mewar') || lower.includes('pichola')) {
      detectedCorridor = CORRIDORS[3];
      setCustomDestination('');
    } else {
      const stopWords = new Set([
        'trip', 'tour', 'travel', 'vacation', 'holiday', 'expedition',
        'days', 'day', 'night', 'nights', 'd',
        'people', 'person', 'persons', 'traveler', 'travelers', 'pax', 'friends', 'family', 'couple', 'solo',
        'budget', 'rs', 'inr', 'rupees', 'k',
        'homestay', 'homestays', 'hotel', 'hotels', 'resort', 'resorts', 'stay', 'stays',
        'under', 'for', 'with', 'and', 'or', 'on', 'at', 'in', 'to', 'from',
        'safe', 'fast', 'relax', 'balanced', 'pace', 'acclimatize', 'planning'
      ]);

      // Pattern 1: Look for "in / to / around / visit / explore / at <place>"
      // Notice: stop at punctuation [,\.\?!] or whitespace followed by stop words or digits
      let placeMatch = text.match(/(?:in|to|around|visit|explore|at|towards)\s+([A-Za-z\s]+?)(?=[,\.\?!]|\s+(?:under|for|with|on|at|around|\d|budget|inr|rs|₹|stay|homestay|hotel|trip)|$)/i);
      
      // Pattern 2: Look for "<place> trip / tour"
      if (!placeMatch) {
        placeMatch = text.match(/^([A-Za-z\s]+?)(?=[,\.\?!]|\s+(?:trip|tour|expedition|for|with|under|\d|days|day))/i);
      }

      const rawPlace = placeMatch ? placeMatch[1].trim() : customDestination;
      const cleanPlace = rawPlace ? rawPlace.replace(/^(the|a|an)\s+/i, '').trim() : '';

      if (cleanPlace && cleanPlace.length > 2 && !stopWords.has(cleanPlace.toLowerCase())) {
        const formatted = cleanPlace
          .split(/\s+/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        detectedCorridor = {
          id: 'custom',
          sector: formatted,
          tag: 'Custom destination',
          label: `${formatted} route`,
          elevation: 'Terrain Synced',
          description: `Direct routes and community lodging for ${formatted}.`,
          defaultBudget: budgetInr,
          defaultDays: days,
          defaultAltitude: 2200,
        };
        setCustomDestination(formatted);
      }
    }

    if (detectedCorridor) {
      setSelectedCorridor(detectedCorridor);
      setDestination(detectedCorridor.sector);
      if (detectedCorridor.defaultAltitude) setAltitude(detectedCorridor.defaultAltitude);
    }

    // 2. Days
    const daysMatch = text.match(/(\d+)\s*(?:days|day|d\b)/i);
    if (daysMatch) {
      const d = parseInt(daysMatch[1], 10);
      if (d >= 1 && d <= 15) setDays(d);
    }

    // 3. Budget
    const budgetMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{4,6}|\d{1,2}k)/i);
    if (budgetMatch) {
      let raw = budgetMatch[1].replace(/,/g, '').toLowerCase();
      if (raw.endsWith('k')) {
        raw = parseInt(raw, 10) * 1000;
      }
      const b = parseInt(raw, 10);
      if (b >= 10000 && b <= 200000) setBudgetInr(b);
    }

    // 4. Travelers / People
    const paxMatch = text.match(/(\d+)\s*(?:people|travelers|traveler|persons|person|pax|nomads|explorers)/i);
    if (paxMatch) {
      const p = parseInt(paxMatch[1], 10);
      if (p >= 1 && p <= 12) setPeople(p);
    } else if (lower.includes('solo')) {
      setPeople(1);
    }

    // 4b. Origin / Departure City
    const originMatch = text.match(/(?:from|starting from|departing from|ex-?)\s+([A-Za-z\s]{3,20}?)(?=[,\.\?!]|\s+(?:to|in|under|for|with|\d|budget|inr|rs|₹|stay|homestay|hotel|trip)|$)/i);
    if (originMatch && originMatch[1] && !['the', 'a', 'my', 'our'].includes(originMatch[1].trim().toLowerCase())) {
      const formattedOrigin = originMatch[1].trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      setOriginCity(formattedOrigin);
    }

    // 5. Lodging
    if (lower.includes('homestay') || lower.includes('village') || lower.includes('mud-brick')) {
      setLodgingMode('homestay');
    } else if (lower.includes('hotel') || lower.includes('boutique') || lower.includes('resort')) {
      setLodgingMode('boutique');
    }

    // 6. Pace / Acclimatization
    if (lower.includes('safe') || lower.includes('acclimatiz') || lower.includes('oxygen')) {
      setPace('acclimatize');
      setSpo2BufferEnabled(true);
    } else if (lower.includes('fast') || lower.includes('rush') || lower.includes('quick')) {
      setPace('fast');
    } else if (lower.includes('relax') || lower.includes('balanced') || lower.includes('leisure')) {
      setPace('balanced');
    }
  };

  const [llmModelUsed, setLlmModelUsed] = useState(null);
  const [isExtractingLlm, setIsExtractingLlm] = useState(false);

  const handleClassifyPrompt = async (promptOverride) => {
    const textToParse = promptOverride || freeformPrompt;
    if (!textToParse || !textToParse.trim()) return;

    // 1. Instant regex heuristic parse first so UI reacts immediately
    parseFreeformPrompt(textToParse);
    setIsClassifying(true);
    setIsExtractingLlm(true);

    try {
      // 2. Call LLM extraction backend with Groq model fallbacks
      const result = await extractTripIntent(textToParse);
      if (result && result.success && result.data) {
        const data = result.data;
        setLlmModelUsed(result.modelUsed || 'groq');
        setExtractionConfidence(99.6);

        // Apply days
        if (data.days && !isNaN(data.days)) {
          setDays(Math.max(1, Math.min(30, Number(data.days))));
        }

        // Apply people
        if (data.people && !isNaN(data.people)) {
          setPeople(Math.max(1, Math.min(20, Number(data.people))));
        }

        // Apply budget
        if (data.budget_inr && !isNaN(data.budget_inr)) {
          setBudgetInr(Math.max(1000, Number(data.budget_inr)));
        }

        // Apply destination
        if (data.destination) {
          const destLower = data.destination.toLowerCase();
          const matched = CORRIDORS.find(c =>
            destLower.includes(c.id.toLowerCase()) ||
            c.sector.toLowerCase().includes(destLower) ||
            destLower.includes(c.sector.toLowerCase())
          );
          if (matched) {
            setSelectedCorridor(matched);
            setDestination(matched.sector);
            setCustomDestination('');
            if (matched.defaultAltitude) setAltitude(matched.defaultAltitude);
          } else {
            const formatted = data.destination
              .split(/\s+/)
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' ');
            setSelectedCorridor({
              id: 'custom',
              sector: formatted,
              tag: 'Custom destination',
              label: `${formatted} route`,
              elevation: 'Terrain Synced',
              description: `Direct routes and curated lodging for ${formatted}.`,
              defaultBudget: data.budget_inr || budgetInr,
              defaultDays: data.days || days,
              defaultAltitude: 2200,
            });
            setDestination(formatted);
            setCustomDestination(formatted);
          }
        }

        // Apply origin
        if (data.origin && data.origin.trim() && data.origin.toLowerCase() !== 'delhi') {
          const formattedOrig = data.origin
            .split(/\s+/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
          setOriginCity(formattedOrig);
        } else if (data.origin && !originCity) {
          setOriginCity(data.origin);
        }

        // Apply lodging
        if (data.lodging) {
          setLodgingMode(data.lodging.includes('boutique') || data.lodging.includes('hotel') ? 'boutique' : 'homestay');
        }

        // Apply pace
        if (data.pace) {
          if (data.pace === 'relaxed' || data.pace === 'balanced' || data.pace === 'fast' || data.pace === 'acclimatize') {
            setPace(data.pace);
          }
        }
      }
    } catch (err) {
      console.warn('Groq extraction fell back to local regex:', err);
    } finally {
      setIsClassifying(false);
      setIsExtractingLlm(false);
    }
  };

  const PRESETS = [
    {
      label: 'Spiti 5D • ₹28k • 2 pax • Homestays',
      prompt: '5 days in Spiti Valley under ₹28,000 for 2 people with direct village homestays',
      corridorId: 'spiti',
      days: 5,
      budget: 28000,
      people: 2,
    },
    {
      label: 'Coorg 4D • ₹22k • 2 pax • Coffee estate',
      prompt: '4 days in Coorg under ₹22,000 for 2 people with coffee plantation homestays and spice trails',
      corridorId: 'coorg',
      days: 4,
      budget: 22000,
      people: 2,
    },
    {
      label: 'Meghalaya 5D • ₹26k • 2 pax • Living roots',
      prompt: '5 days in Meghalaya under ₹26,000 for 2 people with living root bridges and crystal river homestays',
      corridorId: 'meghalaya',
      days: 5,
      budget: 26000,
      people: 2,
    },
    {
      label: 'Udaipur 3D • ₹24k • 2 pax • Heritage stays',
      prompt: '3 days in Udaipur under ₹24,000 for 2 people with heritage havelis and Lake Pichola culture',
      corridorId: 'udaipur',
      days: 3,
      budget: 24000,
      people: 2,
    },
  ];

  const activeConfig = DESTINATION_CONFIGS[selectedCorridor.id] || DESTINATION_CONFIGS.custom;

  const getAltitudeInfo = (alt) => {
    if (alt >= 4800) {
      return {
        label: 'Extreme Col Exposure',
        risk: 'STAGE 3 HYPOXIA RISK',
        riskClass: 'bg-[#FFDBC9] text-[#914714]',
      };
    }
    if (alt >= 4000) {
      return {
        label: 'High-Pass Crest',
        risk: 'STAGE 2 ELEVATED RIDGE',
        riskClass: 'bg-amber-100 text-amber-900',
      };
    }
    return {
      label: 'Alpine Valley Baseline',
      risk: 'STAGE 1 SAFE PASSAGE',
      riskClass: 'bg-[#82F5C1]/30 text-[#006C4A]',
    };
  };

  const altitudeInfo = getAltitudeInfo(altitude);

  // Step-by-Step Pipeline Engine State
  const [activeStepIndex, setActiveStepIndex] = useState(0); // 0: Intent, 1: Transport, 2: Stay, 3: Activities, 4: Optimizer
  const [showTransportScene, setShowTransportScene] = useState(false);
  const [showStayScene, setShowStayScene] = useState(false);
  const [showActivityScene, setShowActivityScene] = useState(false);
  const [showReviewScene, setShowReviewScene] = useState(false);
  const [stayOptions, setStayOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [activitiesData, setActivitiesData] = useState(null);
  const [chosenTransport, setChosenTransport] = useState(null);
  const [chosenStay, setChosenStay] = useState(null);
  const [chosenActivities, setChosenActivities] = useState([]);
  const [pendingResult, setPendingResult] = useState(null);
  const [destination, setDestination] = useState(matchedCorridor.sector);
  const [error, setError] = useState('');

  const hasRun = useRef(false);
  const transportDecisionResolver = useRef(null);
  const stayDecisionResolver = useRef(null);
  const activityDecisionResolver = useRef(null);
  const reviewDecisionResolver = useRef(null);

  // Auto-run ONLY if explicitly requested via autoRun
  useEffect(() => {
    if (incomingAutoRun && incomingPrompt && !hasRun.current) {
      hasRun.current = true;
      setIsExecuting(true);
      runPipeline(incomingPrompt);
    }
  }, [incomingAutoRun, incomingPrompt]);

  const handleStartSynthesis = () => {
    setIsSpawning(true);
    const activeDest = (customDestination && customDestination.trim()) || selectedCorridor.sector;
    setDestination(activeDest);

    const routineContext = memory?.routineText || (memory?.notes?.length ? memory.notes.map(n => (typeof n === 'string' ? n : n.text)).join('; ') : '');
    const paceLabel = pace === 'acclimatize' ? 'Acclimatization First pace (max +500m sleeping elevation/day)' : pace === 'fast' ? 'Fast-track alpine pace' : 'Balanced explorer pace';
    const lodgingLabel = lodgingMode === 'homestay' ? '100% direct village homestays' : 'Boutique mountain retreats';
    const contextParts = [
      routineContext,
      paceLabel,
      `Target ceiling altitude: ${altitude}m`,
      spo2BufferEnabled ? 'SpO2 medical buffer enabled' : '',
      lodgingLabel,
      tripNote,
    ].filter(Boolean).join('. ');

    const originClause = originCity && originCity.trim() ? ` from ${originCity.trim()}` : '';
    const synthesizedPrompt = `${days} days in ${activeDest}${originClause}, ₹${budgetInr}, ${people} travelers. ${contextParts}`.trim();
    setCurrentPrompt(synthesizedPrompt);

    setTimeout(() => {
      setIsExecuting(true);
      hasRun.current = true;
      runPipeline(synthesizedPrompt);
    }, 600);
  };

  async function runPipeline(promptToRun) {
    setError('');
    setActiveStepIndex(0); // 1. Intent

    const activeDest = (customDestination && customDestination.trim()) || destination || selectedCorridor.sector;
    setDestination(activeDest);

    try {
      const planPromise = planTrip(promptToRun, {
        routineText: memory?.routineText || '',
        notes: memory?.notes || [],
        tripSpecificNote: tripNote,
      }, {
        destination: activeDest,
        origin: originCity ? originCity.trim() : '',
        days,
        people,
        budget: budgetInr,
      });

      // Pipeline timing animation
      await new Promise((r) => setTimeout(r, 600));
      const result = await planPromise;
      if (!result.success) throw new Error(result.error || 'Pipeline planning failed');

      setPendingResult(result);
      const dest = result.itinerary?.destination || activeDest;
      setDestination(dest);

      const opts = result.transport_options?.outbound || [result.itinerary?.selected_transport_outbound].filter(Boolean);
      setTransportOptions(opts);
      const stays = result.stay_options || [];
      setStayOptions(stays);
      const acts = result.activities || { outdoor: result.itinerary?.activities || [], indoor: [] };
      setActivitiesData(acts);

      // Advance to Step 2: Transport Scene
      setActiveStepIndex(1);
      setShowTransportScene(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Wait for traveler transport decision
      const transportDecision = await new Promise((resolve) => {
        transportDecisionResolver.current = resolve;
      });
      setChosenTransport(transportDecision);
      setShowTransportScene(false);

      // Advance to Step 3: Stay Scene
      setActiveStepIndex(2);
      setShowStayScene(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Wait for traveler stay decision
      const stayDecision = await new Promise((resolve) => {
        stayDecisionResolver.current = resolve;
      });
      setChosenStay(stayDecision);
      setShowStayScene(false);

      // Advance to Step 4: Activities Scene
      setActiveStepIndex(3);
      setShowActivityScene(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Wait for traveler activities decision
      const activityDecision = await new Promise((resolve) => {
        activityDecisionResolver.current = resolve;
      });
      const resolvedActivities = activityDecision || [];
      setChosenActivities(resolvedActivities);
      setShowActivityScene(false);

      // Advance to Step 5: Final Expedition Review & Lock
      setActiveStepIndex(4);
      setShowReviewScene(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Wait for traveler final lock confirmation
      await new Promise((resolve) => {
        reviewDecisionResolver.current = resolve;
      });
      setShowReviewScene(false);

      // Finalize and save
      let finalItinerary = result.itinerary;
      if (transportDecision && transportDecision.id !== result.itinerary?.selected_transport_outbound?.id) {
        finalItinerary = {
          ...finalItinerary,
          selected_transport_outbound: transportDecision,
        };
      }
      if (stayDecision && stayDecision.id !== result.itinerary?.selected_stay?.id) {
        finalItinerary = {
          ...finalItinerary,
          selected_stay: stayDecision,
        };
      }
      if (resolvedActivities && resolvedActivities.length > 0) {
        finalItinerary = {
          ...finalItinerary,
          selected_experiences: resolvedActivities,
        };
      }

      updateTrip({
        itinerary: finalItinerary,
        prompt: promptToRun,
        transportOptions: opts,
        stayOptions: stays,
      });

      // Navigate to Dashboard Cockpit
      navigate('/dashboard', { state: { itinerary: finalItinerary } });

    } catch (err) {
      console.error('Pipeline error:', err);
      setError(err.message || 'Failed to generate expedition matrix');
      setIsExecuting(false);
      hasRun.current = false;
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E] flex flex-col antialiased selection:bg-[#C26D38] selection:text-white font-['Geist']">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* VIEW 1: CONSTRAINT SYNTHESIS (Stitch screen 5110f6cc59e34898b5a83a21c0cb2d2b) */}
        {/* ========================================================================= */}
        {!isExecuting && (
          <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            
            {/* Top Editorial Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAEDFF] rounded-full text-[#C26D38] text-xs font-semibold">
                  <Compass className="w-4 h-4 text-[#C26D38]" />
                  <span className="font-bold text-[11px]">Trip planner</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#131B2E] tracking-tight leading-tight">
                  Define your trip parameters
                </h1>
                <p className="text-sm text-[#4F5D72] leading-relaxed">
                  Tailored itineraries with verified community homestays and transparent domestic rates.
                </p>
              </div>
            </div>

            {/* Natural Language Prompt & Voice Input */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 mt-6 space-y-3.5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#131B2E]">Describe your trip</h2>
                <p className="text-xs text-[#4F5D72] mt-0.5">
                  Type your request or use voice mode to speak naturally.
                </p>
              </div>

              {/* Freeform Textarea Container with Integrated Action Bar */}
              <div className="bg-[#F8F9FD] rounded-2xl p-3.5 border border-slate-200/90 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 focus-within:bg-white transition-all space-y-2.5 shadow-2xs">
                <textarea
                  value={freeformPrompt}
                  onChange={(e) => {
                    setFreeformPrompt(e.target.value);
                    parseFreeformPrompt(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleClassifyPrompt();
                    }
                  }}
                  rows={2}
                  placeholder="e.g. 4 days in Coorg under ₹22,000 for 2 people with coffee plantation homestays"
                  className="w-full bg-transparent text-[#131B2E] font-medium text-sm leading-relaxed placeholder:text-slate-400 border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 resize-none p-0 shadow-none"
                  style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
                />

                <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60">
                  {/* Voice Interface Button */}
                  <button
                    type="button"
                    onClick={() => navigate('/voice', {
                      state: {
                        prompt: freeformPrompt,
                        destination: selectedCorridor.sector,
                        budget: budgetInr,
                        days,
                        people,
                      }
                    })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-xs font-bold text-[#C2410C] transition-all cursor-pointer"
                    title="Launch voice guided intake mode"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Use voice mode</span>
                  </button>

                  {/* Apply Details Button */}
                  <button
                    type="button"
                    onClick={() => handleClassifyPrompt()}
                    disabled={isExtractingLlm}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-70"
                  >
                    {isExtractingLlm ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Apply details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dedicated Starting From / Origin City Selector */}
              <div className="bg-[#F2F3FF] rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#006C4A] shadow-2xs">
                    <Compass className="w-4 h-4 text-[#006C4A]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#4F5D72] block">Starting point</span>
                    <span className="text-xs font-bold text-[#131B2E]">Traveling from</span>
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 shadow-2xs transition-all">
                  <MapPin className="w-4 h-4 text-[#C26D38] shrink-0" />
                  <input
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="Enter departure city (e.g. Delhi, Mumbai, Bangalore, Jaipur, Pune...)"
                    className="w-full bg-transparent text-xs font-bold text-[#131B2E] placeholder:text-slate-400 border-0 outline-none focus:outline-none focus:ring-0 p-0"
                  />
                  {originCity && (
                    <button
                      type="button"
                      onClick={() => setOriginCity('')}
                      className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 rounded-md hover:bg-slate-100 cursor-pointer"
                      title="Clear departure city"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Popular Departure Hub Chips */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Pune', 'Hyderabad'].map((hub) => {
                    const isSelected = originCity?.toLowerCase() === hub.toLowerCase();
                    return (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => setOriginCity(hub)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#006C4A] border-[#006C4A] text-white shadow-2xs'
                            : 'bg-white border-slate-200/80 text-[#131B2E] hover:bg-[#EAEDFF]'
                        }`}
                      >
                        {hub}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plain Extracted Parameters Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4F5D72] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#006C4A] shrink-0" />
                  <span>
                    Got it — <strong className="text-[#131B2E]">{selectedCorridor.sector}</strong>
                    {originCity ? <> departing from <strong className="text-[#006C4A]">{originCity}</strong></> : <span className="text-amber-700 ml-1 font-semibold">(select or type your origin city above)</span>}
                    , <strong className="text-[#131B2E]">{days} days</strong>, <strong className="text-[#C26D38]">₹{budgetInr.toLocaleString('en-IN')}</strong>, <strong className="text-[#131B2E]">{people} {people === 1 ? 'traveler' : 'travelers'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Intake Form (Bento / Modular Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
              
              {/* Module 1: Destination Corridor (Spans 8 cols) */}
              <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#C26D38] flex items-center justify-center">
                      <Compass className="w-3.5 h-3.5 text-[#C26D38]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#131B2E]">Trending destinations</h2>
                    </div>
                  </div>
                  <span className="text-xs text-[#006C4A] flex items-center gap-1 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified routes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3.5">
                  {CORRIDORS.map((c) => {
                    const isSelected = selectedCorridor.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCorridor(c);
                          setDestination(c.sector);
                          setCustomDestination('');
                          setBudgetInr(c.defaultBudget);
                          setDays(c.defaultDays);
                          setAltitude(c.defaultAltitude);
                        }}
                        className={`cursor-pointer p-3.5 rounded-xl transition-all flex flex-col justify-between relative overflow-hidden group border ${
                          isSelected
                            ? 'bg-[#E2E7FF] text-[#131B2E] border-slate-400 shadow-2xs ring-1 ring-[#C26D38]/30'
                            : 'bg-[#F2F3FF] text-[#131B2E] border-slate-200/70 hover:bg-[#EAEDFF]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#C26D38] ring-2 ring-white" />
                        )}
                        <div className="space-y-1">
                          <div className={`text-[10px] font-bold tracking-wider uppercase ${isSelected ? 'text-[#C26D38]' : 'text-[#4F5D72]'}`}>
                            {c.tag}
                          </div>
                          <div className="text-sm font-bold text-[#131B2E] leading-snug">{c.sector}</div>
                          <p className="text-[11px] text-[#4F5D72] leading-relaxed line-clamp-2">{c.description}</p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-[#4F5D72] font-semibold">
                          <span>{c.elevation}</span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C26D38]' : 'text-slate-400'} group-hover:translate-x-0.5 transition-transform`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module 2: Trip Budget & Breakdown (Spans 4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#C26D38]" />
                      <span className="text-[11px] font-bold tracking-wider text-[#4F5D72]">02 // Trip Budget</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#006C4A] bg-[#006C4A]/10 px-2 py-0.5 rounded-full">
                      Transparent pricing
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#131B2E] mt-2">Trip budget</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#4F5D72]">Estimated total:</span>
                    <span className="text-3xl font-extrabold text-[#C26D38] tracking-tight">
                      ₹{budgetInr.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Slider */}
                  <div className="space-y-1.5">
                    <input
                      type="range"
                      min={15000}
                      max={80000}
                      step={1000}
                      value={budgetInr}
                      onChange={(e) => setBudgetInr(Number(e.target.value))}
                      className="w-full h-2 bg-[#E2E7FF] rounded-lg appearance-none cursor-pointer accent-[#C26D38]"
                    />
                    <div className="flex justify-between text-[11px] text-[#4F5D72] font-medium">
                      <span>₹15k Min</span>
                      <span>₹45k Median</span>
                      <span>₹80k Premium</span>
                    </div>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex gap-2">
                    {[
                      { label: '₹20k Budget', val: 20000 },
                      { label: '₹30k Optimal', val: 30000 },
                      { label: '₹50k Luxury', val: 50000 },
                    ].map((chip) => {
                      const isActive = budgetInr === chip.val;
                      return (
                        <button
                          key={chip.val}
                          type="button"
                          onClick={() => setBudgetInr(chip.val)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer border ${
                            isActive
                              ? 'bg-[#DAE2FD] border-slate-300 text-[#131B2E] shadow-2xs'
                              : 'bg-[#F2F3FF] border-transparent text-[#4F5D72] hover:bg-[#EAEDFF]'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Budget Allocation Sparklines/Breakdown */}
                  <div className="p-3 bg-[#F2F3FF] rounded-xl space-y-2 border border-slate-200/60">
                    <div className="flex justify-between text-xs text-[#4F5D72]">
                      <span>{activeConfig.budgetBreakdown[0].label} ({activeConfig.budgetBreakdown[0].pct}%)</span>
                      <span className="font-bold text-[#131B2E]">
                        ₹{Math.round(budgetInr * (activeConfig.budgetBreakdown[0].pct / 100)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E7FF] h-2 rounded-full overflow-hidden flex">
                      <div className={`${activeConfig.budgetBreakdown[0].color} h-full`} style={{ width: `${activeConfig.budgetBreakdown[0].pct}%` }} />
                      <div className={`${activeConfig.budgetBreakdown[1].color} h-full`} style={{ width: `${activeConfig.budgetBreakdown[1].pct}%` }} />
                      <div className={`${activeConfig.budgetBreakdown[2].color} h-full`} style={{ width: `${activeConfig.budgetBreakdown[2].pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-[#4F5D72] pt-0.5">
                      <span>{activeConfig.budgetBreakdown[1].label} ({activeConfig.budgetBreakdown[1].pct}%)</span>
                      <span className="font-bold text-[#131B2E]">
                        ₹{Math.round(budgetInr * (activeConfig.budgetBreakdown[1].pct / 100)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#4F5D72]">
                      <span>{activeConfig.budgetBreakdown[2].label} ({activeConfig.budgetBreakdown[2].pct}%)</span>
                      <span className="font-bold text-[#131B2E]">
                        ₹{Math.round(budgetInr * (activeConfig.budgetBreakdown[2].pct / 100)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Active Parameters & Traveler Count Bar */}
              <div className="lg:col-span-12 bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Traveler Counter */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#F2F3FF] text-[#C26D38] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#4F5D72] uppercase tracking-wider block">Travelers</span>
                      <span className="text-xs font-bold text-[#131B2E]">{people} {people === 1 ? 'Person' : 'People'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F2F3FF] p-1 rounded-xl border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setPeople(p => Math.max(1, p - 1))}
                      disabled={people <= 1}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-[#131B2E] flex items-center justify-center disabled:opacity-40 shadow-2xs cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-[#131B2E]">{people}</span>
                    <button
                      type="button"
                      onClick={() => setPeople(p => Math.min(10, p + 1))}
                      disabled={people >= 10}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 text-[#131B2E] flex items-center justify-center disabled:opacity-40 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Active Memory / Habit Pills */}
                <div className="flex-1 flex flex-wrap items-center gap-2 sm:justify-end">
                  <span className="text-[11px] font-medium text-[#4F5D72] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C26D38]" /> Agent memory:
                  </span>
                  {memory.routineText ? (
                    <span className="text-[11px] bg-[#FAF8FF] border border-slate-200/80 text-[#131B2E] font-medium px-2.5 py-1 rounded-lg italic">
                      "{memory.routineText}"
                    </span>
                  ) : (
                    <span className="text-[11px] bg-[#FAF8FF] border border-slate-200/80 text-[#4F5D72] px-2.5 py-1 rounded-lg">
                      Default 08:00 AM start · Balanced pace
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={openDrawer}
                    className="text-[11px] font-bold text-[#C26D38] hover:underline cursor-pointer flex items-center gap-1 ml-1"
                  >
                    <Settings className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Seed Presets Section */}
            <div className="mt-12 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <div className="text-[11px] font-bold text-[#4F5D72] tracking-wider">Quick start templates</div>
                  <h3 className="text-2xl font-bold text-[#131B2E]">Curated trip templates</h3>
                </div>
                <span className="text-xs text-[#4F5D72]">Curated journeys highlighting community homestays and verified local routes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Preset Card 1 */}
                <div
                  onClick={() => {
                    setSelectedCorridor(CORRIDORS[0]);
                    setBudgetInr(28000);
                    setAltitude(3800);
                    setDays(5);
                    setPace('balanced');
                  }}
                  className="group cursor-pointer bg-white p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-slate-200/80"
                >
                  <div className="space-y-3">
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#EAEDFF]">
                      <img
                        alt="Spiti Valley Circuit"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1Wk6G8iqVWt3fhiWhiPF1Ittt76WXw1t7-iNMg5vfxoY3GsfAx3Z-L4tcBdd6tSimUnBlPnt8ee-ml2OuShBOBtAwYbNCNmcFOM3JOFbrWsoBgGPgQXUzVgR2ZVAiMy0w4oR-eeekWRbsol3aTyaApxNvxhWCaCkeoqDZXRz3tJwvlwgjM2mSb4uc5ouFe_T8FUQR_AWxJALAXda1Yw6Zf1vDl_gX1VjxAOfY319ES2P_1UIveqG6fw"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider text-[#131B2E] shadow-xs">
                        5D // 4N journey
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#131B2E]">Spiti Valley Circuit</div>
                      <p className="text-xs text-[#4F5D72] mt-1">Kaza, Key Monastery, Chicham Bridge & Hikkim highest post office loop.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-[#4F5D72] font-semibold">Himachal Pradesh</div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#F2F3FF] group-hover:bg-[#C26D38] group-hover:text-white text-xs font-bold text-[#131B2E] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Load template</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preset Card 2 */}
                <div
                  onClick={() => {
                    setSelectedCorridor(CORRIDORS[1]);
                    setBudgetInr(22000);
                    setAltitude(1100);
                    setDays(4);
                    setPace('balanced');
                  }}
                  className="group cursor-pointer bg-white p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-slate-200/80"
                >
                  <div className="space-y-3">
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#EAEDFF]">
                      <img
                        alt="Coorg Coffee & Rainforest Retreat"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src="https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&w=800&q=80"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider text-[#131B2E] shadow-xs">
                        4D // 3N retreat
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#131B2E]">Coorg Coffee & Rainforest Retreat</div>
                      <p className="text-xs text-[#4F5D72] mt-1">Private coffee estate stays, Abbey Falls, Kodava spice kitchens, and Brahmagiri trails.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-[#4F5D72] font-semibold">Karnataka</div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#F2F3FF] group-hover:bg-[#C26D38] group-hover:text-white text-xs font-bold text-[#131B2E] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Load template</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preset Card 3 */}
                <div
                  onClick={() => {
                    setSelectedCorridor(CORRIDORS[2]);
                    setBudgetInr(26000);
                    setAltitude(1400);
                    setDays(5);
                    setPace('balanced');
                  }}
                  className="group cursor-pointer bg-white p-4 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-slate-200/80"
                >
                  <div className="space-y-3">
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-[#EAEDFF]">
                      <img
                        alt="Meghalaya Living Roots Trail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-md text-[10px] font-bold tracking-wider text-[#131B2E] shadow-xs">
                        5D // 4N trail
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#131B2E]">Meghalaya Living Roots Trail</div>
                      <p className="text-xs text-[#4F5D72] mt-1">Double-decker living root bridges, crystal-clear Umngot waters, and Khasi village homestays.</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-[#4F5D72] font-semibold">Northeast India</div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-[#F2F3FF] group-hover:bg-[#C26D38] group-hover:text-white text-xs font-bold text-[#131B2E] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Load template</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Execution Bar */}
            <div className="sticky bottom-6 mt-12 z-30">
              <div className="w-full bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#EAEDFF] flex items-center justify-center text-[#C26D38] shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#131B2E]">Ready to plan</span>
                    </div>
                    <div className="text-xs text-[#4F5D72] flex flex-wrap items-center gap-2 mt-0.5">
                      <span>Selected: <strong className="text-[#131B2E]">{selectedCorridor.sector}</strong></span>
                      <span>•</span>
                      <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
                      <span>•</span>
                      <span>{people} {people === 1 ? 'Traveler' : 'Travelers'}</span>
                      <span>•</span>
                      <span>₹{budgetInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleStartSynthesis}
                    disabled={isSpawning}
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#C26D38] hover:bg-[#A85A2A] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-80"
                  >
                    {isSpawning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Synthesizing your trip...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4" />
                        <span>Plan my trip</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: STEP-BY-STEP ENGINE WORKSPACE (Stitch planning_workspace.html)     */}
        {/* ========================================================================= */}
        {isExecuting && (
          <div className="w-full">
            {/* Pipeline Progress Stepper Track */}
            <section className="w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 shadow-2xs">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Stepper Badges */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1 no-scrollbar text-xs">
                  
                  {/* Step 1: Intent */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    activeStepIndex > 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                      : 'bg-slate-900 text-white font-bold'
                  }`}>
                    {activeStepIndex > 0 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                    <span>1. Intent</span>
                    <span className="text-[10px] opacity-75">{activeStepIndex > 0 ? 'Locked' : 'Active'}</span>
                  </div>

                  <span className="text-slate-300 font-bold">/</span>

                  {/* Step 2: Transport */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    activeStepIndex === 1
                      ? 'bg-slate-900 text-white font-bold'
                      : activeStepIndex > 1
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                      : 'bg-slate-100 text-slate-400 font-medium'
                  }`}>
                    {activeStepIndex > 1 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : activeStepIndex === 1 ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    ) : null}
                    <span>2. Transport</span>
                    <span className="text-[10px] opacity-75">{activeStepIndex === 1 ? 'Decision' : activeStepIndex > 1 ? 'Locked' : 'Queued'}</span>
                  </div>

                  <span className="text-slate-300 font-bold">/</span>

                  {/* Step 3: Stay */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    activeStepIndex === 2
                      ? 'bg-slate-900 text-white font-bold'
                      : activeStepIndex > 2
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                      : 'bg-slate-100 text-slate-400 font-medium'
                  }`}>
                    {activeStepIndex > 2 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : activeStepIndex === 2 ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    ) : null}
                    <span>3. Stay</span>
                    <span className="text-[10px] opacity-75">{activeStepIndex === 2 ? 'Active' : activeStepIndex > 2 ? 'Locked' : 'Queued'}</span>
                  </div>

                  <span className="text-slate-300 font-bold">/</span>

                  {/* Step 4: Activities */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    activeStepIndex === 3
                      ? 'bg-slate-900 text-white font-bold'
                      : activeStepIndex > 3
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                      : 'bg-slate-100 text-slate-400 font-medium'
                  }`}>
                    {activeStepIndex > 3 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : activeStepIndex === 3 ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    ) : null}
                    <span>4. Activities</span>
                    <span className="text-[10px] opacity-75">{activeStepIndex === 3 ? 'Active' : activeStepIndex > 3 ? 'Locked' : 'Queued'}</span>
                  </div>

                  <span className="text-slate-300 font-bold">/</span>

                  {/* Step 5: Optimizer */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    activeStepIndex === 4
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-400 font-medium'
                  }`}>
                    {activeStepIndex === 4 ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    ) : null}
                    <span>5. Optimizer</span>
                    <span className="text-[10px] opacity-75">{activeStepIndex === 4 ? 'Active' : 'Queued'}</span>
                  </div>

                </div>

                {/* Altitude Safety Badge */}
                <div className="hidden lg:flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold">{selectedCorridor.id === 'spiti' ? 'Paced for altitude safety' : 'Paced for comfortable daily travel'}</span>
                </div>

              </div>
            </section>

            {/* Main Interactive Stage Area */}
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

              {/* Stage 02: Transport Selection Scene */}
              {showTransportScene && (
                <div className="w-full">
                  <TransportSelectionScene
                    options={transportOptions}
                    budget={budgetInr}
                    origin={originCity}
                    destination={destination}
                    people={people}
                    days={days}
                    onSelect={(opt) => {
                      if (transportDecisionResolver.current) {
                        transportDecisionResolver.current(opt);
                      }
                    }}
                    onSkip={() => {
                      if (transportDecisionResolver.current) {
                        transportDecisionResolver.current(transportOptions[0]);
                      }
                    }}
                  />
                </div>
              )}

              {/* Stage 03: Stay Selection Scene */}
              {showStayScene && (
                <div className="w-full">
                  <StaySelectionScene
                    options={stayOptions}
                    destination={destination}
                    budget={budgetInr}
                    people={people}
                    days={days}
                    onSelect={(stay) => {
                      if (stayDecisionResolver.current) {
                        stayDecisionResolver.current(stay);
                      }
                    }}
                    onSkip={() => {
                      if (stayDecisionResolver.current) {
                        stayDecisionResolver.current(stayOptions[0]);
                      }
                    }}
                  />
                </div>
              )}

              {/* Stage 04: Curated Regional Experiences Selection */}
              {showActivityScene && (
                <div className="w-full">
                  <ActivitySelectionScene
                    activities={activitiesData}
                    destination={destination}
                    days={days}
                    onSelect={(acts) => {
                      if (activityDecisionResolver.current) {
                        activityDecisionResolver.current(acts);
                      }
                    }}
                    onSkip={() => {
                      if (activityDecisionResolver.current) {
                        activityDecisionResolver.current([]);
                      }
                    }}
                  />
                </div>
              )}

              {/* Stage 05: Expedition Review & Final Lock */}
              {showReviewScene && (
                <div className="w-full">
                  <ExpeditionReviewScene
                    itinerary={pendingResult?.itinerary}
                    selectedTransport={chosenTransport}
                    selectedStay={chosenStay}
                    selectedActivities={chosenActivities}
                    budget={budgetInr}
                    people={people}
                    days={days}
                    onConfirm={() => {
                      if (reviewDecisionResolver.current) {
                        reviewDecisionResolver.current(true);
                      }
                    }}
                  />
                </div>
              )}

              {/* Background Engine Loading State (when between scenes or initial synthesis) */}
              {!showTransportScene && !showStayScene && !showActivityScene && !showReviewScene && (
                <div className="w-full bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#EAEDFF] border border-[#DAE2FD] flex items-center justify-center text-[#914714] shadow-2xs">
                    <Compass className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#131B2E]">
                      Synthesizing your trip itinerary...
                    </h3>
                    <p className="text-xs text-[#4F5D72] max-w-md mt-1">
                      Curating verified local homestays with direct community escrow, and scheduling daily itineraries around your {memory?.routineText || '08:00 AM'} wake-up pace.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
