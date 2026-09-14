import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { planTrip, bookTrip } from '../services/api';
import TransportSelectionScene from '../components/TransportSelectionScene';
import StaySelectionScene from '../components/StaySelectionScene';
import VoiceInputButton from '../components/VoiceInputButton';
import {
  Compass,
  Sparkles,
  Search,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Bot,
  Brain,
  CheckCircle2,
  Lock,
  Flame,
  Sun,
  Wifi,
  ChevronDown,
  ChevronUp,
  Mountain,
  Wind,
  Check,
  X,
  Clock,
  MapPin,
  Calendar,
  Layers,
  Send,
} from 'lucide-react';

const SPITI_DEFAULT_DAY_PLANS = [
  {
    day: 1,
    title: 'Scenic Mountain Approach & Bhuntar Ascent',
    elevation: '1,089m ASL',
    theme: 'Low-impact transit & valley pacing',
    morning: 'Early arrival at Bhuntar airstrip. Transfer into private 4x4 expedition vehicle.',
    afternoon: 'Drive along the Parvati & Beas confluence. Rest stop at organic apple orchards.',
    evening: 'Acclimatization briefing and overnight stay at riverside valley lodge in Bhuntar.',
    stay_name: 'Riverstone Orchard Lodge',
  },
  {
    day: 2,
    title: 'Kunzum Pass Crossing & High-Desert Descent to Kaza',
    elevation: '3,800m ASL',
    theme: 'Kunzum Crest (4,551m) crossing with altitude rest stops',
    morning: '05:30 AM departure via Rohtang & Kunzum Pass to bypass afternoon crosswinds.',
    afternoon: 'Stop at Kunzum Mata Temple (4,551m) for customary mountain blessing.',
    evening: 'Check-in to Tenzin\'s Mountain Homestay in Kaza. Bukhari stove warm-up.',
    stay_name: 'Tenzin\'s Mountain Homestay',
  },
  {
    day: 3,
    title: 'Acclimatization Day: Kye Monastery & Kibber High Plateau',
    elevation: '4,205m ASL',
    theme: 'Gentle walking, hydration, and 1,000-year monastic culture',
    morning: 'Slow morning herbal tea. Visit 11th-century Kye Gompa atop the hill.',
    afternoon: 'Drive to Kibber village; short scenic walk to view snow-capped mountain ridges.',
    evening: 'Organic tsampa and butter tea with host Tenzin and village elder storytelling.',
    stay_name: 'Tenzin\'s Mountain Homestay',
  },
  {
    day: 4,
    title: 'Langza Fossil Fields & Highest Post Office at Hikkim',
    elevation: '4,400m ASL',
    theme: 'Prehistoric marine fossils & post office letter dispatch',
    morning: 'Gentle trek across Langza beneath the giant golden Buddha statue.',
    afternoon: 'Send handwritten postcards from Hikkim (world\'s highest post office, 4,440m).',
    evening: 'Stargazing under Bortle-1 dark skies; Milky Way observation from terrace.',
    stay_name: 'Tenzin\'s Mountain Homestay',
  },
  {
    day: 5,
    title: 'Pin Valley National Park & Return Transit Descent',
    elevation: '2,800m ASL',
    theme: 'Safe descent pacing towards valley return',
    morning: 'Explore Pin Valley crimson hills and Kungri Monastery.',
    afternoon: 'Commence comfortable return transit down towards valley highway.',
    evening: 'Farewell mountain dinner and transfer connection dispatch.',
    stay_name: 'Valley Transit Rest',
  },
];

