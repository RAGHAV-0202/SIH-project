import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useMemory } from '../context/MemoryContext';
import Navbar from '../components/Navbar';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Lock,
  Sun,
  Heart,
  Car,
  Sparkles,
  Info,
  ChevronsUpDown,
} from 'lucide-react';

const FEATURED_CORRIDORS = [
  {
    id: 'spiti',
    name: 'Spiti Valley',
    state: 'Himachal Pradesh',
    tag: 'High-Altitude Cold Desert',
    subtitle: 'Ancient monasteries, Chandratal Lake & direct mud-brick village homestays',
    days: 5,
    budget: 28000,
    people: 2,
    badge: 'Altitude Paced',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'coorg',
    name: 'Coorg',
    state: 'Karnataka',
    tag: 'Western Ghats Rainforest',
    subtitle: 'Misty coffee plantations, spice trails & traditional Kodava family stays',
    days: 4,
    budget: 22000,
    people: 2,
    badge: 'Direct Homestays',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    state: 'Northeast Highlands',
    tag: 'Living Root Bridges & Waterfalls',
    subtitle: 'Double decker root bridges, Dawki crystal waters & Khasi river cottages',
    days: 5,
    budget: 26000,
    people: 2,
    badge: 'Community Led',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    image: 'https://images.unsplash.com/photo-1626014303757-646e7f8646b9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tag: 'Royal Lakes & Heritage Havelis',
    subtitle: 'Lake Pichola sunset boats, restored havelis & artisan miniature painting',
    days: 3,
    budget: 24000,
    people: 2,
    badge: 'Heritage Preserved',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Home() {
  const { updateTrip } = useTrip();
  const { memory } = useMemory();
  const navigate = useNavigate();

  const handleLaunchCorridor = (corridor) => {
    navigate('/planning', {
      state: {
        destination: corridor.name,
        days: corridor.days,
        people: corridor.people,
        budget: corridor.budget,
        prompt: `${corridor.days} days in ${corridor.name} for ${corridor.people} travelers under ₹${corridor.budget.toLocaleString('en-IN')}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-body text-[#131B2E] antialiased selection:bg-[#C26D38] selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="w-full">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION & CORRIDOR PREVIEW SHOWCASE                                */}
        {/* ========================================================================= */}
        <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pt-8 pb-14">
          {/* Ambient Glows */}
          <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-[#FFDBC9]/30 blur-3xl pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full flex flex-col items-start relative z-10">
            
            {/* Autonomous Tag Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 text-xs font-semibold text-slate-800 mb-6 shadow-2xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C26D38]" />
              <span>Multi-Agent Expedition Synthesis</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[#006C4A]">100% Direct Village Dividends</span>
            </div>

            {/* Asymmetric Headline & Editorial Intro */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-end mb-8">
              <div className="lg:col-span-8 flex flex-col">
                <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[#131B2E] tracking-tight leading-[1.1]">
                  Travel Planned at the <span className="text-[#C26D38] italic">Speed of Thought.</span>
                </h1>
              </div>
              <div className="lg:col-span-4 flex flex-col pb-1">
                <p className="text-sm sm:text-base text-[#4F5D72] leading-relaxed">
                  Autonomous trip-planning agent for domestic Indian travel. Direct community homestays, vetted mountain chauffeurs, and terrain-calibrated pacing across India's most extraordinary corridors.
                </p>
              </div>
            </div>

            {/* Direct Launch Action Strip */}
            <div className="w-full flex flex-wrap items-center gap-4 mb-10">
              <button
                type="button"
                onClick={() => navigate('/planning')}
                className="group px-7 py-3.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white font-display font-bold text-base flex items-center gap-3 shadow-md hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Launch Trip Planner</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#corridors"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#131B2E] font-display font-bold text-base border border-slate-200/90 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#006C4A]" />
                <span>Explore 4 Corridors</span>
              </a>
            </div>

            {/* Trust Assurance Strip */}
            <div className="w-full pt-4 pb-6 border-y border-slate-200/70 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs text-[#4F5D72] mb-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006C4A]" />
                <span>Verified village homestays & vetted mountain chauffeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C26D38]" />
                <span>Terrain & altitude-calibrated daily rhythms</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#006C4A]" />
                <span>Zero broker markups — direct rates</span>
              </div>
            </div>

            {/* Featured Corridor Preview Cards Grid */}
            <div id="corridors" className="w-full scroll-mt-24">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-xs font-bold text-[#C26D38] uppercase tracking-wider block mb-1">
                    Featured Regional Corridors
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-[#131B2E]">
                    Select an Expedition Route
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/planning')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#006C4A] hover:underline cursor-pointer"
                >
                  <span>Or enter custom destination</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURED_CORRIDORS.map((corridor) => (
                  <div
                    key={corridor.id}
                    onClick={() => handleLaunchCorridor(corridor)}
                    className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail with Overlay */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={corridor.image}
                          alt={corridor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs backdrop-blur-xs ${corridor.badgeColor}`}>
                            {corridor.badge}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <span className="text-[11px] font-medium opacity-85 block">{corridor.state}</span>
                          <span className="font-display font-bold text-lg leading-tight block">{corridor.name}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <span className="text-[10px] font-bold text-[#C26D38] uppercase tracking-wider block mb-1">
                          {corridor.tag}
                        </span>
                        <p className="text-xs text-[#4F5D72] leading-relaxed line-clamp-2">
                          {corridor.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#C26D38]" />
                          <span>{corridor.days}D</span>
                          <span className="text-slate-300">•</span>
                          <span>₹{(corridor.budget / 1000).toFixed(0)}k</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#C26D38] group-hover:translate-x-1 transition-transform">
                          Plan <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. VALUE PROPOSITIONS: 4 REASSURANCE CARDS                                 */}
        {/* ========================================================================= */}
        <section className="w-full bg-[#F2F3FF] py-8 px-4 sm:px-6 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-xs border border-slate-200/60">
              <span className="text-xs font-semibold text-[#4F5D72] mb-1">Direct stays</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#131B2E]">Community homestays</span>
                <ShieldCheck className="w-4 h-4 text-[#006C4A] shrink-0" />
              </div>
              <span className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                Direct partnerships with village families and traditional heritage homes.
              </span>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-xs border border-slate-200/60">
              <span className="text-xs font-semibold text-[#4F5D72] mb-1">Terrain-aware</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#131B2E]">Intelligent pacing</span>
                <Heart className="w-4 h-4 text-[#C26D38] shrink-0" />
              </div>
              <span className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                Day plans account for mountain roads, ghat curves, and acclimatization buffers.
              </span>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-xs border border-slate-200/60">
              <span className="text-xs font-semibold text-[#4F5D72] mb-1">Live recovery</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#131B2E]">Disruption protection</span>
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <span className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                Automatic rerouting when landslides, pass closures, or weather occur.
              </span>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col p-4 bg-white rounded-2xl shadow-xs border border-slate-200/60">
              <span className="text-xs font-semibold text-[#4F5D72] mb-1">Itemized ledger</span>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-[#131B2E]">Transparent pricing</span>
                <Lock className="w-4 h-4 text-[#006C4A] shrink-0" />
              </div>
              <span className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                Clear cost breakdowns for lodging, transit, and entry tickets.
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CAPABILITIES SHOWCASE                                                   */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="w-full px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-1">
              <div>
                <span className="text-xs font-semibold text-[#C26D38]">
                  Intelligent trip design
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#131B2E] mt-1">
                  Built for how India actually travels
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#4F5D72] max-w-md leading-relaxed">
                Coordinates local transit, vetted community stays, and realistic daily driving times for every terrain.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Feature 1: Thoughtful Daily Pacing (Span 7) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[#006C4A] text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 mb-2">
                    <Heart className="w-3.5 h-3.5 text-[#006C4A]" />
                    <span>Terrain-calibrated rhythms</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#131B2E]">
                    Day plans built for real Indian roads
                  </h3>
                  <p className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                    Transit buffers, scenic chai stops, and gradual altitude acclimation built into every route.
                  </p>

                  {/* Regional Travel Rhythms Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                    <div className="bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-[#C26D38] block">Spiti</span>
                      <span className="text-xs font-bold text-[#131B2E] mt-0.5 block">Altitude buffers</span>
                    </div>
                    <div className="bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-[#C26D38] block">Coorg</span>
                      <span className="text-xs font-bold text-[#131B2E] mt-0.5 block">Winding ghat curves</span>
                    </div>
                    <div className="bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-[#C26D38] block">Meghalaya</span>
                      <span className="text-xs font-bold text-[#131B2E] mt-0.5 block">Root bridge steps</span>
                    </div>
                    <div className="bg-[#F2F3FF] p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[11px] font-semibold text-[#C26D38] block">Udaipur</span>
                      <span className="text-xs font-bold text-[#131B2E] mt-0.5 block">Old-city walking loops</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#4F5D72]">
                  <span>Departures calibrated to your group's preferred pace.</span>
                  <span className="text-[#006C4A] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pacing tuned
                  </span>
                </div>
              </div>

              {/* Feature 2: Authentic Community Stays (Span 5) */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[#C26D38] text-xs font-semibold bg-[#FFDBC9]/50 px-2.5 py-1 rounded-md mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C26D38]" />
                    <span>Direct host partnerships</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#131B2E]">
                    Community homestays & heritage stays
                  </h3>
                  <p className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                    Stay with local families, coffee planters, and generational hosts with home-cooked meals included.
                  </p>
                </div>

                {/* Authentic Spiti stone farmhouse homestay photo */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden my-3 shadow-inner">
                  <img
                    alt="Traditional stone homestay in Kaza, Spiti Valley"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFU8hBJ2lvCMlg2Xq-JSWJp8MzTkW4NL7ZYR1htZHfWvgJcaWIGjXxykzu75PIQKPZ3uQnhwFB4OSPFTH-5jMzjU_NFy0lNgjCn759X9Pw5v4Ty7auuAo_NrNa9nl-AVcOE2JZQb3S7d4yygiKUQvvxp64XpacrEvUKwUnElpGE4YUcnf-3yjtbqE-fSqzZKIvjMC02ZXrUDWl91MR6qrDnv2PyeHt6XWShpjwm-uzYeTfZkC4OhqYFg"
                  />
                  <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[#131B2E] text-[11px] font-semibold shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#006C4A]" />
                    <span>Tenzin's Mountain Homestay • Kaza, Spiti Valley</span>
                  </div>
                </div>

                <div className="bg-[#F2F3FF] p-3 rounded-xl flex items-center justify-between border border-slate-200/60 text-xs">
                  <span className="text-[#4F5D72]">Verified host payout</span>
                  <span className="text-[#006C4A] font-bold">100% direct to host</span>
                </div>
              </div>

              {/* Feature 3: Trip Adjustment & Disruption Handling (Span 12) */}
              <div className="lg:col-span-12 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-5/12 flex flex-col">
                  <div className="inline-flex items-center gap-1.5 text-[#006C4A] text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-md w-fit mb-2 border border-emerald-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006C4A]" />
                    <span>Disruption protection</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#131B2E]">
                    Real-time road & weather recovery
                  </h3>
                  <p className="text-xs text-[#4F5D72] mt-1.5 leading-relaxed">
                    When mountain passes close or landslides occur, Wandr reschedules stays and dispatches vetted local drivers automatically.
                  </p>
                </div>

                <div className="md:w-7/12 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#F2F3FF] rounded-xl border border-slate-200/60">
                    <div className="text-rose-600 text-xs font-bold flex items-center gap-1 mb-1">
                      <Info className="w-3.5 h-3.5" /> Road closure detected
                    </div>
                    <p className="text-xs text-[#131B2E]">
                      Kunzum La pass blocked by snowfall. Re-routed via Shimla corridor.
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                    <div className="text-[#006C4A] text-xs font-bold flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stay & cab updated
                    </div>
                    <p className="text-xs text-[#131B2E]">
                      Checked into Tabo homestay with verified 4x4 driver confirmed.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SAMPLE ITINERARY SPOTLIGHT: REAL SPITI DATA FROM MOCK DATASET          */}
        {/* ========================================================================= */}
        <section id="expeditions" className="w-full bg-[#F2F3FF] px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#006C4A]">
                  Sample generated journey
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#131B2E] mt-1">
                  Spiti Valley: 5 days / 4 nights
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Best season: June to September
                </span>
                <span className="px-3 py-1 rounded-lg bg-white text-[#4F5D72] text-xs font-semibold border border-slate-200 shadow-2xs">
                  2 travelers
                </span>
              </div>
            </div>

            {/* Showcase Card */}
            <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left 7 Cols: Map & Stepper */}
              <div className="lg:col-span-7 flex flex-col p-6 justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-xl text-[#131B2E]">
                        Cold desert monasteries & village homestays
                      </h3>
                      <p className="text-xs text-[#4F5D72] mt-0.5">
                        Gradual altitude pacing, Key Monastery, and Chandratal Lake
                      </p>
                    </div>
                    <span className="font-display font-black text-xl text-[#C26D38]">
                      ₹24,800 <span className="text-xs font-normal text-slate-400">/ total</span>
                    </span>
                  </div>

                  {/* Route Map Graphic with authentic Spiti Valley landscape */}
                  <div
                    className="w-full h-56 bg-cover bg-center rounded-xl relative shadow-inner overflow-hidden mb-4"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD1Wk6G8iqVWt3fhiWhiPF1Ittt76WXw1t7-iNMg5vfxoY3GsfAx3Z-L4tcBdd6tSimUnBlPnt8ee-ml2OuShBOBtAwYbNCNmcFOM3JOFbrWsoBgGPgQXUzVgR2ZVAiMy0w4oR-eeekWRbsol3aTyaApxNvxhWCaCkeoqDZXRz3tJwvlwgjM2mSb4uc5ouFe_T8FUQR_AWxJALAXda1Yw6Zf1vDl_gX1VjxAOfY319ES2P_1UIveqG6fw')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <span className="text-xs font-semibold text-emerald-300 block">
                            Curated route corridor
                          </span>
                          <p className="font-display font-bold text-base">
                            Delhi → Manali → Kaza → Chandratal
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[#131B2E] text-xs font-semibold shadow">
                          Audited sample
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Itinerary Stepper Horizontal */}
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { day: '01', name: 'Manali', desc: 'Overnight Volvo transit' },
                      { day: '02', name: 'Kaza', desc: 'Arrive & check-in' },
                      { day: '03', name: 'Key Gompa', desc: 'Monastery chanting' },
                      { day: '04', name: 'Hikkim', desc: 'Highest post office' },
                      { day: '05', name: 'Chandratal', desc: 'Crescent Moon Lake' },
                    ].map((step) => (
                      <div key={step.day} className="bg-[#F2F3FF] p-2.5 rounded-xl border border-slate-200/60 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-[#4F5D72]">Day {step.day}</span>
                        <span className="font-display font-bold text-xs text-[#131B2E] mt-0.5">{step.name}</span>
                        <span className="text-[10px] text-[#006C4A] mt-0.5 leading-tight truncate w-full">
                          {step.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-[#4F5D72] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#006C4A]" /> Verified community homestay included
                  </span>
                  <div className="px-3 py-1 rounded-lg bg-[#F2F3FF] border border-slate-200/60 text-[#131B2E] text-xs font-bold flex items-center gap-1.5 select-none">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#006C4A]" />
                    <span>Audited sample route</span>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Transparent Tariff Ledger from Real Data */}
              <div className="lg:col-span-5 bg-[#FAF8FF] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#C26D38]">
                      Transparent cost breakdown
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-[#006C4A] text-xs font-semibold border border-slate-200 shadow-2xs">
                      Zero markups
                    </span>
                  </div>

                  {/* Ledger Breakdown Items (Matching stays.json & transport.json) */}
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <div>
                        <span className="font-display font-bold text-xs text-[#131B2E] block">
                          Tenzin's Mountain Homestay (4 nights)
                        </span>
                        <span className="text-[11px] text-[#4F5D72]">Kaza, Spiti Valley (₹800/night x 2 guests)</span>
                      </div>
                      <span className="font-display font-bold text-sm text-[#131B2E]">₹6,400</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <div>
                        <span className="font-display font-bold text-xs text-[#131B2E] block">
                          Round-trip transport (2 travelers)
                        </span>
                        <span className="text-[11px] text-[#4F5D72]">HRTC Volvo semi-sleeper + local cab</span>
                      </div>
                      <span className="font-display font-bold text-sm text-[#131B2E]">₹9,600</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <div>
                        <span className="font-display font-bold text-xs text-[#131B2E] block">
                          Local meals & traditional cuisine
                        </span>
                        <span className="text-[11px] text-[#4F5D72]">Fresh thukpa, momos, butter tea</span>
                      </div>
                      <span className="font-display font-bold text-sm text-[#131B2E]">₹5,000</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      <div>
                        <span className="font-display font-bold text-xs text-[#131B2E] block">
                          Activities & local entry
                        </span>
                        <span className="text-[11px] text-[#4F5D72]">Chandratal permit, Key Monastery, Hikkim post</span>
                      </div>
                      <span className="font-display font-bold text-sm text-[#131B2E]">₹3,800</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 shadow-2xs">
                      <div>
                        <span className="font-display font-bold text-xs text-[#006C4A] block">
                          Wandr platform fee
                        </span>
                        <span className="text-[11px] text-emerald-700">Autonomous planning & trip adjustment</span>
                      </div>
                      <span className="font-display font-black text-sm text-[#006C4A]">₹0</span>
                    </div>
                  </div>

                  {/* Summary Total Envelope */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[#4F5D72] text-xs font-semibold">
                      <span>Total estimated cost</span>
                      <span className="text-[#006C4A]">Within ₹30,000 budget</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-display font-black text-2xl text-[#131B2E]">₹24,800</span>
                      <span className="text-xs text-[#4F5D72]">For 2 travelers • All included</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/planning', {
                        state: {
                          destination: 'Spiti Valley',
                          days: 5,
                          people: 2,
                          budget: 30000,
                          prompt: '5 days in Spiti Valley for 2 travelers with direct village homestays under ₹30,000',
                        },
                      });
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                  >
                    <span>Customize this itinerary in planner</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="block text-center text-[11px] text-[#4F5D72] mt-2">
                    Itemized from verified partner rates in Himachal Pradesh
                  </span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CTA SECTION: DIRECT LINK TO PLANNER                                    */}
        {/* ========================================================================= */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-14 bg-[#FAF8FF]">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col max-w-lg">
              <span className="text-xs font-semibold text-[#C26D38] mb-1">
                Autonomous trip planning
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#131B2E]">
                Ready to plan your next Indian journey?
              </h2>
              <p className="text-xs sm:text-sm text-[#4F5D72] mt-2 leading-relaxed">
                Create a tailored, day-by-day itinerary with community stays, local transit, and real-time support.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#4F5D72]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006C4A]" /> Coorg
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006C4A]" /> Spiti Valley
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006C4A]" /> Meghalaya
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#006C4A]" /> Udaipur
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/planning')}
              className="w-full md:w-auto px-7 py-3.5 rounded-2xl bg-[#C26D38] hover:bg-[#A85A2A] text-white font-display font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 whitespace-nowrap"
            >
              <span>Launch trip planner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#F2F3FF] py-8 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#4F5D72]">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-base tracking-tight text-[#131B2E] uppercase">
              Wandr<span className="text-[#C26D38]">.</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>Autonomous trip planning for India</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium">
            <Link to="/planning" className="hover:text-[#131B2E] transition-colors">Trip planner</Link>
            <a href="#destinations" className="hover:text-[#131B2E] transition-colors">Destinations</a>
            <a href="#how-it-works" className="hover:text-[#131B2E] transition-colors">How it works</a>
            <span className="text-slate-400">© 2026 Wandr</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
