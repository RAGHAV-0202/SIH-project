import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  PlaneTakeoff,
  Train,
  Building,
  Compass,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Terminal,
  Layers
} from 'lucide-react';

const STEP_ICONS = {
  intent: Bot,
  transport: PlaneTakeoff,
  stay: Building,
  activity: Compass,
  optimizer: Sparkles,
  disruption: ShieldAlert,
};

export default function ReasoningStream({
  steps = [],
  isStreaming = false,
  isCollapsed = false,
  activeStepKey = null,
  latencyMs = 45,
}) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom as new reasoning blocks arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [steps]);

  const completedCount = steps.filter(s => s.status === 'complete').length;
  const totalCount = steps.length || 5;
  const activeStep = steps.find(s => s.status === 'running');
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // ─── COLLAPSED MODE — compact strip shown during transport or stay decision ──
  // Renders a thin progress strip instead of the full 5-item panel.
  if (isCollapsed && steps.length > 0) {
    const isStayDecision = activeStepKey === 'stay' || (steps[1]?.status === 'complete' && steps[2]?.status !== 'complete');
    const currentStepNum = isStayDecision ? 3 : 2;
    const currentStepTitle = isStayDecision ? "Choose your basecamp lodging" : "Choose how you'll get there";
    const currentStepDesc = isStayDecision
      ? "Curating verified homestays with authentic local host family priority. Select your lodging on the right to resume the agent pipeline."
      : "Evaluating routes across rail, road, and air. Select your preferred transit option on the right to resume the agent pipeline.";
    const remainingCount = isStayDecision ? 2 : 3;
    const remainingLabel = isStayDecision ? "Activities · Budget" : "Lodging · Activities · Budget";

    return (
      <motion.aside
        key="collapsed"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 h-full bg-white/85 backdrop-blur-md border-r border-slate-200/80 z-20 select-none overflow-hidden flex flex-col justify-between p-5 shadow-xs"
      >
        <div>
          {/* Progress strip header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DA7756] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DA7756]" />
            </span>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#DA7756]" />
              Trip Planning Progress
            </span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-[#DA7756] border border-amber-200/80 font-medium">
              Paused
            </span>
          </div>

          {/* Thin progress bar */}
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-[#DA7756] to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                Step {currentStepNum} of {totalCount}
              </span>
              <span className="text-[#DA7756] font-medium">
                Waiting for choice
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DA7756]" />
                {currentStepTitle}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {currentStepDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Footer remaining info */}
        <div className="pt-3 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Remaining steps:</span>
          <span className="font-medium text-slate-700">{remainingCount} ({remainingLabel})</span>
        </div>
      </motion.aside>
    );
  }

  // ─── FULL MODE: Standard 5-step view ─────────────────────────────────────────
  return (
    <motion.aside
      key="full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 h-full bg-white/85 backdrop-blur-md border-r border-slate-200/80 z-20 select-none overflow-hidden flex flex-col justify-between shadow-xs"
    >
      {/* Cockpit Header */}
      <div className="p-4 border-b border-slate-200/80 bg-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isStreaming ? 'bg-[#DA7756]' : 'bg-emerald-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreaming ? 'bg-[#DA7756]' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#DA7756]" />
              Trip Planning Progress
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${
              isStreaming
                ? 'bg-amber-50 border-amber-200 text-[#DA7756] animate-pulse'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {isStreaming ? 'Thinking...' : 'Active'}
            </span>
          </div>
        </div>

        {/* Verification Checkpoint Microbar */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 bg-emerald-50/70 border border-emerald-200/60 px-3 py-1.5 rounded-xl mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-800 font-bold">Altitude-Safe Verification</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span>5 Steps Verified</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span className="font-medium text-slate-600">Planning Checklist</span>
          <span className="font-semibold text-emerald-700">
            {completedCount} of {totalCount} completed
          </span>
        </div>
      </div>

      {/* Reasoning Blocks Stream (Vertical Timeline) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {steps.map((step, idx) => {
            const Icon = STEP_ICONS[step.key] || Bot;
            const isRunning = step.status === 'running';
            const isComplete = step.status === 'complete';
            const isFailed = step.status === 'failed';
            const isPending = !isRunning && !isComplete && !isFailed;

            return (
              <motion.div
                key={step.key || idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isRunning
                    ? 'bg-orange-50/50 border-[#DA7756] ring-2 ring-[#DA7756]/20 shadow-sm'
                    : isComplete
                    ? 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
                    : isPending
                    ? 'bg-slate-50/60 border-slate-200/60 opacity-65'
                    : 'bg-red-50/60 border-red-300'
                }`}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${
                      isRunning
                        ? 'bg-white text-[#DA7756] border border-[#DA7756]/30 shadow-xs'
                        : isComplete
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : isPending
                        ? 'bg-slate-100 text-slate-400 border border-slate-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {isRunning ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DA7756]" />
                      ) : isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      {step.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Step {idx + 1}
                  </span>
                </div>

                {/* Plain-Language Thought / Details */}
                {step.detail && (
                  <div className="mt-1 pl-7 text-xs text-slate-600 leading-relaxed break-words">
                    {step.detail}
                  </div>
                )}

                {/* Execution Payload Highlight */}
                {step.data && (
                  <div className="mt-2 pl-7 flex flex-wrap gap-1.5 text-xs">
                    {Object.entries(step.data).slice(0, 3).map(([k, v]) => {
                      const isNegativeBuffer = k === 'buffer' && typeof v === 'number' && v < 0;
                      return (
                        <span
                          key={k}
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                            isNegativeBuffer
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-slate-50 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          {k === 'days'
                            ? `${v} days`
                            : isNegativeBuffer
                            ? `⚠️ Over budget: ₹${Math.abs(v).toLocaleString('en-IN')}`
                            : (['budget', 'price', 'rate', 'total', 'cost', 'buffer'].some(word => k.toLowerCase().includes(word)) && typeof v === 'number')
                            ? `${k === 'budget' ? 'Budget' : k === 'buffer' ? 'Reserve' : k}: ₹${v.toLocaleString('en-IN')}`
                            : `${k}: ${v}`}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="mt-2.5 pl-7 flex items-center justify-between text-xs">
                  <span className={`text-[11px] font-medium ${
                    isRunning
                      ? 'text-[#DA7756] animate-pulse'
                      : isComplete
                      ? 'text-emerald-600'
                      : isPending
                      ? 'text-slate-400'
                      : 'text-red-600'
                  }`}>
                    {isRunning ? 'Working...' : isComplete ? 'Complete' : isPending ? 'Waiting' : 'Failed'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {steps.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 text-xs space-y-2">
            <Layers className="w-6 h-6 text-slate-300 animate-pulse" />
            <span>Ready to plan your trip</span>
          </div>
        )}
      </div>

      {/* Stream Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-white/90 text-xs text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DA7756]" />
          Smart route optimization
        </span>
        <span className="text-slate-500 font-medium">
          {completedCount} / {totalCount} steps
        </span>
      </div>
    </motion.aside>
  );
}
