import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function ApprovalGate({
  totalCost = 21100,
  budget = 30000,
  budgetRemaining = 8900,
  onApprove,
  onTrimActivities,
  isExecuting = false,
}) {
  const isOverBudget = budgetRemaining < 0;

  return (
    <div className="sticky bottom-4 left-0 right-0 z-30 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      {/* Outer border wrapper */}
      <div className={`relative p-[1px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ${
        isOverBudget ? 'bg-amber-500/40' : 'bg-[#383533]'
      }`}>
        
        {/* Inner glass cockpit bar */}
        <div className="bg-[#212120]/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#383533]">
          
          {/* Left: Financial telemetry */}
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
              isOverBudget
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-[#282725] border-[#383533] text-[#DA7756]'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-300">
                  Review your trip
                </span>
                {isOverBudget ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium">
                    ⚠️ ₹{Math.abs(budgetRemaining).toLocaleString('en-IN')} over budget
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#282725] border border-[#383533] text-emerald-400 text-xs">
                    Within budget
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-2xl font-bold text-[#FAF8F5] tracking-tight">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-300">
                  {isOverBudget
                    ? `of ₹${budget.toLocaleString('en-IN')} budget · ₹${Math.abs(budgetRemaining).toLocaleString('en-IN')} over target`
                    : `of ₹${budget.toLocaleString('en-IN')} budget · ₹${budgetRemaining.toLocaleString('en-IN')} kept in reserve`}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isOverBudget && onTrimActivities && (
              <button
                type="button"
                onClick={onTrimActivities}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
              >
                Trim activities to budget
              </button>
            )}

            <button
              type="button"
              onClick={onApprove}
              disabled={isExecuting}
              className="btn-route w-full sm:w-auto disabled:opacity-50 px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Confirming bookings...</span>
                </>
              ) : (
                <>
                  <span>Approve and book</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
