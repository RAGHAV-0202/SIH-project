import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import Navbar from '../components/Navbar';
import {
  AlertTriangle,
  Snowflake,
  Flame,
  Plane,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Bolt,
  RotateCcw,
  Check,
  X,
  Compass,
  Heart,
  TrendingDown,
  Car,
  Layers,
} from 'lucide-react';

const SCENARIOS = {
  1: {
    id: 1,
    vectorLabel: 'Vector 01',
    name: 'Kunzum Pass Landslide Closure',
    icon: AlertTriangle,
    iconColor: 'text-[#C26D38]',
    shortDesc: 'Severe scree collapse blocks NH-505 between Losar and Batal. 6-hour minimum delay at 4,590m.',
    leftTitle: 'Kunzum Pass Transit',
    leftPointBadge: 'Transit Blocked',
    leftDesc: 'Elevation 4,590m. Severe rockfall spanning 120m corridor. Border Roads Org advisory confirms route closed for minimum 6 to 14 hours.',
    leftAlert: 'Critical Altitude Exposure Risk',
    leftDestTitle: 'Kaza Homestay Settlement (3,800m)',
    leftDestDesc: 'Unreachable due to pass obstruction. Original reservation at Tenzin’s Kibber retreat.',
    satelliteCoords: 'Coordinates: 32.3995° N, 77.6322° E • Pass Impasse',
    rightStep1Title: 'Immediate Course Diversion',
    rightStep1Desc: 'Vector pivot before Gramphu junction onto safe all-weather tarmac.',
    rightPointTitle: 'Reroute via Kinnaur-Shimla Corridor',
    rightPointDesc: 'NH-5 Southern valley passage via Reckong Peo. Gentle gradient prevents altitude sickness spikes; road clear with active state patrol oversight.',
    rightMetric1: '-740m Max Pass Crest',
    rightMetric2: 'Auto-Dispatched 4x4 Driver',
    rightDestTitle: 'Dekyid Guesthouse Swap (Kalpa)',
    rightDestDesc: 'Autonomous credit swap executed with zero penalty. Heated solar suite with mountain view reserved.',
    latency: '340ms',
    cost: '±₹0',
    health: 'Safe',
    safety: '96 / 100',
    log: 'Vector 01: Kunzum Pass blocked by boulder fall (NH-505 Mile 42).',
  },
  2: {
    id: 2,
    vectorLabel: 'Vector 02',
    name: 'Alpine Blizzard & Whiteout',
    icon: Snowflake,
    iconColor: 'text-cyan-600',
    shortDesc: 'Sudden isobaric drop to -14°C over Kaza summit. Visibility reduced to 20m; sub-zero ridge exposure.',
    leftTitle: 'High-Ridge Exposed Traverse',
    leftPointBadge: 'Severe Freeze Alert',
    leftDesc: 'Wind chill plunge to -14°C at 4,200m crest. Sustained 55 knot gale gusts with zero visibility (<20m).',
    leftAlert: 'Hypothermia & Frostbite Hazard',
    leftDestTitle: 'High Plateau Camp (4,200m)',
    leftDestDesc: 'Unsafe for overnight stay. Tents risk structural failure under heavy snow pack.',
    satelliteCoords: 'Coordinates: 32.2276° N, 78.0710° E • Storm Front Active',
    rightStep1Title: 'Controlled Ridge Descent',
    rightStep1Desc: 'Descent to sheltered low valley baseline before evening blizzard peak.',
    rightPointTitle: 'Sheltered Valley Sanctuary Route',
    rightPointDesc: 'Protected riverbed highway through Sangla Valley pine belt. Zero crosswinds, heated transport cabins.',
    rightMetric1: '-1,200m Cold Inversion Drop',
    rightMetric2: 'Heated Cabin Fleet Dispatched',
    rightDestTitle: 'Bukhari Stone Lodge (Chitkul)',
    rightDestDesc: 'Instant accommodation upgrade with operational wood tandoor stove and satellite communications.',
    latency: '290ms',
    cost: '±₹0',
    health: 'Optimal',
    safety: '98 / 100',
    log: 'Vector 02: Blizzard warning issued for Spiti crest. Descending to sheltered pine valley.',
  },
  3: {
    id: 3,
    vectorLabel: 'Vector 03',
    name: 'Homestay Solar & Heat Failure',
    icon: Flame,
    iconColor: 'text-rose-600',
    shortDesc: "Tenzin's Kibber Homestay battery bank failure at -8°C. Hypothermia risk triggers alternate lodge switch.",
    leftTitle: 'Sub-Zero Stay Failure',
    leftPointBadge: 'Heating Offline',
    leftDesc: 'Kibber settlement solar thermal and backup wood stoves compromised. Room temperature dropping rapidly below 0°C.',
    leftAlert: 'Sub-Zero Exposure Without Thermal Heating',
    leftDestTitle: 'Tenzin’s Kibber Homestay (4,270m)',
    leftDestDesc: 'Uninhabitable overnight due to total heating outage at extreme altitude.',
    satelliteCoords: 'Coordinates: 32.3330° N, 78.0120° E • Village Grid Offline',
    rightStep1Title: 'Immediate Host Exchange Request',
    rightStep1Desc: 'Automated notification sent to local village homestay association guild.',
    rightPointTitle: 'Verified Heated Mud-Brick Suite',
    rightPointDesc: 'Reallocated to Champa’s Heritage Homestay in Langza (heated Bukhari, solar insulation intact, verified host).',
    rightMetric1: '100% Host Escrow Transferred',
    rightMetric2: 'Zero Extra Cost Charged',
    rightDestTitle: 'Champa’s Heritage Homestay (Langza)',
    rightDestDesc: 'Double-glazed traditional room with burning hearth and warm barley tsampa breakfast included.',
    latency: '180ms',
    cost: '±₹0',
    health: 'Safe',
    safety: '95 / 100',
    log: 'Vector 03: Stay failure at Kibber. Silently swapped to Langza Heritage Suite with zero surcharge.',
  },
  4: {
    id: 4,
    vectorLabel: 'Vector 04',
    name: 'Alliance Air Morning Fog Grounding',
    icon: Plane,
    iconColor: 'text-blue-600',
    shortDesc: 'Bhuntar Airport (KUU) dense valley fog halts ATR-72 departures. Requires instant overland fallback.',
    leftTitle: 'Bhuntar Airport Flight Grounded',
    leftPointBadge: 'Flight Canceled',
    leftDesc: 'Dense valley inversion fog at KUU airstrip. All scheduled morning departures grounded indefinitely.',
    leftAlert: 'Feeder Connection Broken',
    leftDestTitle: 'Kullu Feeder Flight Departure',
    leftDestDesc: 'Flight 9W-402 unable to land or take off due to mountain valley visibility <400m.',
    satelliteCoords: 'Coordinates: 31.8765° N, 77.1542° E • Runway Fog Stop',
    rightStep1Title: 'Overland Route Auto-Activation',
    rightStep1Desc: 'Instant reservation of private 4x4 Bolero and Vande Bharat executive chair car.',
    rightPointTitle: 'Scenic All-Weather Valley Route',
    rightPointDesc: 'Comfortable rail express to Chandigarh combined with private highway 4x4 transfer.',
    rightMetric1: 'On-Time Schedule Preserved',
    rightMetric2: 'Dedicated 4x4 Driver Confirmed',
    rightDestTitle: 'Chandigarh Executive Transit Rest',
    rightDestDesc: 'All airline voucher credits redirected with zero cancellation fee or customer penalty.',
    latency: '360ms',
    cost: '±₹0',
    health: 'Safe',
    safety: '97 / 100',
    log: 'Vector 04: Bhuntar flight grounded. Rerouted via luxury rail corridor and private 4x4.',
  },
};

