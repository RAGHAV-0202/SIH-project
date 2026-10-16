import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Bot,
  Train,
  Bus,
  Home,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Wallet,
  Activity,
  Users
} from 'lucide-react';

const AGENT_STREAM_STEPS = [
  {
    agent: 'IntentParser',
    icon: Bot,
    tag: 'Step 1/5',
    headline: 'Decomposing travel parameters & habits',
    log: 'Normalized dates, party size, budget ceiling, and traveler routine constraints.',
    color: 'emerald',
  },
  {
    agent: 'TransportAgent',
    icon: Bus,
    tag: 'Step 2/5',
    headline: 'Scanning live multimodal transit corridors',
    log: 'Connecting to RedBus Volvo & RailRadar IRCTC engines for real schedules.',
    color: 'amber',
  },
  {
    agent: 'StayAgent',
    icon: Home,
    tag: 'Step 3/5',
    headline: 'Curating verified indigenous homestays',
    log: 'Applying +30% local host preference and checking direct community escrow.',
    color: 'blue',
  },
  {
    agent: 'ActivitySentinel',
    icon: Compass,
    tag: 'Step 4/5',
    headline: 'Mapping cultural sights & weather contingencies',
    log: 'Cross-referencing live forecast with indoor heritage alternatives.',
    color: 'purple',
  },
  {
    agent: 'KnapsackOptimizer',
    icon: Sparkles,
    tag: 'Step 5/5',
    headline: 'Synthesizing balanced day-by-day expedition',
    log: 'Satisfying budget headroom, transfer buffers, and morning wake-up pace.',
    color: 'rose',
  },
];

export default function PlanningStreamSkeleton({
  destination = 'Destination',
  origin = 'Delhi',
  days = 4,
  people = 2,
  budget = 25000,
  wakeUpTime = '08:00 AM',
  routineNote = '',
  onCancel = null,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Step progression animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AGENT_STREAM_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const activeStep = AGENT_STREAM_STEPS[currentStepIndex];
  const StepIcon = activeStep.icon;

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      
      {/* ─── Top Live Streaming Agent Telemetry Banner ─── */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 overflow-hidden relative">
        {/* Ambient background glow orb */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        {/* 1. Header Row: Agent Avatar, Status Tags, Timer & Cancel Button */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-[#914714] shadow-xs shrink-0 relative">
              <StepIcon className="w-5 h-5 animate-pulse text-amber-700" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold tracking-wider uppercase shadow-2xs whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agent Stream
              </span>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-700 text-xs font-semibold whitespace-nowrap">
                {activeStep.tag}: {activeStep.agent}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-800 text-xs font-mono font-bold whitespace-nowrap">
                <Clock className="w-3 h-3 text-slate-500" />
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Cancel & Edit</span>
            </button>
          )}
        </div>

        {/* 2. Main Headline & Narrative Description */}
        <div className="pt-4 pb-3 space-y-1 relative z-10">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {activeStep.headline}...
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
            {activeStep.log}
          </p>
        </div>

        {/* 3. Trip Constraints & Context Strip */}
        <div className="pt-2 pb-5 flex flex-wrap items-center gap-2 relative z-10 border-b border-slate-100">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-semibold shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{origin} → {destination}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-semibold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{days} {days === 1 ? 'Day' : 'Days'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-semibold shadow-2xs">
            <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{people} {people === 1 ? 'Traveler' : 'Travelers'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-semibold font-mono shadow-2xs">
            <Wallet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>₹{budget.toLocaleString('en-IN')}</span>
          </div>

          {routineNote && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 font-medium max-w-sm sm:max-w-md shadow-2xs"
              title={routineNote}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">"{routineNote}"</span>
            </div>
          )}
        </div>

        {/* 4. Live Agent Pipeline Stepper Bar */}
        <div className="mt-4 relative z-10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
            <span>Synthesis Pipeline Progress</span>
            <span className="font-mono text-slate-700 font-extrabold">{Math.round(((currentStepIndex + 1) / AGENT_STREAM_STEPS.length) * 100)}% Complete</span>
          </div>

          {/* Animated gradient progress track */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(((currentStepIndex + 1) / AGENT_STREAM_STEPS.length) * 100)}%` }}
            />
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {AGENT_STREAM_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.agent}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold shadow-2xs'
                      : isCurrent
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-50/80 text-slate-400 border border-slate-200/60'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{step.agent}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── High-Fidelity Shimmer Skeleton Screens ─── */}
      <div className="space-y-6">
        
        {/* Section 1 Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-xl animate-pulse hidden sm:block" />
        </div>

        {/* Multimodal Transport Options Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((cardIdx) => (
            <div
              key={cardIdx}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-xs relative overflow-hidden"
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/60 to-transparent" />

              {/* Card top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-emerald-100/60 rounded-full animate-pulse" />
              </div>

              {/* Transit Timing Track */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 w-16 bg-slate-300 rounded animate-pulse font-mono" />
                  <div className="h-2.5 w-10 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-1 px-2">
                  <div className="h-2.5 w-12 bg-slate-200 rounded animate-pulse" />
                  <div className="w-16 h-0.5 bg-slate-200 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-5 w-16 bg-slate-300 rounded animate-pulse font-mono ml-auto" />
                  <div className="h-2.5 w-12 bg-slate-200 rounded animate-pulse ml-auto" />
                </div>
              </div>

              {/* Card Footer: Price & CTA button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="h-2.5 w-14 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-9 w-24 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Verified Local Homestays Skeleton Grid */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-56 bg-slate-200 rounded-md animate-pulse" />
              <div className="h-3.5 w-80 bg-slate-100 rounded-md animate-pulse" />
            </div>
            <div className="h-6 w-32 bg-slate-100 rounded-full animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((stayIdx) => (
              <div
                key={stayIdx}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col sm:flex-row gap-5 shadow-xs relative overflow-hidden"
              >
                {/* Stay thumbnail skeleton */}
                <div className="w-full sm:w-44 h-36 bg-slate-200 rounded-2xl shrink-0 animate-pulse relative">
                  <div className="absolute top-3 left-3 h-5 w-20 bg-white/80 rounded-full" />
                </div>

                {/* Stay details skeleton */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-amber-100 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-5 w-16 bg-slate-100 rounded-md animate-pulse" />
                      <div className="h-5 w-20 bg-slate-100 rounded-md animate-pulse" />
                      <div className="h-5 w-14 bg-slate-100 rounded-md animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Daily Itinerary Timeline Rails Skeleton */}
        <div className="pt-4 space-y-3">
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-3">
            {[1, 2, 3].map((slotIdx) => (
              <div key={slotIdx} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                <div className="h-3.5 w-16 bg-slate-200 rounded animate-pulse font-mono shrink-0" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 h-3.5 bg-slate-100 rounded animate-pulse" />
                <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
