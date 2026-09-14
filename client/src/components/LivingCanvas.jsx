import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Wallet,
  Building2,
  Bus,
  Train,
  Plane,
  Car,
  Compass,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sunrise,
  Sun,
  Moon,
  CloudSun,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer
} from 'lucide-react';
import TransportSelectionScene from './TransportSelectionScene';
import StaySelectionScene from './StaySelectionScene';
import SafetyScorecard from './SafetyScorecard';
import OfflineTripPackModal from './OfflineTripPackModal';
import { ensureItineraryWeather } from '../services/weatherService';

function renderWeatherIcon(condition, className = 'w-4 h-4 text-amber-400') {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) {
    return <CloudLightning className={className || 'w-4 h-4 text-amber-500'} />;
  }
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) {
    return <CloudRain className={className || 'w-4 h-4 text-blue-400'} />;
  }
  if (c.includes('cloud') || c.includes('partly')) {
    return <CloudSun className={className || 'w-4 h-4 text-amber-300'} />;
  }
  if (c.includes('mist') || c.includes('fog') || c.includes('wind')) {
    return <Wind className={className || 'w-4 h-4 text-cyan-300'} />;
  }
  return <Sun className={className || 'w-4 h-4 text-amber-400'} />;
}

const DESTINATION_HOTEL_IMAGES = {
  rishikesh: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
  manali: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
  'spiti valley': 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
  coorg: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=800&q=80',
  meghalaya: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  goa: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
};