export default function Disruption() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData, updateTrip } = useTrip();

  const [activeScenarioId, setActiveScenarioId] = useState(1);
  const [approvedState, setApprovedState] = useState(false);
  const [overriddenState, setOverriddenState] = useState(false);

  const scenario = SCENARIOS[activeScenarioId];

  const handleSelectScenario = (id) => {
    setActiveScenarioId(id);
    setApprovedState(false);
    setOverriddenState(false);
  };

  const handleApprove = () => {
    setApprovedState(true);
    setOverriddenState(false);
    updateTrip({
      disruption: {
        scenarioId: activeScenarioId,
        scenarioName: scenario.name,
        reroute: scenario.rightPointTitle,
        status: 'applied',
        resolvedAt: new Date().toISOString(),
      },
    });
  };

  const handleOverride = () => {
    setOverriddenState(true);
    setApprovedState(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-body text-[#131B2E] antialiased selection:bg-[#C26D38] selection:text-white">
      <Navbar />

      <main className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* ======================================================================= */}
        {/* HEADER SECTION                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-[#006C4A] font-mono text-[10px] font-bold uppercase border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#006C4A] animate-ping" />
                AUTONOMOUS SELF-HEALING ENGINE v4.2
              </span>
              <span className="font-mono text-[11px] text-[#4F5D72] uppercase">
                Telemetry Latency: &lt;380ms
              </span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#131B2E] tracking-tight">
              Himalayan Disruption Injection Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#4F5D72] mt-1 leading-relaxed">
              Test Wandr's autonomous contingency rerouting in real time. Inject extreme alpine disruptions and watch the multi-agent swarm rebalance transit, high-altitude shelter, and acclimatization telemetry in under 400ms.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase text-[#4F5D72]">Engine State</span>
              <span className="font-display font-bold text-sm text-[#006C4A]">
                {approvedState ? 'ROUTE RESOLVED & COMMITTED' : 'SWARM ARMED'}
              </span>
            </div>
            <span className={`w-3 h-3 rounded-full ${approvedState ? 'bg-[#006C4A]' : 'bg-emerald-500 animate-pulse'}`} />
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 01 // SELECT ACTIVE CHAOS VECTOR                                        */}
        {/* ======================================================================= */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4F5D72]">
              01 // SELECT ACTIVE CHAOS VECTOR
            </span>
            <span className="text-xs text-[#4F5D72]">Real-time Himalayan Spiti-Kinnaur Sector</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.values(SCENARIOS).map((sc) => {
              const isActive = activeScenarioId === sc.id;
              const IconComp = sc.icon;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-white border-[#C26D38] shadow-md ring-2 ring-[#C26D38]/20'
                      : 'bg-white/80 border-slate-200/80 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`p-2 rounded-xl bg-[#F2F3FF] ${sc.iconColor}`}>
                        <IconComp className="w-4 h-4" />
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                          isActive
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-[#4F5D72]'
                        }`}
                      >
                        {isActive ? 'INJECTED' : 'STANDBY'}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-sm text-[#131B2E]">
                      {sc.name}
                    </h2>
                    <p className="text-xs text-[#4F5D72] mt-1 leading-relaxed">
                      {sc.shortDesc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase text-[#C26D38]">
                      {sc.vectorLabel}
                    </span>
                    <button
                      type="button"
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#C26D38] text-white shadow-xs'
                          : 'bg-[#F2F3FF] hover:bg-slate-200 text-[#131B2E]'
                      }`}
                    >
                      {isActive ? 'Injected' : 'Inject Disruption'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* LIVE TELEMETRY DIFF RIBBON                                              */}
        {/* ======================================================================= */}
        <div className="w-full bg-[#F2F3FF] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Latency */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006C4A] flex items-center justify-center border border-emerald-200">
                <Bolt className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold text-[#4F5D72]">Swarm Reroute Latency</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-base text-[#131B2E]">{scenario.latency}</span>
                  <span className="text-[11px] text-[#006C4A] font-bold">[Target &lt;400ms]</span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Cost Delta */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FFDBC9]/50 text-[#C26D38] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold text-[#4F5D72]">Expedition Budget Delta</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-base text-[#006C4A]">{scenario.cost}</span>
                  <span className="text-[11px] text-[#4F5D72]">Zero-Overrun Guarantee</span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Acclimatization */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006C4A] flex items-center justify-center border border-emerald-200">
                <Heart className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold text-[#4F5D72]">Acclimatization Index</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-base text-[#006C4A]">{scenario.health}</span>
                  <span className="text-[11px] text-[#4F5D72]">Ascent Profile &lt;300m/d</span>
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Safety Index */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white text-[#131B2E] flex items-center justify-center border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#006C4A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase font-bold text-[#4F5D72]">Sentinel Certification</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-base text-[#131B2E]">{scenario.safety}</span>
                  <span className="text-[11px] text-[#006C4A] font-bold">Certified Valid</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#4F5D72]">
            <span>P2P Vector Mesh:</span>
            <span className="px-2 py-0.5 rounded bg-white text-[#131B2E] font-bold border border-slate-200">
              7/7 AGENTS SYNCED
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* MAIN SPLIT SCREEN DIFF SECTION (12 COLS)                                */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Original Compromised Route (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  <span className="font-display font-bold text-sm text-[#131B2E]">
                    Original Scheduled Circuit
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[10px] uppercase font-bold border border-rose-200">
                  Compromised
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F2F3FF]">
                  <span className="w-6 h-6 rounded-full bg-white text-[#4F5D72] flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-slate-200">
                    01
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-[#131B2E]">Manali Basecamp</span>
                      <span className="font-mono text-[10px] text-[#4F5D72]">2,050m</span>
                    </div>
                    <p className="text-[11px] text-[#4F5D72] mt-0.5">Private 4x4 departure via Atal Tunnel South Portal.</p>
                  </div>
                </div>

                {/* Step 2 (Flagged) */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/80 border border-rose-200">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    !
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-rose-700">{scenario.leftTitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] uppercase font-bold">
                        {scenario.leftPointBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                      {scenario.leftDesc}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-rose-700 font-mono text-[10px] uppercase font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{scenario.leftAlert}</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F2F3FF] opacity-75">
                  <span className="w-6 h-6 rounded-full bg-white text-[#4F5D72] flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-slate-200">
                    03
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-[#131B2E]">{scenario.leftDestTitle}</span>
                    </div>
                    <p className="text-[11px] text-[#4F5D72] mt-0.5">{scenario.leftDestDesc}</p>
                  </div>
                </div>
              </div>

              {/* Satellite mini-snippet */}
              <div className="mt-3 relative rounded-xl overflow-hidden h-28 bg-slate-900">
                <img
                  alt="Satellite pass visual"
                  className="w-full h-full object-cover opacity-60"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUzVp5vFmJOWtEA8BWmiatTpZ90y4E0sI2Fy4LT_KQdP3vjMc9wKN7NEUGQXKIypZ5A83ON_lScFlWGPYFwsYXNNlRK3GUOW-MVbLowcmvHHtLA-AXyh_VNHVKIlKrQGU88_EvyTSZMQtdcUgHK0xxVmzYDgiCCLiMXvoEUxycOU33eeWvKBipj_Kykbj5JKGldt86H8xC1SIYnDWVjyY18idj0FDRfB_zv93kQbQYqq9TGegP8jspvA"
                />
                <div className="absolute inset-0 p-3 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent text-white">
                  <span className="self-start px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] uppercase font-bold">
                    Satellite Intercept // BRO Feed
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>{scenario.satelliteCoords}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#4F5D72]">
              <span>Simulation Mode: Strict Deterministic</span>
              <span className="text-rose-600 font-bold">Baseline Safety: 42/100 (Unacceptable)</span>
            </div>
          </div>

          {/* Center: Swarm Core (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/80 gap-3 shadow-xs text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFDBC9] text-[#914714] flex items-center justify-center shadow-md animate-spin" style={{ animationDuration: '8s' }}>
              <Compass className="w-6 h-6" />
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase text-[#C26D38]">Wandr Swarm Core</span>
              <span className="font-display font-bold text-sm text-[#131B2E] mt-0.5">{scenario.latency} Calc</span>
              <span className="text-[10px] text-[#4F5D72] mt-0.5">1,420 permutations vetted across high corridors</span>
            </div>

            <div className="w-full p-2.5 bg-[#F2F3FF] rounded-xl flex flex-col gap-1.5 text-left border border-slate-200/60">
              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-[#4F5D72]">
                <span>Terrain Solver</span>
                <span className="text-[#006C4A]">Optimal</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#006C4A] w-full" />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase text-[#4F5D72] mt-0.5">
                <span>Room Exchange Broker</span>
                <span className="text-[#006C4A]">Secured</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#006C4A] w-full" />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[#C26D38] font-mono text-[10px] uppercase font-bold">
              <span>Autonomous Shift</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Right: Autonomous Self-Healing Proposal (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006C4A]" />
                  <span className="font-display font-bold text-sm text-[#131B2E]">
                    Agent Autonomous Self-Healing Proposal
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#006C4A] font-mono text-[10px] uppercase font-bold border border-emerald-200">
                  Optimal Fix
                </span>
              </div>

              {/* Solved Steps */}
              <div className="space-y-3">
                {/* Solved Step 1 */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F2F3FF]">
                  <span className="w-6 h-6 rounded-full bg-[#006C4A] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    01
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-[#131B2E]">{scenario.rightStep1Title}</span>
                      <span className="text-[10px] text-[#006C4A] font-bold">Executed</span>
                    </div>
                    <p className="text-[11px] text-[#4F5D72] mt-0.5">{scenario.rightStep1Desc}</p>
                  </div>
                </div>

                {/* Solved Step 2 (Healed Solution) */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                  <span className="w-6 h-6 rounded-full bg-[#006C4A] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-[#006C4A]">{scenario.rightPointTitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#006C4A] text-white font-mono text-[9px] uppercase font-bold">
                        All-Weather Valid
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                      {scenario.rightPointDesc}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[#006C4A] font-mono text-[10px] uppercase font-bold">
                      <span className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" /> {scenario.rightMetric1}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {scenario.rightMetric2}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Solved Step 3 (Lodging Swap) */}
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F2F3FF]">
                  <span className="w-6 h-6 rounded-full bg-[#006C4A] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    03
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-[#131B2E]">{scenario.rightDestTitle}</span>
                      <span className="text-[10px] text-[#006C4A] font-bold">Confirmed Voucher</span>
                    </div>
                    <p className="text-[11px] text-[#4F5D72] mt-0.5">{scenario.rightDestDesc}</p>
                  </div>
                </div>
              </div>

              {/* Resolution Badge Group */}
              <div className="mt-3 p-3 rounded-xl bg-[#F2F3FF] flex items-center justify-between border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#006C4A]" />
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#131B2E]">Autonomous Protocol 09</span>
                    <span className="text-[10px] text-[#4F5D72]">All bookings, transfers & permits mirrored</span>
                  </div>
                </div>
                <span className="font-display font-extrabold text-sm text-[#006C4A]">96/100 SAFE</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#4F5D72]">
              <span>Permit Authorization: DC Shimla Tele-Stamp</span>
              <span className="text-[#006C4A] font-bold">Contingency Budget Deficit: ±₹0.00</span>
            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* APPROVAL GATE ACTION BAR                                                */}
        {/* ======================================================================= */}
        <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C26D38] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Bolt className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-[#131B2E]">
                  Autonomous Decision Gate
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#FFDBC9] text-[#763300] font-mono text-[10px] uppercase font-bold">
                  Judge Evaluator Mode
                </span>
              </div>
              <p className="text-xs text-[#4F5D72] mt-0.5">
                Approval commits the reroute into the active itinerary, notifies host and driver dispatch, and preserves zero-markup guarantee.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleOverride}
              className="px-4 py-2.5 rounded-xl bg-[#F2F3FF] hover:bg-slate-200 text-[#131B2E] text-xs font-bold transition-colors cursor-pointer"
            >
              Reject / Manual Override
            </button>

            <button
              type="button"
              onClick={handleApprove}
              className={`px-6 py-2.5 rounded-xl text-white font-display text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer ${
                approvedState
                  ? 'bg-[#006C4A]'
                  : 'bg-[#C26D38] hover:bg-[#A85A2A]'
              }`}
            >
              {approvedState ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reroute Applied & Committed</span>
                </>
              ) : (
                <>
                  <Bolt className="w-4 h-4" />
                  <span>Approve Autonomous Self-Healing Reroute</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert if committed */}
        {approvedState && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006C4A]" />
              <span>Self-Healing Route committed. Host and 4x4 Bolero driver alerted. Zero cost overage.</span>
            </div>
            <Link to="/itinerary" className="underline font-bold hover:text-emerald-950">
              View Updated Itinerary →
            </Link>
          </div>
        )}

        {overriddenState && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Manual override selected. Original plan retained under active storm caution.</span>
          </div>
        )}

        {/* ======================================================================= */}
        {/* EVALUATOR LOG STRIP (TERMINAL)                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col gap-2 pb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold text-[#4F5D72]">
              LIVE AGENT SWARM EXECUTION LOG
            </span>
            <span className="font-mono text-[10px] uppercase font-bold text-[#006C4A]">
              Decentralized Local Guild Sync
            </span>
          </div>

          <div className="w-full bg-[#131B2E] text-slate-200 rounded-2xl p-4 font-mono text-xs leading-relaxed space-y-1.5 shadow-md border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <span>[0.00s]</span>
              <span className="font-bold text-white">CHAOS EVENT TRIGGERED:</span>
              <span>{scenario.log}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400">[0.12s]</span>
              <span>Surveyed 4 high-altitude bypass paths; Kunzum north traverse rejected (avalanche risk 88%).</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400">[0.26s]</span>
              <span>Kinnaur-Shimla all-weather corridor matched. Contacted Dekyid Guesthouse automated availability ledger.</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <span className="text-emerald-400">[0.34s]</span>
              <span>HEALED: 100% circuit continuity restored. Zero budget deviation. Ready for evaluator commit.</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
