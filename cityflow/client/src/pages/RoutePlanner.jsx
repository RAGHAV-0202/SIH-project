import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, MapPin, CloudRain, Sun, ShieldCheck, FileText, Sparkles, Navigation, User, Package, ChevronDown, ChevronUp, X, Eye, EyeOff } from 'lucide-react';
import RouteResults from '../components/RouteResults';
import RouteMap from '../components/RouteMap';
import TransitTimeline from '../components/TransitTimeline';
import DisruptionBanner from '../components/DisruptionBanner';
import CarbonTracker from '../components/CarbonTracker';
import VoiceInputButton from '../components/VoiceInputButton';
import CommuteConcierge from '../components/CommuteConcierge';
import OfflineCommutePassModal from '../components/OfflineCommutePassModal';
import { api } from '../services/api';

const LOCATIONS = [
  'Dwarka Sec 21', 'Connaught Place', 'Rajiv Chowk', 'Kashmere Gate', 'Huda City Centre',
  'Noida Sec 62', 'Gurgaon Cyber Hub', 'Saket', 'Hauz Khas', 'Nehru Place', 'Rohini',
  'Pitampura', 'Chandni Chowk', 'Red Fort', 'India Gate', 'Karol Bagh', 'Lajpat Nagar',
  'South Extension', 'Greater Kailash', 'Vasant Kunj', 'Janakpuri', 'Patel Nagar', 'ITO',
  'Pragati Maidan', 'JLN Stadium', 'AIIMS', 'Dhaula Kuan', 'Airport T3',
  'New Delhi Railway Station', 'Old Delhi Railway Station'
];

const PREFS = ['Fastest', 'Cheapest', 'Greenest', 'Least Walking', 'Accessible'];

function mapBackendRoutes(backendRoutes) {
  if (!backendRoutes || !Array.isArray(backendRoutes)) return [];
  return backendRoutes.map((r, i) => {
    const tags = [];
    if (i === 0) tags.push('Best');
    const primaryMode = r.mainMode || r.segments?.[0]?.mode || 'metro';
    const totalCo2 = r.carbon_kg || r.segments?.reduce((s, seg) => s + (seg.carbon_kg || 0), 0) || 0;

    return {
      id: r.id || `route-${i}`,
      name: r.name || `Route ${i + 1}`,
      summary: r.summary || '',
      time: r.total_time_min || 0,
      cost: r.total_cost_inr || 0,
      co2: totalCo2,
      score: r.score ? Math.round((1 / (r.score || 1)) * 100) : 90 - i * 10,
      tags,
      mainMode: primaryMode,
      is_logistics: r.is_logistics || false,
      payload_capacity_kg: r.payload_capacity_kg || null,
      sla_type: r.sla_type || null,
      segments: (r.segments || []).map((seg, si) => ({
        id: `${r.id}-s${si}`,
        type: seg.mode || 'walk',
        from: seg.from?.name || 'Start',
        to: seg.to?.name || 'End',
        fromCoords: seg.from ? [seg.from.lat, seg.from.lng] : null,
        toCoords: seg.to ? [seg.to.lat, seg.to.lng] : null,
        duration: seg.duration_min || 0,
        cost: seg.cost_inr || 0,
        line: seg.line_name || seg.instructions || '',
        carbon_kg: seg.carbon_kg || 0,
        line_color: seg.line_color || '#64748B',
        distance_km: seg.distance_km || 0,
      })),
    };
  });
}