export default function FlightDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, updateTrip } = useTrip();
  const { user } = useAuth();
  const { memory, openDrawer } = useMemory();

  // Prompt input state
  const [promptInput, setPromptInput] = useState(
    location.state?.prompt || tripData.prompt || '5 days in Spiti Valley on ₹30,000'
  );

  // Flight Deck execution state
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSelectingTransport, setIsSelectingTransport] = useState(false);
  const [isSelectingStay, setIsSelectingStay] = useState(false);
  const [transportOptions, setTransportOptions] = useState(tripData.transportOptions || []);
  const [stayOptions, setStayOptions] = useState(tripData.stayOptions || []);
  const [pendingResult, setPendingResult] = useState(null);

  // HITL Approval Gate state
  const [hitlStatus, setHitlStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [cost, setCost] = useState(
    tripData.itinerary?.cost_breakdown?.total || 30000
  );

  // Weather fluctuation alert state
  const [weatherAlertActive, setWeatherAlertActive] = useState(true);
  const [isRerouteAnimating, setIsRerouteAnimating] = useState(false);

  // Booking CTA state
  const [isReserving, setIsReserving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Expanded daily breakdown
  const [showDaysBreakdown, setShowDaysBreakdown] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);

  const transportResolver = useRef(null);
  const stayResolver = useRef(null);

  // Auto-run if navigated with autoRun flag
  useEffect(() => {
    if (location.state?.autoRun && promptInput) {
      handleStartSynthesis(promptInput);
    }
  }, []);

  // Sync cost if tripData changes
  useEffect(() => {
    if (tripData.itinerary?.cost_breakdown?.total) {
      setCost(tripData.itinerary.cost_breakdown.total + (hitlStatus === 'approved' ? 450 : 0));
    }
  }, [tripData.itinerary]);

  // HITL Gate handlers
  const handleApproveGate = () => {
    setHitlStatus('approved');
    setCost((prev) => prev + 450);
  };

  const handleRejectGate = () => {
    setHitlStatus('rejected');
  };

  // Simulate Wind Shift
  const handleSimulateWindShift = () => {
    setIsRerouteAnimating(true);
    setWeatherAlertActive(true);
    setTimeout(() => {
      setIsRerouteAnimating(false);
    }, 1200);
  };

  // Confirm Plan & Reserve
  const handleLockAndReserve = async () => {
    setIsReserving(true);
    try {
      if (tripData.itinerary) {
        const result = await bookTrip(tripData.itinerary);
        updateTrip({ booking: result.booking });
      } else {
        // Fallback default booking record
        updateTrip({
          booking: {
            id: `WANDR-SPITI-${Math.floor(100000 + Math.random() * 900000)}`,
            destination: 'Spiti Valley, Himachal Pradesh',
            total_cost: cost,
            host_name: 'Tenzin Dorje',
            status: 'confirmed',
            created_at: new Date().toISOString(),
          },
        });
      }
      setTimeout(() => {
        setIsReserving(false);
        setIsConfirmed(true);
        setTimeout(() => {
          navigate('/confirmation');
        }, 800);
      }, 1000);
    } catch (err) {
      console.error('Reservation error:', err);
      // Fallback transition
      setIsConfirmed(true);
      setTimeout(() => navigate('/confirmation'), 800);
    }
  };

  // Primary Agent Pipeline Execution for Custom Prompts
  const handleStartSynthesis = async (queryToRun) => {
    const targetPrompt = queryToRun || promptInput;
    if (!targetPrompt || targetPrompt.trim().length < 4) return;

    setIsStreaming(true);
    setHitlStatus('pending');

    try {
      const planPromise = planTrip(targetPrompt, memory);
      await new Promise((r) => setTimeout(r, 600));

      const result = await planPromise;
      if (!result.success) throw new Error(result.error || 'Failed to synthesize journey');

      setPendingResult(result);
      const outOpts = result.transport_options?.outbound || [result.itinerary?.selected_transport_outbound].filter(Boolean);
      setTransportOptions(outOpts);
      setStayOptions(result.stay_options || []);

      if (outOpts.length > 1) {
        setIsSelectingTransport(true);
        const userChoice = await new Promise((resolve) => {
          transportResolver.current = resolve;
        });
        setIsSelectingTransport(false);

        if (userChoice && result.itinerary) {
          result.itinerary.selected_transport_outbound = userChoice;
        }
      }

      if (result.stay_options && result.stay_options.length > 1) {
        setIsSelectingStay(true);
        const userStayChoice = await new Promise((resolve) => {
          stayResolver.current = resolve;
        });
        setIsSelectingStay(false);

        if (userStayChoice && result.itinerary) {
          result.itinerary.selected_stay = userStayChoice;
        }
      }

      updateTrip({
        prompt: targetPrompt,
        itinerary: result.itinerary,
        constraints: result.constraints,
        steps: result.steps,
        transportOptions: outOpts,
        stayOptions: result.stay_options || [],
      });

      if (result.itinerary?.cost_breakdown?.total) {
        setCost(result.itinerary.cost_breakdown.total);
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const dayPlans = tripData.itinerary?.day_plans?.length
    ? tripData.itinerary.day_plans
    : SPITI_DEFAULT_DAY_PLANS;

  const currentDestination = tripData.itinerary?.destination || 'Spiti Valley';

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-body text-[#131B2E] antialiased selection:bg-[#C26D38] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. FIXED TOP HEADER WITH ALPINE EDITORIAL DAYLIGHT BRANDING               */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8FF]/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
        <div className="h-16 w-full px-4 sm:px-6 max-w-[1536px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Elevation Pill */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#C26D38] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-xs group-hover:scale-105 transition-transform">
                W
              </div>
              <span className="font-display font-semibold text-lg tracking-tight text-[#131B2E] uppercase">
                Wandr<span className="text-[#C26D38]">.</span>
              </span>
            </Link>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#F2F3FF] rounded-lg border border-slate-200/60 text-[11px] font-semibold text-[#4F5D72]">
              <Mountain className="w-3.5 h-3.5 text-[#006C4A]" />
              <span className="font-mono uppercase tracking-wider text-[#006C4A]">
                3,800M // ELEVATION CHECKED
              </span>
            </div>
          </div>

          {/* Subordinate Trip Context / Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F2F3FF] border border-slate-200/70 text-xs font-['Geist'] shadow-2xs">
            <span className="font-bold text-[#131B2E]">Flight Deck</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#4F5D72] font-medium">{currentDestination}</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider text-[#006C4A] bg-[#006C4A]/10">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006C4A] animate-pulse" />
              Sub-Agents Active
            </span>
          </div>

          {/* Quick Command Prompt & Profile */}
          <div className="flex items-center gap-3">
            {/* Search HUD Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartSynthesis(promptInput);
              }}
              className="hidden md:flex items-center relative w-56 lg:w-72"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Plan custom expedition..."
                className="w-full pl-8 pr-16 py-1.5 rounded-lg bg-[#F2F3FF] border border-slate-200/80 text-xs text-[#131B2E] placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#C26D38] focus:ring-1 focus:ring-[#C26D38]/30 transition-all"
              />
              <button
                type="submit"
                disabled={isStreaming}
                className="absolute right-1 px-2 py-1 rounded bg-[#131B2E] hover:bg-slate-800 disabled:opacity-50 text-white text-[10px] font-semibold cursor-pointer"
              >
                {isStreaming ? '...' : 'Plan'}
              </button>
            </form>

            {/* Memory Trigger */}
            <button
              type="button"
              onClick={openDrawer}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              title="Traveler Preferences & Routine"
            >
              <Brain className="w-3.5 h-3.5 text-[#C26D38]" />
              <span className="hidden xl:inline text-slate-600 font-medium">Routine:</span>
              <span>{memory.wakeUpTime || '08:00 AM'}</span>
            </button>

            {/* Traveler Profile */}
            <div className="flex items-center gap-2.5 pl-1 border-l border-slate-200">
              <div className="hidden sm:flex flex-col items-end leading-none">
                <span className="text-xs font-semibold text-[#131B2E]">{user?.name || 'Traveler'}</span>
                <span className="text-[10px] text-[#4F5D72] mt-0.5">{user?.role || 'Traveler Member'}</span>
              </div>
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                src={user?.avatar || "https://lh3.googleusercontent.com/aida/AEtjO1WerT8lUZCOLCdFAKOffWluasbaFDnLQAZwE36wzJwUniePrctZI2sREgvJhh0OGBC_SrIE3M2KyKYyWgrlq2uISr7kDuriCM1IA0GrNbElixkblrwMmcZjd8IrPzibvbyW2q9cp_87AHQFvi3JNAM4jvJWoouM1zegGKSweG8M7qK9xfDtD6ZmIPGYoOvLkp1WszmUwTxfHhAqE95tkhwERbOW0I1TiZO0VxFUvw-eTS6_AGF-3yw0ylU"}
              />
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN COCKPIT VIEWPORT                                                  */}
      {/* ========================================================================= */}
      <main className="w-full pt-20 pb-28 bg-[#FAF8FF] min-h-[calc(100vh-5rem)]">
        <div className="w-full px-4 sm:px-6 flex flex-col gap-6 max-w-[1536px] mx-auto">
          
          {/* ─── TOP TELEMETRY REASSURANCE MICROBAR ───────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F2F3FF] px-4 py-2 rounded-xl shadow-xs border border-slate-200/60">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006C4A] animate-ping" />
                <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#006C4A]">
                  Trip Status: Active Planning
                </span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-xs text-[#4F5D72] font-mono">
                LAT: 32.2276° N, LON: 78.0710° E
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="text-xs text-[#4F5D72] font-medium">
                ELEVATION: 3,800m ASL (Thoughtfully Paced for Altitude Safety)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-white text-[#131B2E] px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                Live Trip Assistant
              </span>
              <span className="text-xs font-semibold bg-[#C26D38] text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                Mission Live
              </span>
            </div>
          </div>

          {/* ─── MAIN SPLIT-SCREEN COCKPIT LAYOUT ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ======================================================================= */}
            {/* LEFT COLUMN: 5 COLS (lg:col-span-5) AGENT STREAM & DECISION GATE        */}
            {/* ======================================================================= */}
            <div className="lg:col-span-5 flex flex-col gap-5 w-full">
              
              {/* Stream Status Header */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFDBC9] text-[#914714] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h2 className="font-display font-bold text-base text-[#131B2E]">
                      Trip Planning Progress
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#006C4A] font-semibold text-xs flex items-center gap-1.5 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006C4A] animate-pulse" />
                    ACTIVE STREAM
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#4F5D72] text-xs bg-[#F2F3FF] px-3 py-2 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#006C4A]" />
                    <span>Live Trip Assistant Active</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#4F5D72]">
                    <span className="font-semibold text-emerald-700">Altitude Safe</span>
                    <span>•</span>
                    <span>100% Direct Escrow</span>
                  </div>
                </div>
              </div>

              {/* 5 Agent Nodes Stack */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-[11px] font-bold uppercase text-[#4F5D72] tracking-wider font-mono">
                    Sub-Agent Orchestration Chain
                  </span>
                  <span className="text-xs font-bold text-[#006C4A] bg-[#E6F7F0] px-2 py-0.5 rounded-full">
                    4/5 Dispatched
                  </span>
                </div>

                {/* Node 01 */}
                <div className="p-3 rounded-xl bg-[#F2F3FF] hover:bg-slate-100 transition-colors flex items-center justify-between border border-slate-200/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#E6F7F0] text-[#006C4A] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      01
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#131B2E] truncate">
                        Parsing Travel Constraints
                      </span>
                      <span className="text-[11px] text-[#4F5D72]">
                        Max budget ₹30,000 • 5 Days window
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#E6F7F0] text-[#006C4A] text-[11px] font-bold">
                      Done
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">14ms</span>
                  </div>
                </div>

                {/* Node 02 */}
                <div className="p-3 rounded-xl bg-[#F2F3FF] hover:bg-slate-100 transition-colors flex items-center justify-between border border-slate-200/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#E6F7F0] text-[#006C4A] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      02
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#131B2E] truncate">
                        Evaluating Routes & Air Corridor
                      </span>
                      <span className="text-[11px] text-[#4F5D72]">
                        DEL ➔ KUU (Bhuntar) via Scenic Mountain Transit
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#E6F7F0] text-[#006C4A] text-[11px] font-bold">
                      Done
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">82ms</span>
                  </div>
                </div>

                {/* Node 03 */}
                <div className="p-3 rounded-xl bg-[#F2F3FF] hover:bg-slate-100 transition-colors flex items-center justify-between border border-slate-200/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#E6F7F0] text-[#006C4A] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      03
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#131B2E] truncate">
                        Curating Homestays (Local Priority)
                      </span>
                      <span className="text-[11px] text-[#4F5D72]">
                        Authentic mud-brick insulated units • Direct host escrow
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#E6F7F0] text-[#006C4A] text-[11px] font-bold">
                      Done
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">120ms</span>
                  </div>
                </div>

                {/* Node 04 (Active) */}
                <div className="p-3 rounded-xl bg-[#FFF8F5] border-l-4 border-[#C26D38] border-y border-r border-slate-200/60 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#C26D38] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 animate-pulse">
                      04
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#C26D38] truncate">
                        High-Altitude Acclimatization Safeguard
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Rest day enforcement @ 3,800m ASL
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#FFDBC9] text-[#763300] text-[11px] font-bold animate-pulse">
                      Active
                    </span>
                    <span className="text-[11px] text-[#C26D38] font-mono">98ms</span>
                  </div>
                </div>

                {/* Node 05 (Pending Approval Gate) */}
                <div className="p-3 rounded-xl bg-[#F2F3FF] opacity-95 flex items-center justify-between border border-slate-200/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-300 text-slate-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      05
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#131B2E] truncate">
                        Cost Balancing & Autonomous Trim
                      </span>
                      <span className="text-[11px] text-[#4F5D72]">
                        100% direct payouts to hosts & drivers
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-bold">
                      {hitlStatus === 'pending' ? 'Gate Held' : 'Calibrated'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Human-in-the-Loop Approval Gate Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#C26D38]">
                    <ShieldCheck className="w-5 h-5 text-[#C26D38]" />
                    <h2 className="font-display font-bold text-base text-[#131B2E]">
                      Human-in-the-Loop Gate
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFDBC9] text-[#763300] text-[11px] font-bold font-mono uppercase">
                    Recommendation
                  </span>
                </div>

                <p className="text-xs text-[#4F5D72] bg-[#F2F3FF] p-3 rounded-xl leading-relaxed border border-slate-200/60">
                  Agent proposes switching <span className="font-bold text-[#131B2E]">Day 2 transit</span> to early morning (05:30 IST) to avoid forecasted afternoon <span className="text-[#C26D38] font-bold">Kunzum Pass crosswinds (&gt;35 kts)</span>. Delta: <span className="font-bold text-[#131B2E]">+₹450</span> (driver layover fee).
                </p>

                {hitlStatus === 'pending' ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleApproveGate}
                      className="py-2.5 px-3 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Early Departure</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectGate}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#131B2E] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                      <span>Reject (Keep Original)</span>
                    </button>
                  </div>
                ) : (
                  <div className={`p-3 rounded-xl text-xs font-semibold text-center border ${
                    hitlStatus === 'approved'
                      ? 'bg-[#E6F7F0] text-[#006C4A] border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {hitlStatus === 'approved'
                      ? 'Approved: Early departure logged. Schedule revised to 05:30 IST. +₹450 added.'
                      : 'Rejected: Keeping original 10:00 AM transit. Driver alerted for high wind risk.'}
                  </div>
                )}
              </div>

              {/* Realtime Terminal Reasoning Stream Block */}
              <div className="bg-[#131B2E] text-slate-100 p-5 rounded-2xl shadow-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-slate-300 pb-1 border-b border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-emerald-400">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Live Expedition Decision Stream</span>
                  </div>
                  <span className="text-[11px] text-slate-400">stream://spiti.local.node</span>
                </div>

                <div className="bg-[#0B1120] p-3.5 rounded-xl font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto space-y-2 text-slate-300 select-all border border-slate-800">
                  <div className="text-emerald-400">[08:44:11.204Z] expedition.init: Traveler constraints verified. Target altitude ceiling 3,800m ASL.</div>
                  <div className="text-slate-400">[08:44:11.218Z] node_01: Parsed budget limits: ₹30,000 target envelope, 5 days window.</div>
                  <div className="text-emerald-400">[08:44:11.300Z] node_02: Queried Bhuntar ATR-72 fleet & 4x4 mountain transit options. Road status clear.</div>
                  <div className="text-amber-300">[08:44:11.420Z] node_03: Retrieved 8 verified Spitian homestays in Kaza/Langza. Direct local host escrow: 100%.</div>
                  <div className="text-emerald-400">[08:44:11.518Z] node_04: Altitude pacing verified. Safe comfort margin with 24h Kaza acclimatization.</div>
                  <div className="text-[#FFDBC9] animate-pulse">
                    &gt;&gt; {"{"}"action": "GATE_REQUEST", "reason": "Kunzum pass 35kt wind vector", "delta_inr": 450, "safety_score_gain": 0.28{"}"}
                  </div>
                </div>
              </div>

            </div>

            {/* ======================================================================= */}
            {/* RIGHT COLUMN: 7 COLS (lg:col-span-7) INTERACTIVE CANVAS & MAP          */}
            {/* ======================================================================= */}
            <div className="lg:col-span-7 flex flex-col gap-5 w-full">
              
              {/* Ambient Weather Atmosphere Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#FFDBC9]/30 blur-3xl pointer-events-none" />
                
                <div className="flex flex-col gap-1 z-10">
                  <div className="flex items-center gap-1.5 text-[#C26D38]">
                    <Mountain className="w-4 h-4 text-[#C26D38]" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#C26D38]">
                      {currentDestination} Mountain Weather
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display font-black text-4xl text-[#131B2E] tracking-tight">
                      11°C
                    </span>
                    <span className="font-display font-semibold text-lg text-[#4F5D72]">
                      Cold Alpine Desert
                    </span>
                  </div>
                  <span className="text-xs text-[#4F5D72] mt-0.5">
                    Barometric 512mm Hg • Wind: 14 kts NNE • Dewpoint -4°C
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 z-10">
                  <div className="flex flex-col bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-1 text-[#C26D38] mb-1">
                      <Sun className="w-3.5 h-3.5 text-[#C26D38]" />
                      <span className="text-[10px] font-mono font-bold uppercase">UV INDEX</span>
                    </div>
                    <span className="font-display text-lg font-bold text-[#131B2E]">8.2</span>
                    <span className="text-[10px] text-rose-600 font-bold uppercase">Extreme Caution</span>
                  </div>
                  <div className="flex flex-col bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center gap-1 text-[#006C4A] mb-1">
                      <Clock className="w-3.5 h-3.5 text-[#006C4A]" />
                      <span className="text-[10px] font-mono font-bold uppercase">SAFE WINDOW</span>
                    </div>
                    <span className="font-display text-lg font-bold text-[#131B2E]">06:00 – 16:30</span>
                    <span className="text-[10px] text-[#006C4A] font-bold">Daylight Transit</span>
                  </div>
                </div>
              </div>

              {/* Inline Disruption Diff Alert Bar */}
              {weatherAlertActive && (
                <div className={`p-4 rounded-2xl flex items-start gap-4 border transition-all ${
                  isRerouteAnimating
                    ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'bg-amber-50/90 border-amber-200 shadow-xs'
                }`}>
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[#131B2E]">
                        Simulated Weather Fluctuation Detected
                      </span>
                      <span className="font-mono text-[10px] font-bold bg-[#C26D38] text-white px-2 py-0.5 rounded">
                        T-MINUS 18H
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      24-knot sustained crosswinds recorded at Rohtang Crest & Kunzum Pass. Autonomous rebalancing engine rerouted Day 2 departure to 05:30 to preserve road adhesion.
                    </p>
                  </div>
                </div>
              )}

              {/* Live Multi-Modal Topology Map Preview with Elevation Profile */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="p-4 flex items-center justify-between bg-[#F2F3FF] border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-[#006C4A]" />
                    <span className="font-display font-bold text-sm text-[#131B2E]">
                      Multi-Modal Topology & Elevation Gradient
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#4F5D72] bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                    386 KM TRANSIT
                  </span>
                </div>

                {/* Topology Location Map Visual */}
                <div
                  className="w-full h-56 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCUzVp5vFmJOWtEA8BWmiatTpZ90y4E0sI2Fy4LT_KQdP3vjMc9wKN7NEUGQXKIypZ5A83ON_lScFlWGPYFwsYXNNlRK3GUOW-MVbLowcmvHHtLA-AXyh_VNHVKIlKrQGU88_EvyTSZMQtdcUgHK0xxVmzYDgiCCLiMXvoEUxycOU33eeWvKBipj_Kykbj5JKGldt86H8xC1SIYnDWVjyY18idj0FDRfB_zv93kQbQYqq9TGegP8jspvA')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131B2E]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        Active Sector View
                      </span>
                      <p className="font-display text-xl font-bold text-white drop-shadow-sm">
                        Spiti High-Altitude Corridor
                      </p>
                    </div>
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[#131B2E] font-mono text-[11px] font-bold shadow">
                      HIGH-DEFINITION ROUTE VIEW
                    </div>
                  </div>
                </div>

                {/* Elevation Sparkline / Gradient Diagram */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[#4F5D72] font-mono text-xs">
                    <span className="font-bold">WAYPOINT ELEVATION PROFILE</span>
                    <span className="text-[#C26D38] font-bold">+3,584M ASCENT CLIMB</span>
                  </div>

                  {/* Custom SVG Elevation Profile */}
                  <div className="w-full h-24 bg-[#F2F3FF] rounded-xl p-2 flex items-center border border-slate-200/60">
                    <svg className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 500 80">
                      <defs>
                        <linearGradient id="elevationGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#C26D38" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#C26D38" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,74 C80,72 140,68 180,60 C240,48 300,32 380,18 C430,8 470,5 500,4 L500,80 L0,80 Z"
                        fill="url(#elevationGrad)"
                      />
                      <path
                        d="M0,74 C80,72 140,68 180,60 C240,48 300,32 380,18 C430,8 470,5 500,4"
                        stroke="#C26D38"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                      <circle className="animate-pulse" cx="20" cy="74" fill="#C26D38" r="4.5" />
                      <circle cx="200" cy="56" fill="#C26D38" r="4.5" />
                      <circle cx="480" cy="5" fill="#006C4A" r="6" stroke="#ffffff" strokeWidth="2.5" />
                    </svg>
                  </div>

                  {/* Waypoint Stops Row */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="flex flex-col bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span className="font-mono text-[10px] font-bold text-[#131B2E]">DELHI (DEL)</span>
                      </div>
                      <span className="font-display font-bold text-base text-[#131B2E] mt-1">216 m</span>
                      <span className="text-[10px] text-[#4F5D72]">Flight Departure</span>
                    </div>

                    <div className="flex flex-col bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#C26D38]" />
                        <span className="font-mono text-[10px] font-bold text-[#131B2E]">BHUNTAR (KUU)</span>
                      </div>
                      <span className="font-display font-bold text-base text-[#131B2E] mt-1">1,089 m</span>
                      <span className="text-[10px] text-[#4F5D72]">4x4 Transfer Point</span>
                    </div>

                    <div className="flex flex-col bg-[#E6F7F0] p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#006C4A]" />
                        <span className="font-mono text-[10px] font-bold text-[#006C4A]">KAZA (SPITI)</span>
                      </div>
                      <span className="font-display font-bold text-base text-[#131B2E] mt-1">3,800 m</span>
                      <span className="text-[10px] text-[#006C4A] font-medium">Acclimatization Base</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Curated Homestay Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center gap-5">
                <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden shrink-0 relative">
                  <img
                    alt="Tenzin's Mountain Homestay"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI_x291erSDuN2T9-sh4VHycwAF0yCBckDv27TD6xjgsMIHZN8PVe3M1-JUXBVjQFuNDM0_R1JNryeIYasG_r6j28Mg5SVCAdW_U2GTa-MS3ZN9kyNojSrMe4qQpoPHycneRAtpfou2rq_JLp0s6p-Go10zOYIX0bHPDPu2an6nTWZjC97z-1YFTZmIi1KJuFkwjF2O4zqnxNhj_-oRj5Gd6AEMMivMxonhjatInaZcFZcmRzX-siBrQ"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium">
                    Verified Host
                  </div>
                </div>

                <div className="flex flex-col justify-between w-full h-full gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#006C4A] font-mono text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#006C4A]" />
                      Verified Spitian Host
                    </span>
                    <span className="font-display text-lg font-black text-[#C26D38]">
                      ₹800 <span className="text-xs text-[#4F5D72] font-normal">/ night</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-[#131B2E]">
                      Tenzin's Mountain Homestay
                    </h3>
                    <p className="text-xs text-[#4F5D72] line-clamp-2 mt-0.5 leading-relaxed">
                      Authentic solar-heated adobe house in Kaza Old Village. Traditional tandoor heating, organic barley tsampa breakfast, and direct local host support.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-1 text-[#4F5D72] text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      Solar Thermal
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Flame className="w-3.5 h-3.5 text-[#C26D38]" />
                      Bukhari Stove
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Wifi className="w-3.5 h-3.5 text-[#006C4A]" />
                      Starlink Backup
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Detailed Day-by-Day Journey Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col gap-4">
                <div
                  onClick={() => setShowDaysBreakdown(!showDaysBreakdown)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C26D38]" />
                    <span className="font-display font-bold text-sm text-[#131B2E]">
                      Complete Expedition Daily Breakdown ({dayPlans.length} Days)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#C26D38]">
                    <span>{showDaysBreakdown ? 'Hide Daily Plan' : 'View Daily Plan'}</span>
                    {showDaysBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {showDaysBreakdown && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {dayPlans.map((dp, idx) => {
                      const dayNum = dp.day || idx + 1;
                      const isExpanded = expandedDay === dayNum;
                      return (
                        <div
                          key={dayNum}
                          className="border border-slate-200/70 rounded-xl overflow-hidden bg-[#FAF8FF]"
                        >
                          <div
                            onClick={() => setExpandedDay(isExpanded ? null : dayNum)}
                            className="p-3 bg-[#F2F3FF] hover:bg-slate-100/80 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded bg-[#FFDBC9] text-[#763300] font-mono text-xs font-bold flex items-center justify-center">
                                D{dayNum}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-display font-bold text-xs text-[#131B2E]">
                                  {dp.title || `Day ${dayNum} Exploration`}
                                </span>
                                <span className="text-[10px] text-[#4F5D72]">
                                  {dp.elevation ? `Altitude: ${dp.elevation}` : 'Acclimatization Safe'}
                                </span>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                          </div>

                          {isExpanded && (
                            <div className="p-4 space-y-2.5 text-xs text-[#4F5D72] bg-white border-t border-slate-100">
                              {dp.theme && (
                                <p className="text-[11px] font-semibold text-[#C26D38]">
                                  Pacing Focus: {dp.theme}
                                </p>
                              )}
                              {dp.morning && (
                                <div>
                                  <span className="font-bold text-[#131B2E]">Morning: </span>
                                  <span>{dp.morning}</span>
                                </div>
                              )}
                              {dp.afternoon && (
                                <div>
                                  <span className="font-bold text-[#131B2E]">Afternoon: </span>
                                  <span>{dp.afternoon}</span>
                                </div>
                              )}
                              {dp.evening && (
                                <div>
                                  <span className="font-bold text-[#131B2E]">Evening: </span>
                                  <span>{dp.evening}</span>
                                </div>
                              )}
                              {dp.activities && dp.activities.length > 0 && (
                                <div className="pt-1">
                                  <span className="font-bold text-[#131B2E] block mb-1">Curated Experiences:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {dp.activities.map((act, actIdx) => (
                                      <span
                                        key={actIdx}
                                        className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium"
                                      >
                                        {act.name || act}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Interactive Transport Decision Scene Modal if Triggered */}
              {isSelectingTransport && (
                <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-[#C26D38]">
                  <h3 className="font-display font-bold text-base text-[#131B2E] mb-2">
                    Interactive Mountain Transit Confirmation
                  </h3>
                  <TransportSelectionScene
                    options={transportOptions}
                    budget={cost}
                    destination={currentDestination}
                    onSelect={(opt) => {
                      if (transportResolver.current) transportResolver.current(opt);
                    }}
                    onSkip={() => {
                      if (transportResolver.current) transportResolver.current(transportOptions[0]);
                    }}
                  />
                </div>
              )}

              {/* Interactive Stay Decision Scene Modal if Triggered */}
              {isSelectingStay && (
                <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-[#C26D38]">
                  <h3 className="font-display font-bold text-base text-[#131B2E] mb-2">
                    Interactive Homestay Confirmation
                  </h3>
                  <StaySelectionScene
                    options={stayOptions}
                    destination={currentDestination}
                    onSelect={(s) => {
                      if (stayResolver.current) stayResolver.current(s);
                    }}
                    onSkip={() => {
                      if (stayResolver.current) stayResolver.current(stayOptions[0]);
                    }}
                  />
                </div>
              )}

            </div>

          </div>

          {/* ─── BOTTOM FLOATING STICKY MISSION COMMAND BAR ────────────────────────── */}
          <div className="w-full sticky bottom-4 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-bold uppercase text-[#4F5D72] tracking-wider">
                  Total Estimated Expedition Cost
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-display text-2xl sm:text-3xl font-black text-[#131B2E] transition-all ${
                      isRerouteAnimating ? 'animate-pulse text-[#C26D38]' : ''
                    }`}
                  >
                    ₹{cost.toLocaleString('en-IN')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#E6F7F0] text-[#006C4A] text-xs font-bold border border-emerald-200">
                    Within ₹35k Budget
                  </span>
                </div>
              </div>

              <div className="hidden md:flex flex-col border-l border-slate-200 pl-6">
                <span className="font-mono text-[11px] font-bold uppercase text-[#4F5D72] tracking-wider">
                  Status: Ready
                </span>
                <span className="text-xs font-bold text-[#006C4A] flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006C4A]" />
                  Ready for Departure Dispatch
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSimulateWindShift}
                className="py-2.5 px-4 rounded-xl bg-[#F2F3FF] hover:bg-slate-200 text-[#131B2E] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-200/80 w-1/2 sm:w-auto cursor-pointer"
              >
                <Wind className="w-4 h-4 text-[#C26D38]" />
                <span>Simulate Wind Shift</span>
              </button>

              <button
                type="button"
                disabled={isReserving || isConfirmed}
                onClick={handleLockAndReserve}
                className={`py-2.5 px-6 rounded-xl text-white font-display text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 w-1/2 sm:w-auto cursor-pointer ${
                  isConfirmed
                    ? 'bg-[#006C4A]'
                    : 'bg-[#C26D38] hover:bg-[#A85A2A]'
                }`}
              >
                {isReserving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Securing Slots...</span>
                  </>
                ) : isConfirmed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Expedition Confirmed</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm Plan & Reserve</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#F2F3FF] py-6 border-t border-slate-200/80">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#4F5D72] text-xs">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-sm tracking-tight text-[#131B2E]">
              Wandr.
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-500">India travel planner</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] font-semibold uppercase">
            <Link to="/safety" className="hover:text-[#131B2E] transition-colors">
              Safety Guide
            </Link>
            <Link to="/provider" className="hover:text-[#131B2E] transition-colors">
              Host Support
            </Link>
            <span className="normal-case font-normal text-slate-400">
              © 2025 Wandr OS. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