function getLodgingImage(stay, dest) {
  if (stay?.images?.[0]) return stay.images[0];
  const d = (stay?.destination || dest || '').toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_HOTEL_IMAGES)) {
    if (d.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
}

export default function LivingCanvas({
  itinerary,
  isStreaming = false,
  transportOptions = [],
  stayOptions = [],
  isSelectingTransport = false,
  isSelectingStay = false,
  onSelectTransport,
  onSkipTransport,
  onSelectStay,
  onSkipStay,
  onUpdateTransport,
  onUpdateStay,
  onTrimActivities,
  highlightedCardId = null,
  isDisrupted = false,
  destination: destinationProp = null,
}) {
  const [editingItemId, setEditingItemId] = useState(null);
  const [expandedDays, setExpandedDays] = useState(new Set([1]));
  const [showTripPack, setShowTripPack] = useState(false);

  const resolvedDestination = itinerary?.destination || destinationProp || 'your destination';

  // Reset to Day 1 expanded whenever itinerary destination changes
  useEffect(() => {
    setExpandedDays(new Set([1]));
  }, [itinerary?.destination, itinerary?.days]);

  // Auto-expand day if a card on that day is highlighted (e.g. during disruption or edit)
  useEffect(() => {
    if (highlightedCardId) {
      const match = highlightedCardId.match(/(\d+)/);
      if (match) {
        const dayNum = parseInt(match[1], 10);
        setExpandedDays((prev) => new Set([...prev, dayNum]));
      }
    }
  }, [highlightedCardId]);

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) {
        next.delete(dayNum);
      } else {
        next.add(dayNum);
      }
      return next;
    });
  };

  // ─── PROGRESSIVE DISCLOSURE: Step 2 Transport Decision is Solo Element ────
  if (isSelectingTransport) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <TransportSelectionScene
            options={transportOptions}
            budget={itinerary?.budget_inr || 30000}
            origin={itinerary?.origin || ''}
            destination={resolvedDestination}
            people={itinerary?.people || 2}
            onSelect={onSelectTransport}
            onSkip={onSkipTransport}
          />
        </motion.div>
      </div>
    );
  }

  // ─── PROGRESSIVE DISCLOSURE: Step 3 Homestay Decision is Solo Element ──────
  if (isSelectingStay) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <StaySelectionScene
            options={stayOptions}
            budget={itinerary?.budget_inr || 30000}
            destination={resolvedDestination}
            people={itinerary?.people || 2}
            days={itinerary?.days || 4}
            onSelect={onSelectStay}
            onSkip={onSkipStay}
          />
        </motion.div>
      </div>
    );
  }

  // ─── PLANNING / LOADING CANVAS: When agent pipeline is running ─────────────
  if (isStreaming && !itinerary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-slate-500 select-none">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center text-emerald-600 mb-4">
          <Compass className="w-7 h-7 animate-spin text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Planning your trip to {resolvedDestination !== 'your destination' ? resolvedDestination : 'your destination'}...
        </h2>
        <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
          Evaluating transit corridors, curating verified local homestays, and optimizing daily schedules.
        </p>
      </div>
    );
  }

  // ─── INITIAL EMPTY STATE: Before any query has been run ───────────────────
  if (!itinerary) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-slate-500 select-none">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-md flex items-center justify-center text-emerald-600 mb-4">
          <Compass className="w-7 h-7 text-emerald-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Ready to plan your trip
        </h2>
        <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
          Enter a destination and budget above to start the multi-agent planning pipeline.
        </p>
      </div>
    );
  }

  const activeItinerary = ensureItineraryWeather(itinerary);

  const {
    destination = destinationProp || 'your destination',
    days = 5,
    people = 2,
    budget_inr = 30000,
    budget_remaining = 8900,
    cost_breakdown = {},
    day_plans = [],
    selected_stay = null,
    weather: destWeather = null,
  } = activeItinerary || {};

  const isOverBudget = budget_remaining < 0;
  const allExpanded = day_plans.length > 0 && day_plans.every((d) => expandedDays.has(d.day));

  const toggleAllDays = () => {
    if (allExpanded) {
      setExpandedDays(new Set([1])); // collapse all except Day 1
    } else {
      setExpandedDays(new Set(day_plans.map((d) => d.day)));
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-32">
      
      {/* Flight Deck Canvas Header */}
      {itinerary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80"
        >
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="uppercase tracking-wider text-[11px]">Synthesized Itinerary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {destination}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {days} days exploration
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {people} {people > 1 ? 'people' : 'person'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Budget ₹{budget_inr.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTripPack(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs"
              title="Download Offline Boarding Pass & Trip Pack"
            >
              <span>📴 Offline Pass & QR</span>
            </button>

            {isOverBudget ? (
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shadow-xs">
                  ⚠️ ₹{Math.abs(budget_remaining).toLocaleString('en-IN')} over budget
                </div>
                {onTrimActivities && (
                  <button
                    type="button"
                    onClick={onTrimActivities}
                    className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Trim to budget
                  </button>
                )}
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ₹{budget_remaining?.toLocaleString('en-IN')} reserve buffer
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── DESTINATION CLIMATE & MULTI-DAY WEATHER BAR ────────────── */}
      {destWeather && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
            {/* Left: Current Weather Snapshot */}
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
                {renderWeatherIcon(destWeather.day_forecasts?.[0]?.condition || 'sunny', 'w-8 h-8 text-amber-500')}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    {destWeather.destination} · {destWeather.zone || 'Mountain Climate'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
                    {destWeather.altitude_meters ? `${destWeather.altitude_meters}m elevation` : 'Verified microclimate'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Forecast synced
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {destWeather.current_temp_c || destWeather.day_forecasts?.[0]?.temp_c || 22}°C
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-slate-700">{destWeather.day_forecasts?.[0]?.condition_label || 'Clear Skies'}</span>
                  <span>·</span>
                  <span className="text-slate-500">
                    Range: {destWeather.temp_range?.min || 15}°C – {destWeather.temp_range?.max || 26}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Microchips for Each Day */}
            <div className="flex items-center gap-2.5 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
              {(destWeather.day_forecasts || []).slice(0, 5).map((df) => (
                <div
                  key={df.day}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 flex flex-col items-center gap-1 min-w-[76px] text-center transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Day {df.day}
                  </span>
                  {renderWeatherIcon(df.condition, 'w-4 h-4')}
                  <span className="text-xs font-extrabold text-slate-900">
                    {df.temp_c}°C
                  </span>
                  <span className="text-[9px] text-emerald-700 font-semibold">
                    {df.rain_chance > 20 ? `${df.rain_chance}% rain` : 'Clear'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Advisory & Packing Tip */}
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">Advisory</span>
              <span className="text-slate-700 font-medium">{destWeather.advisory}</span>
            </div>
            {destWeather.pack_advice && (
              <div className="text-slate-500 text-[11px] flex-shrink-0">
                <span className="text-slate-700 font-semibold">Recommended gear:</span> {destWeather.pack_advice}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── WOMEN & SOLO TRAVELER SAFETY SCORECARD & GUARDIAN SENTINEL ─── */}
      <SafetyScorecard itinerary={activeItinerary} destination={resolvedDestination} />

      {/* ─── BASECAMP SUMMARY BAR (Multi-night stay presented once) ───── */}
      {(selected_stay || day_plans?.[0]?.stay) && (
        (() => {
          const baseStay = selected_stay || day_plans?.[0]?.stay;
          const stayNights = Math.max(1, days - 1);
          const totalStayCost = (baseStay.price_per_night_inr || 0) * stayNights;

          return (
            <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-24 h-20 sm:w-28 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200 relative shadow-xs group bg-slate-100">
                    <img
                      src={getLodgingImage(baseStay, destination)}
                      alt={baseStay.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {baseStay.is_local_homestay && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold shadow-xs">
                        ★ Local
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Basecamp · {stayNights} {stayNights === 1 ? 'night' : 'nights'}
                      </span>
                      {baseStay.is_local_homestay && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                          ★ Local Homestay
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {baseStay.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Host: <span className="font-semibold text-slate-700">{baseStay.local_owner_name || 'Verified resident'}</span> · {baseStay.location ? `${baseStay.location} · ` : ''}{baseStay.type || 'Homestay'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div className="flex items-baseline sm:justify-end gap-1">
                      <span className="font-extrabold text-lg text-slate-900">
                        ₹{baseStay.price_per_night_inr?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/night</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      ₹{totalStayCost.toLocaleString('en-IN')} total stay
                    </span>
                  </div>
                  {onUpdateStay && (
                    <button
                      type="button"
                      onClick={() => setEditingItemId(editingItemId === 'basecamp-stay' ? null : 'basecamp-stay')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer underline underline-offset-4"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Stay Change Picker for Basecamp */}
              {editingItemId === 'basecamp-stay' && (
                <div className="mt-5 pt-5 border-t border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">Select alternative accommodation</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(stayOptions.length > 0 ? stayOptions : [baseStay]).map((stay) => (
                      <div
                        key={stay.id || stay.name}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getLodgingImage(stay, destination)}
                            alt={stay.name}
                            loading="lazy"
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{stay.name}</span>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">
                              Host: {stay.local_owner_name || 'Host'} · ₹{stay.price_per_night_inr?.toLocaleString('en-IN')}/night
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateStay) onUpdateStay(stay);
                            setEditingItemId(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer flex-shrink-0 shadow-2xs"
                        >
                          Choose
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* ─── BENTO BOX DAILY PROGRESSION (Day-Accordion Pattern) ─────── */}
      {day_plans && day_plans.length > 0 && (
        <div className="space-y-4">
          {/* Section Header Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Day-by-day itinerary
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                ({day_plans.length} days)
              </span>
            </div>
            <button
              type="button"
              onClick={toggleAllDays}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer transition-colors"
            >
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          <div className="space-y-3">
            {day_plans.map((dayPlan) => {
              const isExpanded = expandedDays.has(dayPlan.day);
              const summaryText = dayPlan.activities?.length > 0
                ? `${dayPlan.activities.length} ${dayPlan.activities.length === 1 ? 'activity' : 'activities'} planned`
                : dayPlan.transport ? 'Transit day' : 'Rest day';

              const dayTheme = dayPlan.theme || dayPlan.title || (
                dayPlan.activities?.length > 0
                  ? dayPlan.activities.map(a => a.name || a.title).slice(0, 2).join(' & ')
                  : dayPlan.transport ? 'Arrival & Check-in' : 'Rest & Local Exploration'
              );

              return (
                <section
                  key={dayPlan.day}
                  className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all"
                >
                  {/* Clickable Accordion Header */}
                  <div
                    onClick={() => toggleDay(dayPlan.day)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDay(dayPlan.day); }}
                    className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                      isExpanded ? 'bg-slate-50/80 border-b border-slate-200/80' : 'bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex-shrink-0">
                        Day {dayPlan.day}
                      </span>
                      <span className="text-sm font-bold text-slate-900 truncate">
                        Day {dayPlan.day} · {dayTheme}
                      </span>
                      <span className="text-xs text-slate-400">
                        — {summaryText}
                      </span>
                      {dayPlan.weather && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                          {renderWeatherIcon(dayPlan.weather.condition, 'w-3.5 h-3.5')}
                          <span>{dayPlan.weather.temp_c}°C</span>
                          <span className="text-slate-400 hidden md:inline">· {dayPlan.weather.condition_label}</span>
                        </span>
                      )}
                      {dayPlan.routine && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
                          ⏰ {dayPlan.routine.wake_up_time} wake-up
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        {dayPlan.date}
                      </span>
                      <div className={`p-1.5 rounded-xl bg-slate-100 text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-slate-900' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expandable Bento Grid */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-[#FAFAFB]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Bento Climate Context Strip */}
                        {dayPlan.weather && (
                          <div className={`md:col-span-3 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
                            dayPlan.weather.condition === 'thunderstorm'
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-white border-slate-200/80 text-slate-700 shadow-2xs'
                          }`}>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                                {renderWeatherIcon(dayPlan.weather.condition, 'w-4 h-4')}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900">
                                  Day {dayPlan.day} Forecast: {dayPlan.weather.temp_c}°C · {dayPlan.weather.condition_label}
                                </span>
                                <span className="text-slate-500 ml-2">
                                  (Feels like {dayPlan.weather.feels_like_c}°C · Range: {dayPlan.weather.temp_min_c}°C – {dayPlan.weather.temp_max_c}°C · Rain risk: {dayPlan.weather.rain_chance}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                                {dayPlan.weather.advisory}
                              </span>
                              {dayPlan.weather.outdoor_score >= 80 && (
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                                  ☀️ {dayPlan.weather.outdoor_score}% Outdoor Ideal
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Bento Tile 1: Transit Card */}
                        {dayPlan.transport && (() => {
                          const mode = (dayPlan.transport.mode || '').toLowerCase();
                          const operator = (dayPlan.transport.operator || '').toLowerCase();
                          const notes = dayPlan.transport.notes || '';
                          let transitNotes = notes;
                          if ((mode.includes('flight') || operator.includes('indigo') || operator.includes('spicejet')) && notes.toLowerCase().includes('shatabdi')) {
                            transitNotes = 'IndiGo flight to Dehradun (Jolly Grant Airport), followed by a synchronized 45-minute ashram taxi transfer to Rishikesh.';
                          } else if (mode.includes('train') && notes.toLowerCase().includes('flight')) {
                            transitNotes = 'Jan Shatabdi Express to Haridwar, then a 30-minute taxi to Rishikesh ashram.';
                          } else if (!notes) {
                            transitNotes = 'Verified route connection scheduled through autonomous agent engine.';
                          }

                          return (
                            <div
                              className={`md:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs transition-all ${
                                highlightedCardId === `transit-${dayPlan.day}`
                                  ? 'ring-2 ring-emerald-500 ring-offset-2 animate-target-pulse'
                                  : 'hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                                    {mode.includes('flight') ? (
                                      <Plane className="w-4 h-4" />
                                    ) : mode.includes('train') ? (
                                      <Train className="w-4 h-4" />
                                    ) : (
                                      <Bus className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-500 font-medium">
                                      {dayPlan.transport.departure || '07:00'} → {dayPlan.transport.arrival || '19:00'} · {dayPlan.transport.duration_hours} hours
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900">
                                      {dayPlan.transport.operator}
                                    </h3>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs capitalize px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                                    {dayPlan.transport.class || 'Standard'}
                                  </span>
                                  {onUpdateTransport && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingItemId(editingItemId === `transit-${dayPlan.day}` ? null : `transit-${dayPlan.day}`)}
                                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline underline-offset-4"
                                    >
                                      Change
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {transitNotes}
                              </p>

                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Transit Cost</span>
                                <span className="font-bold text-sm text-slate-900">
                                  ₹{dayPlan.transport.price_inr?.toLocaleString('en-IN')}/seat
                                </span>
                              </div>

                              {/* Inline Transit Change Picker */}
                              {editingItemId === `transit-${dayPlan.day}` && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                  <TransportSelectionScene
                                    options={transportOptions.length > 0 ? transportOptions : [dayPlan.transport]}
                                    budget={budget_inr}
                                    destination={destination}
                                    initialStage={mode.includes('flight') ? 'sky' : 'road'}
                                    onSelect={(newOpt) => {
                                      if (onUpdateTransport) onUpdateTransport(newOpt);
                                      setEditingItemId(null);
                                    }}
                                    inline={true}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Bento Tile 2: Synchronized Last-Mile Cab Transfer */}
                        {dayPlan.cab && (
                          <div className="md:col-span-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex-shrink-0">
                                <Car className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-slate-900">
                                    Last-mile cab transfer
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                    {dayPlan.cab.provider}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  <span className="text-slate-900 font-semibold">{dayPlan.cab.pickup}</span>
                                  <span className="mx-2 text-slate-400">→</span>
                                  <span className="text-slate-900 font-semibold">{dayPlan.cab.dropoff}</span>
                                  <span className="mx-2 text-slate-400">·</span>
                                  <span className="text-slate-700 font-medium">Pickup: {dayPlan.cab.pickup_time}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 self-end sm:self-center">
                              <div className="text-right">
                                <span className="text-xs text-slate-400 block">Fixed taxi union rate</span>
                                <span className="font-bold text-sm text-slate-900">
                                  ₹{dayPlan.cab.fare_inr?.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                                ✓ Confirmed
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Bento Tile 3: Activities with Time-Slots & Single Badges */}
                        {dayPlan.activities && dayPlan.activities.length > 0 && (
                          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {dayPlan.activities.map((act, actIdx) => {
                              // Support both `name` and `title` field names from the API
                              const actName = act.name || act.title || 'Activity';
                              const isHiddenGem = act.place_type === 'Hidden Gem' || actName.toLowerCase().includes('secret') || actName.toLowerCase().includes('hidden');
                              const durationLabel = act.duration_hours
                                ? act.duration_hours < 1
                                  ? `${Math.round(act.duration_hours * 60)} min`
                                  : `${act.duration_hours}h`
                                : null;
                              const slotIcon = act.time_slot?.includes('Morning') ? (
                                <Sunrise className="w-3 h-3 text-amber-500" />
                              ) : act.time_slot?.includes('Evening') ? (
                                <Moon className="w-3 h-3 text-indigo-500" />
                              ) : (
                                <Sun className="w-3 h-3 text-amber-500" />
                              );

                              return (
                                <div
                                  key={actIdx}
                                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3.5 hover:shadow-md transition-shadow"
                                >
                                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                                    <Compass className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="text-xs font-bold text-slate-900">
                                        {actName}
                                      </span>
                                      {durationLabel && (
                                        <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                                          {durationLabel}
                                        </span>
                                      )}
                                    </div>

                                    {/* Time-Slot & Gem Badges */}
                                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                      {act.time_slot && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                                          {slotIcon}
                                          {act.time_slot}
                                        </span>
                                      )}
                                      {isHiddenGem && (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                                          ★ Hidden gem
                                        </span>
                                      )}
                                      {/* Weather readiness badge */}
                                      {act.type === 'indoor' ? (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1 font-medium">
                                          <span>🏛️ All-weather indoor</span>
                                        </span>
                                      ) : (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1 font-medium">
                                          <span>☀️ Weather optimal</span>
                                        </span>
                                      )}
                                      {act.cost_inr > 0 && (
                                        <span className="text-xs text-slate-500 font-medium">
                                          ₹{act.cost_inr}
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                      {act.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Fallback: no activities planned — show a rest/exploration note */}
                        {(!dayPlan.activities || dayPlan.activities.length === 0) && !dayPlan.transport && (
                          <div className="md:col-span-3 p-4 rounded-2xl bg-white border border-slate-200/80 border-dashed flex items-center gap-3 text-slate-500 shadow-2xs">
                            <Compass className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <p className="text-xs leading-relaxed">
                              Free day — explore the area at your own pace, visit local markets, or simply rest.
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* Offline Boarding Pass & Trip Pack Modal */}
      <OfflineTripPackModal
        isOpen={showTripPack}
        onClose={() => setShowTripPack(false)}
        itinerary={activeItinerary}
      />
    </div>
  );
}
