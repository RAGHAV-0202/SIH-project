import React, { useState } from 'react';
import {
  AlertTriangle,
  Zap,
  RotateCcw,
  CheckCircle2,
  Clock,
  Car,
  Train,
  Bus,
  ShieldCheck,
  TrendingDown,
  Navigation,
  ArrowRight,
  Radio,
  Layers,
  Leaf,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingConfirmationGate from '../components/BookingConfirmationGate';

const URBAN_SCENARIOS = {
  1: {
    id: 1,
    vectorLabel: 'Vector 01',
    name: 'DMRC Blue Line Signal Glitch (Rajiv Chowk)',
    icon: Train,
    iconColor: 'text-[#C26D38]',
    severity: 'High Severity · 25 min Delay',
    shortDesc: 'Intermittent track circuit failure halts westbound Blue Line trains between Mandi House and Rajiv Chowk.',
    originalRoute: {
      title: 'Dwarka Sec 21 ➔ Connaught Place via Blue Line',
      status: 'Halted / Stalled',
      statusBadge: 'Transit Blocked',
      desc: 'Platform 3 completely overwhelmed with crowd spillover. Expected dwell delay exceeds 35 minutes.',
      metrics: '35 min delay · 40,000 affected commuters'
    },
    replannedRoute: {
      title: 'Autonomous Reroute: DTC Bus 501 + Yellow Line Metro',
      action: 'Instant Divert via Outer Feeder',
      desc: 'Alight at Dwarka Sec 10. Direct transfer to DTC 501 AC Express bus to Dhaula Kuan, connect to Airport Express line to New Delhi station.',
      metrics: 'Save 22 mins · Zero Extra Cost',
      carbonDelta: '-0.3 kg CO₂'
    },
    latency: '280 ms',
    costVariance: '±₹0',
    safetyScore: '98 / 100',
    log: 'Vector 01: Blue Line circuit trip at Rajiv Chowk. Autonomous modal shift to DTC Bus 501 corridor executed.'
  },
  2: {
    id: 2,
    vectorLabel: 'Vector 02',
    name: 'Flash Waterlogging at Moolchand Underpass',
    icon: AlertTriangle,
    iconColor: 'text-[#D97706]',
    severity: 'Critical Flood · Ring Road Deadlock',
    shortDesc: 'Sudden 65mm torrential cloudburst floods Moolchand Underpass under 3.5 feet of water. Ring Road traffic stationary.',
    originalRoute: {
      title: 'Lajpat Nagar ➔ AIIMS via Ring Road Cab',
      status: 'Submerged',
      statusBadge: 'Road Inundated',
      desc: 'Cab trapped in tailback spanning Ashram to South Extension. Vehicle engine stalling risk.',
      metrics: 'Stationary traffic · 55 min crawl'
    },
    replannedRoute: {
      title: 'Modal Shift: Pink Line Metro (Underground Bypass)',
      action: 'Elevated / Sub-surface Transition',
      desc: 'Driver exits arterial road at Defence Colony. Diverts traveler to Lajpat Nagar Pink Line Metro, alighting at Dilli Haat INA (all-weather underground tunnel).',
      metrics: '12 min guaranteed transit · 100% dry',
      carbonDelta: '-1.4 kg CO₂'
    },
    latency: '340 ms',
    costVariance: '-₹180 (Refunded)',
    safetyScore: '99 / 100',
    log: 'Vector 02: Flash flood alert on Ring Road. Automated passenger disembarkation to Pink Line sub-surface network.'
  },
  3: {
    id: 3,
    vectorLabel: 'Vector 03',
    name: 'NH-8 Sirhaul Toll Border Chokepoint',
    icon: Car,
    iconColor: 'text-rose-600',
    severity: 'Gridlock · 8-km Tailback',
    shortDesc: 'Security vehicle check and tractor rally causes total standstill on Delhi-Gurgaon Expressway.',
    originalRoute: {
      title: 'Gurgaon Cyber Hub ➔ Delhi Airport T3 via Highway',
      status: 'Paralyzed',
      statusBadge: 'Expressway Blocked',
      desc: 'Average speed dropped to 3 km/h. High risk of missed flight at IGI Terminal 3.',
      metrics: 'Missed flight probability: 87%'
    },
    replannedRoute: {
      title: 'Dedicated Rapid Metro ➔ Airport Express Rail Link',
      action: 'Grade-Separated Rail Corridor',
      desc: 'Transfer directly at Cyber City Rapid Metro station to Sikanderpur (Yellow Line) ➔ New Delhi Airport Express line. Complete bypass of road tarmac.',
      metrics: 'Arrive 45 mins before flight gate close',
      carbonDelta: '-2.1 kg CO₂'
    },
    latency: '310 ms',
    costVariance: '+₹20',
    safetyScore: '96 / 100',
    log: 'Vector 03: Sirhaul border gridlock detected. Autonomous flight-rescue itinerary via Airport Express rail.'
  },
  4: {
    id: 4,
    vectorLabel: 'Vector 04',
    name: 'Anand Vihar ISBT EV Charger Grid Trip',
    icon: Zap,
    iconColor: 'text-[#006C4A]',
    severity: 'Infrastructure Strain · Low Battery Fleet',
    shortDesc: 'Local transformer overload shuts down 40 DC fast chargers at Anand Vihar bus & EV cab depot.',
    originalRoute: {
      title: 'East Delhi EV Feeder Fleet Depleted',
      status: 'Power Outage',
      statusBadge: 'Depot Offline',
      desc: 'Electric feeder vans unable to replenish charge for peak evening passenger dispersal.',
      metrics: '40 DC chargers offline · 12 vans stranded'
    },
    replannedRoute: {
      title: 'Smart Fleet Balancing: Sarai Kale Khan Dynamic Reroute',
      action: 'Telematics Grid Rebalancing',
      desc: 'Autonomous redistribution of 18 hybrid CNG feeders from Sarai Kale Khan ISBT to cover East Delhi metro stations; dynamic solar microgrid enabled.',
      metrics: '0 cancelled passenger trips · 9 min recovery',
      carbonDelta: '-0.8 kg CO₂'
    },
    latency: '410 ms',
    costVariance: '±₹0',
    safetyScore: '97 / 100',
    log: 'Vector 04: EV charging substation tripped. Autonomous dispatch optimization invoked.'
  }
};

export default function DisruptionLab() {
  const [selectedVector, setSelectedVector] = useState(1);
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanAccepted, setReplanAccepted] = useState(false);
  const [isHitlGateOpen, setIsHitlGateOpen] = useState(false);

  const scenario = URBAN_SCENARIOS[selectedVector];

  const handleSimulate = (vectorId) => {
    setSelectedVector(vectorId);
    setReplanAccepted(false);
    setIsReplanning(true);
    setTimeout(() => {
      setIsReplanning(false);
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAF8FF] text-[#131B2E] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 font-body">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] bg-[#FFDBC9]/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-display">
              <Radio className="w-3 h-3 animate-ping text-[#C26D38]" />
              Real-Time Chaos Engineering & Failover Control Room
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#006C4A] bg-[#DEF7EC] px-2.5 py-0.5 rounded-full font-mono">
              SLA &lt; 500ms
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] mt-1.5 font-display tracking-tight">
            Autonomous Urban Disruption Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#4F5D72] max-w-3xl mt-1 leading-relaxed">
            Simulate catastrophic road closures, metro signal failures, flash floods, and grid outages.
            Watch CityFlow AI autonomously reroute multimodal commuter journeys in sub-second latency.
          </p>
        </div>

        {/* Live SLA Telemetry */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Failover Latency</div>
            <div className="text-lg font-bold text-[#006C4A] font-mono">{scenario.latency}</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Budget Delta</div>
            <div className="text-lg font-bold text-[#131B2E] font-mono">{scenario.costVariance}</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Safety Index</div>
            <div className="text-lg font-bold text-[#C26D38] font-mono">{scenario.safetyScore}</div>
          </div>
        </div>
      </div>

      {/* Vector Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Object.values(URBAN_SCENARIOS).map((s) => {
          const Icon = s.icon;
          const isSelected = selectedVector === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSimulate(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[#FFF8F3] border-[#C26D38] shadow-xs ring-1 ring-[#C26D38]'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C26D38] bg-[#FFDBC9]/50 px-2 py-0.5 rounded-full">
                  {s.vectorLabel}
                </span>
                <Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#131B2E] leading-tight font-display">{s.name}</h3>
                <span className="text-[11px] text-[#64748B] mt-1 block">{s.severity}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Before / After Diff Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Disrupted Initial State (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-rose-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 font-display">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Disrupted Original Vector
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                {scenario.originalRoute.statusBadge}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#131B2E] mb-2 font-display">{scenario.originalRoute.title}</h2>
            <p className="text-xs text-[#4F5D72] leading-relaxed mb-4">{scenario.originalRoute.desc}</p>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800">
              <strong>Incident Impact:</strong> {scenario.originalRoute.metrics}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-slate-200 text-xs font-mono text-[#64748B]">
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Telemetry Sensor Log</div>
            <div>{scenario.log}</div>
          </div>
        </div>

        {/* Middle Column: Autonomous Agent Interceptor (2 cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-4 py-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C26D38] text-white flex items-center justify-center shadow-xs">
            <RotateCcw className={`w-5 h-5 ${isReplanning ? 'animate-spin' : ''}`} />
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-[#131B2E] font-display">Multi-Agent Arbiter</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Autonomous Failover</div>
          </div>
          <div className="hidden lg:flex flex-col items-center gap-1 text-[#C26D38]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C26D38] animate-ping" />
            <ArrowRight className="w-4 h-4 text-[#C26D38]" />
          </div>
        </div>

        {/* Right Column: AI Replanned Solution (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF8F3] via-white to-[#F2F3FF] border-2 border-[#FFDBC9] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006C4A] flex items-center gap-1.5 font-display">
                <CheckCircle2 className="w-4 h-4 text-[#006C4A]" />
                Autonomous AI Alternative
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#DEF7EC] text-[#006C4A] font-bold">
                {scenario.replannedRoute.action}
              </span>
            </div>

            <h2 className="text-lg font-bold text-[#131B2E] mb-2 font-display">{scenario.replannedRoute.title}</h2>
            <p className="text-xs text-[#4F5D72] leading-relaxed mb-4">{scenario.replannedRoute.desc}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-[#64748B]">Time Optimized</div>
                <div className="text-sm font-bold text-[#006C4A] font-mono">{scenario.replannedRoute.metrics}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-[#64748B]">Carbon Saved</div>
                <div className="text-sm font-bold text-[#006C4A] flex items-center gap-1 font-mono">
                  <Leaf className="w-3.5 h-3.5" />
                  {scenario.replannedRoute.carbonDelta}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              {replanAccepted ? '✅ Divert Instruction Authorized & Dispatched' : 'Ready for commuter authorization (HITL)'}
            </span>
            <button
              type="button"
              onClick={() => setIsHitlGateOpen(true)}
              disabled={replanAccepted}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-display ${
                replanAccepted
                  ? 'bg-[#006C4A] text-white cursor-default shadow-xs'
                  : 'bg-[#C26D38] hover:bg-[#A85A2A] text-white shadow-xs'
              }`}
            >
              {replanAccepted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Divert Active (HITL Verified)
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Review & Authorize Divert (HITL)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Confirmation Gate */}
      <BookingConfirmationGate
        isOpen={isHitlGateOpen}
        onClose={() => setIsHitlGateOpen(false)}
        title="Human Authorization: Deploy Emergency Reroute"
        totalCost={0}
        breakdown={[
          { label: `Cancelled Leg: ${scenario.originalRoute.title}`, cost: 0 },
          { label: `Autonomous Divert: ${scenario.replannedRoute.title}`, cost: 0 },
          { label: `SLA & Latency Guarantee: ${scenario.latency}`, cost: 0 }
        ]}
        actionLabel="Authorize Emergency Divert"
        onConfirm={() => setReplanAccepted(true)}
      />
    </div>
  );
}
