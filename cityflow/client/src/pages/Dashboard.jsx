import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  Leaf,
  AlertTriangle,
  Activity,
  BarChart3,
  Radio,
  Truck,
  ShieldCheck,
  Zap,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRoutes: 14820,
    avgCommuteTime: 38,
    carbonSaved: 9420,
    activeDisruptions: 2,
    // Core Impact Metrics
    peakHourRoadLoadReduction: 24.8,
    tripsShiftedToPublicTransport: 41.2,
    logisticsFreightShifted: 19.5,
    evCorridorShare: 32.4
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#FAF8FF] text-[#131B2E] font-body">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] bg-[#FFDBC9]/50 px-2.5 py-0.5 rounded-full font-display">
                Urban Transit Telematics
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#006C4A] bg-[#DEF7EC] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Radio className="w-3 h-3 text-[#006C4A] animate-pulse" />
                Live Arterial Load Ingestion
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] mt-1.5 font-display tracking-tight">
              Congestion & Resource Load Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#4F5D72] mt-1">
              Corridor capacity, infrastructure strain mitigation, and simulated modal shift metrics for Delhi NCT urban resource planning.
            </p>
          </div>
        </div>

        {/* ─── PRIMARY IMPACT METRICS ─── */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-[#FFF8F3] to-[#F2F3FF] border-2 border-[#FFDBC9] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] font-display">
                Macro-Infrastructure Stress Relief Index
              </span>
              <h2 className="text-lg font-bold text-[#131B2E] font-display">
                Citywide Mobility & Logistics Impact Telematics
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#006C4A] bg-[#DEF7EC] px-3 py-1 rounded-full">
              SIMULATED AGENTIC IMPACT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Impact Metric 1 */}
            <div className="p-4 rounded-2xl bg-white border border-[#FFDBC9] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-bold uppercase tracking-wider text-[10px]">Peak Road Load</span>
                <span className="p-1 rounded-md bg-rose-50 text-rose-600 font-bold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#C26D38] font-display">
                -{stats.peakHourRoadLoadReduction}%
              </div>
              <p className="text-[11px] text-[#4F5D72] leading-tight">
                <strong>Peak-hour road load reduction</strong> via dynamic multi-modal commuter dispersal.
              </p>
            </div>

            {/* Impact Metric 2 */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-bold uppercase tracking-wider text-[10px]">Public Transit Shift</span>
                <span className="p-1 rounded-md bg-[#DEF7EC] text-[#006C4A] font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#006C4A] font-display">
                +{stats.tripsShiftedToPublicTransport}%
              </div>
              <p className="text-[11px] text-[#4F5D72] leading-tight">
                <strong>Trips shifted to public transit</strong> (DMRC Rail & DTC Electric Bus networks).
              </p>
            </div>

            {/* Impact Metric 3 */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-bold uppercase tracking-wider text-[10px]">Logistics Freight Offload</span>
                <span className="p-1 rounded-md bg-amber-50 text-[#D97706] font-bold flex items-center">
                  <Truck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#D97706] font-display">
                {stats.logisticsFreightShifted}%
              </div>
              <p className="text-[11px] text-[#4F5D72] leading-tight">
                <strong>Cargo shifted to off-peak / EV</strong> micro-depots, reducing arterial daytime truck congestion.
              </p>
            </div>

            {/* Impact Metric 4 */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-bold uppercase tracking-wider text-[10px]">CO₂ Abatement</span>
                <span className="p-1 rounded-md bg-emerald-50 text-[#006C4A] font-bold flex items-center">
                  <Leaf className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#131B2E] font-display">
                {stats.carbonSaved.toLocaleString()} kg
              </div>
              <p className="text-[11px] text-[#006C4A] font-semibold leading-tight">
                Cumulative daily emissions averted across all dispatched itineraries.
              </p>
            </div>
          </div>
        </div>

        {/* Top 4 Operational Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Routes Dispatched"
            value={stats.totalRoutes.toLocaleString('en-IN')}
            subtext="+18% vs last week"
            icon={TrendingUp}
            color="text-[#C26D38] bg-[#FFF8F3] border-[#FFDBC9]"
          />
          <StatCard
            title="Avg. Commute Duration"
            value={`${stats.avgCommuteTime} min`}
            subtext="4.2 min faster via rail feeder"
            icon={Clock}
            color="text-[#D97706] bg-amber-50 border-amber-200"
          />
          <StatCard
            title="Active Disruption Vectors"
            value={stats.activeDisruptions}
            subtext="Sub-400ms failover armed"
            icon={AlertTriangle}
            color="text-rose-600 bg-rose-50 border-rose-200"
          />
          <StatCard
            title="Clean EV Transit Share"
            value={`${stats.evCorridorShare}%`}
            subtext="Zero-emission fleet legs"
            icon={Zap}
            color="text-[#006C4A] bg-[#DEF7EC] border-emerald-200"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Corridor Congestion Telemetry Canvas */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#131B2E] font-display">Live Arterial Corridor Load Matrix</h3>
                <p className="text-xs text-[#64748B]">Real-time velocity, bottleneck status, and load alleviation index across 10 Delhi arteries.</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#006C4A] bg-[#DEF7EC] px-2.5 py-1 rounded-full">
                DYNAMIC ADAPTATION
              </span>
            </div>

            {/* Visual Corridor Telemetry Matrix */}
            <div className="space-y-3 pt-2">
              {[
                { name: 'Ring Road (North & South Artery)', speed: '18 km/h', congestion: '88% Peak Load', relieved: '-22% Load Diverted', status: 'Deadlock Warning', color: 'bg-rose-500' },
                { name: 'NH-8 (Delhi-Gurgaon Expressway)', speed: '24 km/h', congestion: '74% Capacity', relieved: '-19% Load Diverted', status: 'Moderate Flow', color: 'bg-[#D97706]' },
                { name: 'Outer Ring Road (South Extension)', speed: '21 km/h', congestion: '81% Capacity', relieved: '-25% Load Diverted', status: 'Heavy Congestion', color: 'bg-rose-500' },
                { name: 'Blue Line Metro Trunk (Dwarka ➔ CP)', speed: '34 km/h', congestion: '92% Rider Index', relieved: '+38% Modal Absorb', status: 'High Transit Demand', color: 'bg-[#C26D38]' },
                { name: 'Vikas Marg (ITO ➔ East Delhi Logistics)', speed: '28 km/h', congestion: '65% Capacity', relieved: '-16% Load Diverted', status: 'Steady Flow', color: 'bg-[#006C4A]' }
              ].map((corridor, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#131B2E] block">{corridor.name}</span>
                    <span className="text-[11px] text-[#64748B]">Current speed: {corridor.speed} · {corridor.relieved}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-[#131B2E]">{corridor.congestion}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${corridor.color}`}>
                      {corridor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Charts */}
          <div className="space-y-6">
            {/* Modal Split Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#131B2E] font-display">Modal Share Distribution</h3>
              <div className="flex items-center gap-5">
                {/* Conic Ring */}
                <div
                  className="w-24 h-24 rounded-full shrink-0 shadow-inner"
                  style={{
                    background: 'conic-gradient(#C26D38 0% 45%, #006C4A 45% 72%, #D97706 72% 86%, #E11D48 86% 100%)'
                  }}
                />
                <div className="text-xs space-y-2 font-body">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#C26D38] rounded-sm"></div>
                    <span className="font-medium text-[#131B2E]">DMRC Metro (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#006C4A] rounded-sm"></div>
                    <span className="font-medium text-[#131B2E]">DTC Bus (27%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#D97706] rounded-sm"></div>
                    <span className="font-medium text-[#131B2E]">Auto / Bike Feeder (14%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                    <span className="font-medium text-[#131B2E]">Cab / Private Car (14%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics & Freight Load Allocation */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#131B2E] font-display">Urban Freight Dispatch Modes</h3>
                <Truck className="w-4 h-4 text-[#C26D38]" />
              </div>
              <div className="space-y-3 text-xs font-body">
                <Bar label="Dedicated Commercial EV Van" val="42%" color="bg-[#006C4A]" />
                <Bar label="Hyperlocal 2W Express Courier" val="36%" color="bg-[#D97706]" />
                <Bar label="Off-Peak Metro Cargo Bay Pilot" val="22%" color="bg-[#C26D38]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-5 border border-slate-200/90 flex items-start justify-between shadow-2xs font-body">
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-display mb-1">{title}</p>
      <p className="text-2xl font-extrabold text-[#131B2E] font-display">{value}</p>
      {subtext && <p className="text-[11px] text-[#006C4A] font-semibold mt-1">{subtext}</p>}
    </div>
    <div className={`p-2.5 rounded-2xl border ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const Bar = ({ label, val, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="font-medium text-[#131B2E]">{label}</span>
      <span className="font-mono text-[#64748B] font-bold">{val}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2 rounded-full`} style={{ width: val }} />
    </div>
  </div>
);
