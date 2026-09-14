import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Compass,
  Mountain,
  Wallet,
  Calendar,
  Users,
  ShieldCheck,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Home,
  Flame,
  Clock
} from 'lucide-react';

const CORRIDORS = [
  {
    id: 'spiti',
    name: 'Spiti Valley Circuit',
    tagline: 'High-Altitude Cold Desert & Monasteries',
    altitude: 'Average 3,800m',
    highlight: 'Kaza, Ki Monastery, Hikkim, Mudh Village',
    roadStatus: 'Clear via All-Weather Passage',
    defaultBudget: 30000,
    defaultDays: 5,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDMz9BNd3la1emc4JR9RjlkADVXTlO8Gftw_Y3y7ySwjYNkkMvkIUq_jCkFA6oRXU3JuB2YAxgPSQP_ZKUfNn7lFC7X8QTTLITLxpr159i9gUoDgQ-chH0cEd8bXhREXL7jbtiwTJVrUgy3GG10RjKXMQBg1sSNeAPH00TMJptYZDNKaBTKJetFoDEBem5j_-iY1eNR20xSCHYoBBWUpzuKOvFvR4t9HFPPV0-vxQUreVw1dsJa5V0oA'
  },
  {
    id: 'kinnaur',
    name: 'Kinnaur Apple Valley',
    tagline: 'Lush Pine Valleys & Baspa River',
    altitude: 'Average 2,800m',
    highlight: 'Sangla, Chitkul, Kalpa Sacred Groves',
    roadStatus: 'Open Scenic Valley Corridor',
    defaultBudget: 24000,
    defaultDays: 4,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUzVp5vFmJOWtEA8BWmiatTpZ90y4E0sI2Fy4LT_KQdP3vjMc9wKN7NEUGQXKIypZ5A83ON_lScFlWGPYFwsYXNNlRK3GUOW-MVbLowcmvHHtLA-AXyh_VNHVKIlKrQGU88_EvyTSZMQtdcUgHK0xxVmzYDgiCCLiMXvoEUxycOU33eeWvKBipj_Kykbj5JKGldt86H8xC1SIYnDWVjyY18idj0FDRfB_zv93kQbQYqq9TGegP8jspvA'
  },
  {
    id: 'ladakh',
    name: 'Ladakh Zanskar Corridor',
    tagline: 'Remote Glacial Passes & Ancient Forts',
    altitude: 'Average 4,200m',
    highlight: 'Padum, Karsha Monastery, Shinku La',
    roadStatus: 'Paved & Guided 4x4 Only',
    defaultBudget: 45000,
    defaultDays: 7,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD49K_HdaJIGRsf4r2UtdNLpcrdixvz_p-FA223Fi7go8v1_hzSf7h6d_MDvceYMnIp83hEt_fWENyw6mNnxmurkRxOKeCqO9HoHkRmfJ3PYsrBXgc6nrQ2ZmCRanAAF2T2vaDaDGiTQx6CDPbeQAJXZz8zI7b07-_bxEgQWlY6o7sozJu1n-UaOX3sWWGv_GJHZu6WUW3ELCpjzYymhgHnOj6qOXAc3k8tuYffTCpcpOBxru51p5mUPA'
  }
];

const TEMPLATES = [
  {
    title: 'Spiti Acclimatization Circuit',
    corridorId: 'spiti',
    budget: 30000,
    days: 5,
    travelers: 2,
    badge: 'Most Popular'
  },
  {
    title: 'Peaceful Kinnaur Valley Retreat',
    corridorId: 'kinnaur',
    budget: 24000,
    days: 4,
    travelers: 2,
    badge: 'Gentle Altitude'
  },
  {
    title: 'Deep Zanskar Expedition',
    corridorId: 'ladakh',
    budget: 45000,
    days: 7,
    travelers: 2,
    badge: 'High Alpine Adventure'
  }
];