const RoutePlanner = () => {
  const [origin, setOrigin] = useState('Dwarka Sec 21');
  const [dest, setDest] = useState('Connaught Place');
  const [budget, setBudget] = useState(500);
  const [pref, setPref] = useState('Fastest');
  const [travelMode, setTravelMode] = useState('commute'); // 'commute' | 'delivery'
  const [cargoWeight, setCargoWeight] = useState(5); // kg

  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [routes, setRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const handleVoiceTranscript = (transcript) => {
    const lower = transcript.toLowerCase();
    const toMatch = lower.match(/(.+?)\s+(?:to|se|se leke)\s+(.+)/i);
    if (toMatch) {
      setOrigin(toMatch[1].trim());
      setDest(toMatch[2].replace(/(?:tak|jaana|chalo|please).*/i, '').trim());
    } else {
      setDest(transcript);
    }
  };

  const handleSearch = async () => {
    if (!origin || !dest) return;
    setIsSearching(true);
    setError(null);
    setRoutes(null);
    setSelectedRoute(null);

    const steps = travelMode === 'delivery' ? [
      'Querying live freight corridor density...',
      'Matching DMRC off-peak cargo & EV freight options...',
      'Calculating payload capacity & carbon footprint...',
      'Optimizing last-mile freight routes...'
    ] : [
      'Querying live OpenWeatherMap API for Delhi...',
      'Checking corridor traffic density (Ring Road / NH-8)...',
      'Resolving OpenStreetMap geocodes for stations...',
      'Matching DMRC Metro & DTC Bus network graphs...',
      'Optimizing multimodal route matrix...'
    ];

    let stepIndex = 0;
    setSearchStatus(steps[0]);
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setSearchStatus(steps[stepIndex]);
      }
    }, 600);

    try {
      const prefMap = {
        'Fastest': 'fastest',
        'Cheapest': 'cheapest',
        'Greenest': 'greenest',
        'Least Walking': 'least_walking',
        'Accessible': 'accessible',
      };

      const userInput = travelMode === 'delivery'
        ? `Deliver ${cargoWeight}kg cargo from ${origin} to ${dest}, budget ${budget} rupees`
        : `I need to get from ${origin} to ${dest}, budget ${budget} rupees, preference: ${prefMap[pref] || 'fastest'}`;

      const result = await api.planRoute({
        userInput,
        origin,
        destination: dest,
        budget,
        pref: prefMap[pref] || 'fastest',
        mode: travelMode,
        payload_weight_kg: cargoWeight
      });
      clearInterval(interval);

      if (result.context?.weather) {
        setWeatherData(result.context.weather);
      }

      const mapped = mapBackendRoutes(result.routes);

      if (mapped.length > 0) {
        const cheapest = mapped.reduce((a, b) => a.cost < b.cost ? a : b);
        const greenest = mapped.reduce((a, b) => a.co2 < b.co2 ? a : b);
        if (!cheapest.tags.includes('Cheapest')) cheapest.tags.push('Cheapest');
        if (!greenest.tags.includes('Greenest')) greenest.tags.push('Greenest');
      }

      setRoutes(mapped);
      if (mapped.length > 0) {
        setSelectedRoute(mapped[0]);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      clearInterval(interval);
      setError(err.message || 'Failed to connect to backend server. Make sure server is running on port 3001.');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-dispatch on initial mount so user immediately sees synthesized multimodal path
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#FAF8FF] text-[#131B2E]">

      {/* Left Panel - Input & Results */}
      <div className="w-full md:w-[440px] bg-white border-r border-slate-200/90 flex flex-col p-5 overflow-y-auto z-10 space-y-5 shadow-xs font-body">
        
        {/* Header with Title and Reused Voice Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#C26D38] tracking-widest block font-display">
              {travelMode === 'delivery' ? 'Autonomous Logistics Dispatcher' : 'Autonomous Commute Dispatcher'}
            </span>
            <h2 className="text-xl font-bold text-[#131B2E] font-display">
              {travelMode === 'delivery' ? 'Plan Freight Delivery' : 'Plan Your Journey'}
            </h2>
          </div>
          <VoiceInputButton onTranscript={handleVoiceTranscript} />
        </div>

        {/* Travel Mode Toggle (Passenger Commute vs Logistics Delivery) */}
        <div className="flex bg-[#F2F3FF] p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setTravelMode('commute')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              travelMode === 'commute'
                ? 'bg-white text-[#131B2E] shadow-2xs'
                : 'text-[#64748B] hover:text-[#131B2E]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Passenger Commute
          </button>
          <button
            type="button"
            onClick={() => setTravelMode('delivery')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              travelMode === 'delivery'
                ? 'bg-[#C26D38] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#131B2E]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Logistics Delivery
          </button>
        </div>

        {/* Live Weather Indicator */}
        {weatherData && (
          <div className="p-3 rounded-2xl bg-[#FFF8F3] border border-[#FFDBC9] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {weatherData.isRain ? (
                <CloudRain className="w-4 h-4 text-[#C26D38]" />
              ) : (
                <Sun className="w-4 h-4 text-[#D97706]" />
              )}
              <span className="text-[#131B2E] font-medium">
                Delhi: {weatherData.temp}°C, {weatherData.description}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#006C4A] bg-[#DEF7EC] px-2 py-0.5 rounded-full font-bold">
              LIVE METEOROLOGY
            </span>
          </div>
        )}

        {/* Delivery Payload Configuration */}
        {travelMode === 'delivery' && (
          <div className="p-3.5 bg-[#FFF8F3] border border-[#FFDBC9] rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#131B2E] font-display flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#C26D38]" /> Payload Weight Category
              </span>
              <span className="font-mono font-bold text-[#C26D38]">{cargoWeight} kg</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '5 kg', val: 5, desc: 'Docs / Food' },
                { label: '15 kg', val: 15, desc: 'Parcel' },
                { label: '50 kg', val: 50, desc: 'Carton' },
                { label: '200 kg', val: 200, desc: 'Bulk Cargo' }
              ].map(tier => (
                <button
                  key={tier.val}
                  type="button"
                  onClick={() => setCargoWeight(tier.val)}
                  className={`py-1.5 px-1 rounded-lg text-center cursor-pointer transition-all border ${
                    cargoWeight === tier.val
                      ? 'bg-[#C26D38] text-white border-[#C26D38] font-bold shadow-xs'
                      : 'bg-white text-[#4F5D72] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{tier.label}</div>
                  <div className="text-[9px] opacity-80 truncate">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4F5D72] mb-1 font-display">
              {travelMode === 'delivery' ? 'Pickup Hub / Warehouse' : 'Origin Station / Address'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder={travelMode === 'delivery' ? 'e.g. Dwarka Sec 21 Warehouse' : 'e.g. Dwarka Sec 21'}
                className="w-full bg-[#FAF8FF] border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-10 text-[#131B2E] text-sm focus:outline-none focus:border-[#C26D38] focus:bg-white transition-colors"
                list="locations"
              />
              <MapPin className="absolute right-3.5 top-3 h-4 w-4 text-[#006C4A]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4F5D72] mb-1 font-display">
              {travelMode === 'delivery' ? 'Delivery Consignee / Retail Hub' : 'Destination Hub / Landmark'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={dest}
                onChange={e => setDest(e.target.value)}
                placeholder={travelMode === 'delivery' ? 'e.g. Connaught Place Retailer' : 'e.g. Connaught Place'}
                className="w-full bg-[#FAF8FF] border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-10 text-[#131B2E] text-sm focus:outline-none focus:border-[#C26D38] focus:bg-white transition-colors"
                list="locations"
              />
              <MapPin className="absolute right-3.5 top-3 h-4 w-4 text-rose-500" />
            </div>
          </div>
          <datalist id="locations">
            {LOCATIONS.map(loc => <option key={loc} value={loc} />)}
          </datalist>

          <div>
            <div className="flex justify-between text-xs text-[#4F5D72] mb-1">
              <span className="font-semibold">{travelMode === 'delivery' ? 'Tariff Budget Cap' : 'Budget Cap'}</span>
              <span className="text-[#C26D38] font-mono font-bold text-sm">₹{budget}</span>
            </div>
            <input
              type="range" min="30" max="800" step="20"
              value={budget} onChange={e => setBudget(Number(e.target.value))}
              className="w-full accent-[#C26D38] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4F5D72] mb-1.5 font-display">
              {travelMode === 'delivery' ? 'Logistics Optimization Objective' : 'Transit Objective'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PREFS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPref(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    pref === p
                      ? 'bg-[#C26D38] text-white shadow-xs'
                      : 'bg-[#F2F3FF] text-[#4F5D72] hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Find Routes Button */}
        <button
          onClick={handleSearch}
          disabled={!origin || !dest || isSearching}
          className="w-full py-3.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white font-bold text-sm shadow-xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all font-display"
        >
          {isSearching ? <Loader2 className="animate-spin w-4 h-4" /> : <Navigation className="w-4 h-4" />}
          {isSearching ? (travelMode === 'delivery' ? 'Synthesizing Logistics Matrix...' : 'Synthesizing Multimodal Matrix...') : (travelMode === 'delivery' ? 'Optimize Freight Route' : 'Dispatch Multimodal Route')}
        </button>

        {isSearching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3.5 rounded-xl bg-[#FFF8F3] border border-[#FFDBC9] text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-[#C26D38] font-medium">
              <Loader2 className="animate-spin w-4 h-4" />
              <span>{searchStatus}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Routes Result List */}
        {routes && !isSearching && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] font-display">
                {routes.length} Evaluated Corridors
              </h3>
              <button
                type="button"
                onClick={() => setIsPassModalOpen(true)}
                className="text-xs text-[#C26D38] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Offline Pass
              </button>
            </div>
            <RouteResults
              routes={routes}
              selectedId={selectedRoute?.id}
              onSelect={r => {
                setSelectedRoute(r);
                setIsDetailsOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Right Panel - Map & Live Concierge Drawer */}
      <div className="flex-1 bg-[#FAF8FF] relative flex flex-col">
        <DisruptionBanner />

        <div className="flex-1 relative min-h-[380px] overflow-hidden">
          <RouteMap
            route={selectedRoute}
            origin={origin}
            destination={dest}
            isDetailsOpen={isDetailsOpen}
            onToggleDetails={() => setIsDetailsOpen(prev => !prev)}
          />

          {/* Floating Expand Button when Details Panel is collapsed */}
          {!isDetailsOpen && selectedRoute && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className="absolute bottom-6 right-6 z-[500] bg-[#131B2E]/95 hover:bg-[#131B2E] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer backdrop-blur-md hover:scale-105"
            >
              <div className="w-2 h-2 rounded-full bg-[#006C4A] animate-pulse" />
              <span>Show Commute Details ({selectedRoute.time} min · ₹{selectedRoute.cost})</span>
              <ChevronUp className="w-4 h-4 text-[#C26D38]" />
            </motion.button>
          )}
        </div>

        {/* Bottom Drawer: Commute Concierge & Timeline */}
        <AnimatePresence>
          {selectedRoute && isDetailsOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-5 max-h-[50vh] overflow-y-auto z-20 shadow-2xl"
            >
              <div className="max-w-5xl mx-auto space-y-4">
                {/* Drawer Header with Close / Hide controls */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#006C4A]" />
                    <span className="text-xs font-extrabold text-[#131B2E] font-display">
                      {selectedRoute.name}
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">
                      · {selectedRoute.time} min · ₹{selectedRoute.cost} · {selectedRoute.co2} kg CO₂
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF8FF] hover:bg-slate-100 text-[#4F5D72] hover:text-[#131B2E] border border-slate-200 transition-all cursor-pointer shadow-2xs"
                    title="Hide panel to view full map"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#C26D38]" />
                    <span>Hide Panel (Full Map)</span>
                    <X className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
                  </button>
                </div>

                {/* Reused & Adapted Commute Concierge */}
                <CommuteConcierge
                  route={selectedRoute}
                  origin={origin}
                  destination={dest}
                  targetArrival="09:00 AM"
                  onOpenOfflinePass={() => setIsPassModalOpen(true)}
                />

                <div className="flex flex-col md:flex-row gap-6 pt-2">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-display mb-3">
                      Segment Breakdown ({selectedRoute.segments?.length || 0} stages)
                    </h4>
                    <TransitTimeline segments={selectedRoute.segments} />
                  </div>
                  <div className="w-full md:w-72">
                    <CarbonTracker co2={selectedRoute.co2} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reused Offline Pass Modal */}
      <OfflineCommutePassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        route={selectedRoute || (routes && routes[0])}
        origin={origin}
        destination={dest}
      />
    </div>
  );
};

export default RoutePlanner;
