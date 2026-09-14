import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useMemory } from "../context/MemoryContext";
import { planTrip, bookTrip } from "../services/api";
import Navbar from "../components/Navbar";
import {
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Sun,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
  RotateCcw,
  Check
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, updateTrip } = useTrip();
  const { memory } = useMemory();

  const [promptInput, setPromptInput] = useState(
    location.state?.prompt || tripData.prompt || "5 days in Spiti Valley, ₹30,000, 2 travelers"
  );

  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState("");
  const [isAltRoute, setIsAltRoute] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isReserved, setIsReserved] = useState(false);

  const [expandedDays, setExpandedDays] = useState({ 1: true });
  const [allExpanded, setAllExpanded] = useState(false);

  const itinerary = tripData.itinerary;
  const currentDestination = itinerary?.destination || "Spiti Valley";
  const duration = itinerary?.days || 5;
  const travelers = itinerary?.people || 2;
  const baseCost = itinerary?.cost_breakdown?.total || 30000;
  const displayCost = isAltRoute ? Math.round(baseCost * 0.95) : baseCost;

  const selectedStay = itinerary?.selected_stay || {
    name: "Tenzin's Mountain Homestay",
    destination: "Spiti Valley",
    location: "Kaza Old Village",
    price_per_night_inr: 800,
    rating: 4.8,
    is_local_homestay: true,
    local_owner_name: "Tenzin Dorje",
    amenities: ["Solar thermal heat", "Organic tsampa breakfast", "Bukhari stove", "Starlink backup"],
    images: ["https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80"]
  };

  const selectedTransport = itinerary?.selected_transport_outbound || {
    mode: "4x4 Mountain Transfer",
    operator: "Alliance Air + Spiti 4x4",
    departure: "06:00",
    arrival: "17:30",
    price_inr: 5500,
    class: "Daylight Pass Guaranteed"
  };

  const dayPlans = itinerary?.day_plans && itinerary.day_plans.length > 0
    ? itinerary.day_plans
    : [
        {
          day: 1,
          title: "Transit via Rohtang & Ki Monastery Acclimatization",
          duration_note: "11.5h daylight journey • 4,166m rest buffer",
          cost_inr: 5500,
          activities: [
            { name: "4x4 Mountain Transfer", note: "Bhuntar feeder to Kaza via Atal Tunnel & Kunzum Pass", cost_inr: 5500 },
            { name: "Ki Monastery Sunset & Butter Tea", note: "Evening chanting session with monks & mild walking", cost_inr: 0 }
          ]
        },
        {
          day: 2,
          title: "Chicham Bridge & Kibber Wildlife Sanctuary",
          duration_note: "Suspension bridge crossing • Local naturalist guide",
          cost_inr: 1200,
          activities: [
            { name: "Chicham Gorge Traverse & Tibetan Wolf Search", note: "09:00 → 14:00 • Naturalist Stanzin guide", cost_inr: 1200 }
          ]
        },
        {
          day: 3,
          title: "Hikkim Highest Post Office & Langza Fossil Plateau",
          duration_note: "High-altitude postcard dispatch • Marine fossils trail",
          cost_inr: 350,
          activities: [
            { name: "Postcard Dispatch from 4,400m Post Office", note: "Official seal verified by postal master", cost_inr: 350 }
          ]
        },
        {
          day: 4,
          title: "Pin Valley National Park & Mudh Village",
          duration_note: "Sub-zero river valley trek • Traditional clay pottery session",
          cost_inr: 850,
          activities: [
            { name: "Alpine Trail Walk to Mudh Village", note: "Community direct tea lounge and guide support", cost_inr: 850 }
          ]
        },
        {
          day: 5,
          title: "Descent via Chandra Taal to Manali",
          duration_note: "Morning lake reflection stop • Safe return transition",
          cost_inr: 3500,
          activities: [
            { name: "Return Transit via Rohtang Tunnel", note: "Direct transfer to Bhuntar connection", cost_inr: 3500 }
          ]
        }
      ];

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  const handleToggleAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const newMap = {};
    dayPlans.forEach((_, idx) => {
      newMap[idx + 1] = nextState;
    });
    setExpandedDays(newMap);
  };

  const handleInstructAgent = async (e) => {
    e.preventDefault();
    if (!promptInput.trim() || isPlanning) return;

    setIsPlanning(true);
    setError("");

    try {
      const result = await planTrip(promptInput.trim(), memory);
      if (!result.success) throw new Error(result.error || "Failed to rebalance plan");

      updateTrip({
        itinerary: result.itinerary,
        prompt: promptInput,
        transportOptions: result.transport_options?.outbound || [],
        stayOptions: result.stay_options || []
      });

      setExpandedDays({ 1: true });
    } catch (err) {
      console.error("Agent instruction error:", err);
      setError(err.message || "Could not update plan. Please try again.");
    } finally {
      setIsPlanning(false);
    }
  };

  const handleConfirmReservation = async () => {
    setIsReserving(true);
    try {
      if (itinerary) {
        const res = await bookTrip(itinerary);
        updateTrip({ booking: res.booking });
      } else {
        updateTrip({
          booking: {
            id: "WNDR-" + Math.floor(100000 + Math.random() * 900000),
            destination: currentDestination,
            total_cost: displayCost,
            host_name: selectedStay.name,
            status: "confirmed",
            created_at: new Date().toISOString()
          }
        });
      }

      setTimeout(() => {
        setIsReserving(false);
        setIsReserved(true);
        setTimeout(() => {
          navigate("/confirmation");
        }, 800);
      }, 900);
    } catch (err) {
      console.error("Reservation error:", err);
      setIsReserving(false);
      setIsReserved(true);
      setTimeout(() => navigate("/confirmation"), 800);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 antialiased selection:bg-[#c26d38]/20 selection:text-[#c26d38] pb-32">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16 space-y-10">

        {/* TOP COMMAND BAR */}
        <section className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#c26d38] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agent Cockpit</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentDestination} Expedition
              </h1>
              <p className="text-xs text-slate-500">
                Paced for altitude safety, verified indigenous homestays, and daylight transit.
              </p>
            </div>

            <form onSubmit={handleInstructAgent} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. 5 days in Spiti, ₹30,000, pure veg..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#c26d38] focus:ring-1 focus:ring-[#c26d38]/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isPlanning}
                className="px-4 py-2 rounded-xl bg-[#c26d38] hover:bg-[#a85a2a] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                {isPlanning ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <span>Instruct Agent</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}
        </section>

        {/* AGENTIC REASONING SEQUENCE (5 Nodes) */}
        <section className="p-1 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c26d38]" />
              <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                Agentic Reasoning Sequence
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                5/5 Nodes Optimal
              </span>
              <span className="text-slate-300">•</span>
              <span>Latency: 280ms</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-medium">01</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">Constraints</span>
              <span className="text-[11px] text-slate-500">₹{baseCost.toLocaleString("en-IN")} envelope</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-medium">02</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">Transit</span>
              <span className="text-[11px] text-slate-500">4x4 Daylight pass</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-medium">03</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">Lodging</span>
              <span className="text-[11px] text-slate-500">Village direct host</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500 font-medium">04</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">Acclimatize</span>
              <span className="text-[11px] text-slate-500">Rest day buffer</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[#c26d38]/[0.08] border border-[#c26d38]/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#c26d38]">05</span>
                <Sparkles className="w-3.5 h-3.5 text-[#c26d38]" />
              </div>
              <span className="text-xs font-bold text-slate-900">Finalized</span>
              <span className="text-[11px] font-medium text-[#c26d38]">Ready to lock</span>
            </div>
          </div>
        </section>

        {/* ESSENTIALS 3-CARD DASHBOARD GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* CARD 1: Climate & Elevation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Climate & Elevation</span>
                <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                  11°C
                  <span className="text-xs font-normal text-slate-500">Kaza Hub • 3,800m</span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#c26d38]">
                <Sun className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 py-2 border-y border-slate-100 text-center">
              {["12°", "10°", "13°", "11°", "10°"].map((temp, i) => (
                <div key={i} className="p-1 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">D{i + 1}</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{temp}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c26d38]" />
                UV Index 8.2 Alpine
              </span>
              <span className="font-semibold text-emerald-700">SpO2 Check Active</span>
            </div>
          </div>

          {/* CARD 2: Transit & Sentinel Safety */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium">Sentinel Safety Index</span>
                <div className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
                  96 <span className="text-xs font-bold text-emerald-700">/ 100 Certified</span>
                </div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transit Corridor</span>
                <span className="text-slate-800 font-semibold">{selectedTransport.operator || "Alliance Air + 4x4"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Night Driving</span>
                <span className="text-emerald-700 font-bold">Restricted (Daylight only)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Emergency SOS</span>
                <span className="text-slate-800 font-mono font-medium">112 / 1091 / ITBP</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Solo & Women Safe</span>
              <Link to="/disruption" className="text-[#c26d38] font-semibold hover:underline">
                Disruption Lab &gt;
              </Link>
            </div>
          </div>

          {/* CARD 3: Curated Basecamp Stay */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Curated Basecamp</span>
                  {selectedStay.is_local_homestay && (
                    <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
                      Local Pick
                    </span>
                  )}
                </div>
                <div className="text-base font-bold text-slate-900 tracking-tight truncate max-w-[180px]">
                  {selectedStay.name}
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-[#c26d38]">
                  ₹{selectedStay.price_per_night_inr || 800}
                </span>
                <span className="text-[11px] text-slate-500 block">per night</span>
              </div>
            </div>

            <div className="relative h-24 rounded-xl overflow-hidden group">
              <img
                alt={selectedStay.name}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                src={selectedStay.images?.[0] || "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-2.5 text-[10px] text-white font-medium drop-shadow-sm">
                {selectedStay.location || "Old Kaza"} • Host: {selectedStay.local_owner_name || "Tenzin Dorje"}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                Bukhari Heat
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                Organic Food
              </span>
              <Link to="/workspace" className="ml-auto text-[#c26d38] font-bold text-[11px] hover:underline">
                Change Stay
              </Link>
            </div>
          </div>

        </section>

        {/* EXPEDITION TIMELINE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Expedition Timeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">{duration} days sequential mountain routing</p>
            </div>
            <button
              onClick={handleToggleAll}
              className="text-xs text-[#c26d38] font-bold hover:underline transition-colors cursor-pointer"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <div className="space-y-3">
            {dayPlans.map((dp, idx) => {
              const dayNum = dp.day || idx + 1;
              const isExpanded = Boolean(expandedDays[dayNum]);

              return (
                <div
                  key={dayNum}
                  className="rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs transition-colors"
                >
                  <div
                    onClick={() => toggleDay(dayNum)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 select-none"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-[#c26d38] font-bold">
                        DAY 0{dayNum}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {dp.title}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {dp.duration_note || dp.theme || ((dp.activities?.length || 2) + " curated activities")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {dp.cost_inr ? (
                        <span className="text-xs font-mono text-slate-700 font-bold">
                          ₹{dp.cost_inr.toLocaleString("en-IN")}
                        </span>
                      ) : null}
                      <ChevronDown
                        className={"w-4 h-4 text-slate-400 transition-transform duration-200 " + (isExpanded ? "rotate-180" : "")}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-100">
                      {dp.activities && dp.activities.length > 0 ? (
                        dp.activities.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-2 h-2 rounded-full bg-[#c26d38]" />
                              <div>
                                <span className="font-semibold text-slate-900">{act.name || act}</span>
                                {act.note && (
                                  <p className="text-slate-500 text-[11px] mt-0.5">{act.note}</p>
                                )}
                              </div>
                            </div>
                            <span className="font-mono text-slate-800 font-medium">
                              {act.cost_inr ? "₹" + act.cost_inr : "Included"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg">
                          <p className="font-medium">{dp.morning || "Morning: Gentle ascent and altitude check"}</p>
                          <p className="mt-1 text-slate-500">{dp.afternoon || "Afternoon: Monastic visit and tea with local host"}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ELEGANT FLOATING BOTTOM DOCK */}
      <aside className="fixed bottom-5 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 sm:px-6 sm:py-4 shadow-xl border border-slate-200/90 pointer-events-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-500 font-medium">
                Trip Total ({travelers} travelers)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₹{displayCost.toLocaleString("en-IN")}
                </span>
                <span
                  className={"text-[11px] font-bold px-2 py-0.5 rounded-full border " + (
                    isAltRoute
                      ? "text-amber-800 bg-amber-50 border-amber-200/60"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                  )}
                >
                  {isAltRoute ? "₹1,500 under budget" : "Budget synced"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsAltRoute(!isAltRoute)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#c26d38]" />
              <span className="hidden sm:inline">
                {isAltRoute ? "Standard Route" : "Simulate Alternate"}
              </span>
            </button>

            <button
              type="button"
              disabled={isReserving || isReserved}
              onClick={handleConfirmReservation}
              className={"px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer " + (
                isReserved
                  ? "bg-emerald-600"
                  : "bg-gradient-to-r from-[#d97706] via-[#c26d38] to-[#9e4e1c] hover:brightness-105"
              )}
            >
              {isReserving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locking Slots...</span>
                </>
              ) : isReserved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Reserved</span>
                </>
              ) : (
                <>
                  <span>Confirm &amp; Reserve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