export default function TripPlannerStart() {
  const navigate = useNavigate();
  const [selectedCorridor, setSelectedCorridor] = useState(CORRIDORS[0]);
  const [budget, setBudget] = useState(30000);
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [tripPace, setTripPace] = useState('acclimatization'); // 'acclimatization' | 'balanced'
  const [lodgingPref, setLodgingPref] = useState('homestay'); // 'homestay' | 'boutique'

  // Estimated allocations based on budget
  const transitCost = Math.round(budget * 0.45);
  const stayCost = Math.round(budget * 0.32);
  const foodAndBuffer = budget - transitCost - stayCost;

  const handleApplyTemplate = (tpl) => {
    const corr = CORRIDORS.find(c => c.id === tpl.corridorId) || CORRIDORS[0];
    setSelectedCorridor(corr);
    setBudget(tpl.budget);
    setDays(tpl.days);
    setTravelers(tpl.travelers);
  };

  const handleGeneratePlan = () => {
    const prompt = `${days} days in ${selectedCorridor.name}, ₹${budget.toLocaleString('en-IN')}, ${travelers} travelers, ${tripPace === 'acclimatization' ? 'gradual acclimatization rest pace' : 'balanced explorer pace'}, authentic ${lodgingPref === 'homestay' ? 'village homestay' : 'boutique lodge'}`;
    navigate('/planning', {
      state: {
        prompt,
        destination: selectedCorridor.name,
        budget,
        duration: days,
        travelers,
        pace: tripPace,
        lodging: lodgingPref,
        autoRun: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step 1 Headline & Reassurance */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C26D38]" />
            <span>Step 1 of 2: Shape Your Mountain Journey</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Where would you like to explore?
          </h1>
          <p className="text-base text-slate-600 mt-2 leading-relaxed">
            Every itinerary is custom-built with verified local village homestays, licensed high-altitude 4x4 drivers, and gradual altitude pacing for complete peace of mind.
          </p>
        </div>

        {/* Quick Curated Templates */}
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Quick-Select Curated Templates
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedCorridor.id === tpl.corridorId && budget === tpl.budget
                    ? 'bg-white border-[#C26D38] ring-2 ring-[#C26D38]/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                    {tpl.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    ₹{tpl.budget.toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{tpl.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tpl.days} Days · {tpl.travelers} Guests
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Corridor Selection & Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Corridor Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Select Destination Corridor
              </span>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Routes Currently Open
              </span>
            </div>

            <div className="space-y-3.5">
              {CORRIDORS.map((corridor) => {
                const isSelected = selectedCorridor.id === corridor.id;
                return (
                  <div
                    key={corridor.id}
                    onClick={() => {
                      setSelectedCorridor(corridor);
                      setBudget(corridor.defaultBudget);
                      setDays(corridor.defaultDays);
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                      isSelected
                        ? 'bg-white border-[#C26D38] ring-2 ring-[#C26D38]/20 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <img
                      src={corridor.image}
                      alt={corridor.name}
                      className="w-full sm:w-28 h-24 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {corridor.altitude}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-[#C26D38] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Selected
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-bold text-slate-900 mt-1">
                        {corridor.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {corridor.tagline}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{corridor.highlight}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Pace & Lodging Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              {/* Pace */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Trip Pace
                </span>
                <div className="space-y-2">
                  <label
                    onClick={() => setTripPace('acclimatization')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      tripPace === 'acclimatization'
                        ? 'border-[#C26D38] bg-amber-50/40 text-slate-900 font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pace"
                      checked={tripPace === 'acclimatization'}
                      onChange={() => setTripPace('acclimatization')}
                      className="mt-0.5 accent-[#C26D38]"
                    />
                    <div>
                      <span className="text-xs block font-bold">Acclimatization-First</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Extra rest stops to prevent mountain sickness.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setTripPace('balanced')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      tripPace === 'balanced'
                        ? 'border-[#C26D38] bg-amber-50/40 text-slate-900 font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pace"
                      checked={tripPace === 'balanced'}
                      onChange={() => setTripPace('balanced')}
                      className="mt-0.5 accent-[#C26D38]"
                    />
                    <div>
                      <span className="text-xs block font-bold">Balanced Explorer</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Active daily schedule with key highlights.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Lodging */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Lodging Preference
                </span>
                <div className="space-y-2">
                  <label
                    onClick={() => setLodgingPref('homestay')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      lodgingPref === 'homestay'
                        ? 'border-[#C26D38] bg-amber-50/40 text-slate-900 font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lodging"
                      checked={lodgingPref === 'homestay'}
                      onChange={() => setLodgingPref('homestay')}
                      className="mt-0.5 accent-[#C26D38]"
                    />
                    <div>
                      <span className="text-xs block font-bold">100% Local Homestays</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        Direct village host families & wood-burning heating.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setLodgingPref('boutique')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      lodgingPref === 'boutique'
                        ? 'border-[#C26D38] bg-amber-50/40 text-slate-900 font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lodging"
                      checked={lodgingPref === 'boutique'}
                      onChange={() => setLodgingPref('boutique')}
                      className="mt-0.5 accent-[#C26D38]"
                    />
                    <div>
                      <span className="text-xs block font-bold">Boutique Eco-Lodge</span>
                      <span className="text-[11px] text-slate-500 leading-tight block">
                        En-suite luxury amenities & panoramic views.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Budget Slider & Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Budget & Party Size
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  100% Direct Payouts
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Total Budget Plan</h2>
            </div>

            {/* Slider */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-slate-500">Calculated Budget:</span>
                <span className="text-3xl font-black text-[#C26D38] font-mono">
                  ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={80000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#C26D38]"
              />
              <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1.5">
                <span>₹15,000 (Lean)</span>
                <span>₹45,000 (Median)</span>
                <span>₹80,000 (Expedition)</span>
              </div>
            </div>

            {/* Travelers & Duration */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#FAF8FF] border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Duration</span>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-xs text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value={3}>3 Days / 2 Nights</option>
                  <option value={4}>4 Days / 3 Nights</option>
                  <option value={5}>5 Days / 4 Nights</option>
                  <option value={7}>7 Days / 6 Nights</option>
                  <option value={10}>10 Days / 9 Nights</option>
                </select>
              </div>

              <div className="p-3 bg-[#FAF8FF] border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Travelers</span>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full bg-transparent font-bold text-xs text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Solo Explorer</option>
                  <option value={2}>2 Duo (1 Room)</option>
                  <option value={4}>4 Group (2 Rooms)</option>
                  <option value={6}>6 Group (3 Rooms)</option>
                </select>
              </div>
            </div>

            {/* Allocation Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400 block">
                Estimated Cost Breakdown
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Transit & Dedicated 4x4 Driver</span>
                  <span className="font-semibold text-slate-900 font-mono">₹{transitCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Curated Homestays ({days - 1} Nights)</span>
                  <span className="font-semibold text-slate-900 font-mono">₹{stayCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Meals, Permits & Emergency Reserve</span>
                  <span className="font-semibold text-slate-900 font-mono">₹{foodAndBuffer.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                  <span>Wandr Platform Fee</span>
                  <span>₹0 (Zero Markups)</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleGeneratePlan}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#C26D38] hover:bg-[#A85A2A] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Generate My Custom Plan →</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400">
              No booking commitment required. You can customize every stop in Step 2.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
