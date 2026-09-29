import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Brain,
  Leaf,
  Zap,
  Map,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Train,
  Bus,
  Car,
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
  Radio
} from 'lucide-react';

const QUICK_COMMUTE_CORRIDORS = [
  {
    id: 'dwarka-cp',
    origin: 'Dwarka Sec 21',
    dest: 'Connaught Place',
    tag: 'Arterial Metro Corridor',
    metroLine: 'Blue Line',
    time: '42 min',
    fare: '₹40',
    carbonSaved: '1.2 kg CO₂',
    modes: ['walk', 'metro', 'walk']
  },
  {
    id: 'noida-gurgaon',
    origin: 'Noida Sec 62',
    dest: 'Gurgaon Cyber Hub',
    tag: 'Inter-City Tech Hub',
    metroLine: 'Blue ➔ Yellow Line',
    time: '58 min',
    fare: '₹60',
    carbonSaved: '2.4 kg CO₂',
    modes: ['auto', 'metro', 'metro']
  },
  {
    id: 'rohini-southex',
    origin: 'Rohini',
    dest: 'South Extension',
    tag: 'North-to-South Express',
    metroLine: 'Red ➔ Yellow Line',
    time: '48 min',
    fare: '₹50',
    carbonSaved: '1.8 kg CO₂',
    modes: ['bus', 'metro', 'walk']
  },
  {
    id: 'saket-aiims',
    origin: 'Saket',
    dest: 'AIIMS',
    tag: 'Medical & Civic Spine',
    metroLine: 'Yellow Line Direct',
    time: '18 min',
    fare: '₹20',
    carbonSaved: '0.9 kg CO₂',
    modes: ['walk', 'metro', 'walk']
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedCorridorId, setSelectedCorridorId] = useState('dwarka-cp');
  const activeCorridor = QUICK_COMMUTE_CORRIDORS.find(c => c.id === selectedCorridorId) || QUICK_COMMUTE_CORRIDORS[0];

  const handleLaunchCorridor = () => {
    navigate('/plan', {
      state: {
        origin: activeCorridor.origin,
        dest: activeCorridor.dest
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-body text-[#131B2E] antialiased selection:bg-[#C26D38] selection:text-white overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & INTERACTIVE QUICK-COMMUTE DISPATCHER                   */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Ambient Glows from previous prototype */}
        <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-[#FFDBC9]/40 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full flex flex-col items-start relative z-10">
          {/* Tag Overline */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs mb-6">
            <span className="w-2 h-2 rounded-full bg-[#006C4A] animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              Autonomous Urban Mobility Platform
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#006C4A]">
              Real-Time Delhi NCT Network
            </span>
          </div>

          {/* Asymmetric Editorial Headline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-end mb-10">
            <div className="lg:col-span-8 flex flex-col">
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#131B2E] tracking-tight leading-[1.12]">
                City Commutes Planned at the <span className="text-[#C26D38] italic font-serif">Speed of Thought.</span>
              </h1>
            </div>
            <div className="lg:col-span-4 flex flex-col pb-1">
              <p className="text-sm sm:text-base text-[#4F5D72] leading-relaxed">
                Multi-agent AI optimizer for congested urban networks. Unified bus, metro, auto, cab, and walking routing with real-time disruption failover and carbon intelligence.
              </p>
            </div>
          </div>

          {/* ─── INTERACTIVE QUICK-COMMUTE DISPATCHER WIDGET ─── */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase text-[#C26D38] tracking-widest block font-display">
                  Live Dispatch Simulation
                </span>
                <h3 className="text-lg font-bold text-[#131B2E] mt-0.5">
                  Select High-Density Delhi Transit Corridors
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#006C4A] font-semibold bg-[#DEF7EC] px-3 py-1 rounded-full">
                <Radio className="w-3.5 h-3.5 animate-ping text-[#006C4A]" />
                <span>Live OpenWeather + DMRC Sync Active</span>
              </div>
            </div>

            {/* Corridor Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {QUICK_COMMUTE_CORRIDORS.map(c => {
                const isSelected = selectedCorridorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FFF8F3] border-[#C26D38] shadow-xs'
                        : 'bg-[#FAF8FF] border-slate-200/80 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#C26D38] bg-[#FFDBC9]/50 px-2 py-0.5 rounded-full">
                        {c.tag}
                      </span>
                      <Train className="w-4 h-4 text-[#4F5D72]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#131B2E]">{c.origin}</div>
                      <div className="text-xs text-[#64748B]">➔ {c.dest}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-mono">
                      <span className="font-semibold text-[#131B2E]">{c.time}</span>
                      <span className="text-[#006C4A] font-bold">{c.fare}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Corridor Live Metrics Bar */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-[10px] uppercase text-[#64748B] font-bold block">Selected Route</span>
                  <span className="text-sm font-bold text-[#131B2E] flex items-center gap-1.5">
                    <span>{activeCorridor.origin}</span>
                    <span className="text-[#C26D38]">➔</span>
                    <span>{activeCorridor.dest}</span>
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] uppercase text-[#64748B] font-bold block">Spine Mode</span>
                  <span className="text-sm font-bold text-[#0284C7]">{activeCorridor.metroLine}</span>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <span className="text-[10px] uppercase text-[#64748B] font-bold block">CO₂ Prevented</span>
                  <span className="text-sm font-bold text-[#006C4A] flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5" />
                    {activeCorridor.carbonSaved}
                  </span>
                </div>
              </div>

              <Link
                to="/plan"
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Full Route Synthesizer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS SECTION (EDITORIAL DAYLIGHT PALETTE)                             */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-slate-200/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            <motion.div variants={itemVariants} className="p-4">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#131B2E] mb-1">20M+</div>
              <div className="text-xs sm:text-sm text-[#64748B]">Daily commuters across Delhi NCR</div>
            </motion.div>
            <motion.div variants={itemVariants} className="p-4">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#C26D38] mb-1">5 Apps</div>
              <div className="text-xs sm:text-sm text-[#64748B]">Juggled today for a single commute</div>
            </motion.div>
            <motion.div variants={itemVariants} className="p-4">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-rose-600 mb-1">45 min</div>
              <div className="text-xs sm:text-sm text-[#64748B]">Wasted in traffic deadlock daily</div>
            </motion.div>
            <motion.div variants={itemVariants} className="p-4">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#006C4A] mb-1">3.2M Tons</div>
              <div className="text-xs sm:text-sm text-[#64748B]">Annual urban transport CO₂ emissions</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MULTI-AGENT ARCHITECTURE PIPELINE                                      */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[11px] font-extrabold uppercase text-[#C26D38] tracking-widest block font-display mb-1">
            Engineered for Resilient Urban Infrastructure
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#131B2E] tracking-tight">
            How CityFlow's Multi-Agent Core Works
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Sequential agent orchestration with real-time telematics, weather intelligence, and deterministic knapsack ranking.
          </p>
        </div>

        {/* Pipeline Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Intent Agent', desc: 'Parses conversational Hindi & Hinglish prompts with Zod schemas.', icon: Brain, badge: 'Live Groq LLM' },
            { step: '02', title: 'Traffic Agent', desc: 'Monitors peak congestion across 10 major Delhi corridors.', icon: Zap, badge: 'Telematics' },
            { step: '03', title: 'Route Agent', desc: 'Synthesizes DMRC metro, DTC bus, auto, and walk segments.', icon: Map, badge: 'Dynamic Geo' },
            { step: '04', title: 'Optimizer Agent', desc: 'Scores routes using time, cost, comfort, and carbon factors.', icon: Leaf, badge: 'Pareto Knapsack' },
            { step: '05', title: 'Disruption Agent', desc: 'Monitors chokepoints and auto-replans routes in sub-400ms.', icon: ShieldCheck, badge: 'Auto-Failover' },
          ].map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-[#C26D38] bg-[#FFDBC9]/50 px-2 py-0.5 rounded-full">
                      Step {agent.step}
                    </span>
                    <Icon className="w-5 h-5 text-[#4F5D72]" />
                  </div>
                  <h3 className="font-bold text-base text-[#131B2E]">{agent.title}</h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{agent.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-[#006C4A] bg-[#DEF7EC] px-2 py-0.5 rounded-md">
                    {agent.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SIX BENTO-GRID FEATURE TILES                                           */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#131B2E] tracking-tight">
            Features Tailored for Indian Megacities
          </h2>
          <p className="text-sm text-[#64748B] mt-2">
            Solving the fragmented transit puzzle from doorstep to destination.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Brain, title: "Multimodal Synthesis", desc: "Seamlessly chains metro, bus, auto, and walk segments into one unified schedule.", badge: "Zero Fragmentation" },
            { icon: ShieldCheck, title: "Disruption Shield", desc: "When Rajiv Chowk or Ring Road stalls, autonomous failover redirects you in under 400ms.", badge: "Real-Time Rerouting" },
            { icon: Leaf, title: "Carbon Accountability", desc: "Scientific CPCB carbon tracking per passenger-km compared against private vehicle baselines.", badge: "Green Commute" },
            { icon: Map, title: "Interactive Route Map", desc: "Leaflet OpenStreetMap visualizer with mode-colored polylines and station transfer waypoints.", badge: "Open Data" },
            { icon: LayoutDashboard, title: "City Planner Control Tower", desc: "Corridor congestion heatmaps and modal split statistics for urban resource allocation.", badge: "Live Telematics" },
            { icon: Compass, title: "Door-to-Door Concierge", desc: "Synchronizes first-mile e-rickshaw, core rail transit, and last-mile Rapido connections.", badge: "Pacing Alarms" }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FFF8F3] text-[#C26D38] border border-[#FFDBC9] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#131B2E]">{feat.title}</h3>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">{feat.desc}</p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono font-semibold text-[#006C4A] bg-[#DEF7EC] px-2 py-0.5 rounded-full">
                    {feat.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER (EDITORIAL DAYLIGHT STYLE)                                      */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C26D38] text-white flex items-center justify-center font-bold text-xs font-display">
              C
            </div>
            <span className="font-display font-extrabold text-sm text-[#131B2E]">
              CityFlow AI
            </span>
            <span className="text-xs text-slate-400">· Autonomous Urban Mobility Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#64748B]">
            <Link to="/plan" className="hover:text-[#C26D38] transition-colors">Plan Commute</Link>
            <Link to="/dashboard" className="hover:text-[#C26D38] transition-colors">Analytics</Link>
            <Link to="/disruption" className="hover:text-[#C26D38] transition-colors">Disruption Lab</Link>
            <Link to="/data-registry" className="hover:text-[#C26D38] transition-colors">Data Registry</Link>
          </div>

          <div className="text-xs text-[#94A3B8]">
            Built with React, Leaflet, OpenWeather, Groq LLM & MongoDB.
          </div>
        </div>
      </footer>
    </div>
  );
}
