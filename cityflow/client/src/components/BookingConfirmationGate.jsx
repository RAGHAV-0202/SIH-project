import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, IndianRupee, ArrowRight, UserCheck, X } from 'lucide-react';

/**
 * Human-in-the-Loop (HITL) Confirmation Gate Component
 * Ensures that NO cost, ticket purchase, driver dispatch,
 * or course divert executes without unambiguous explicit human authorization.
 */
export default function BookingConfirmationGate({
  isOpen,
  onClose,
  title = "Authorize Commute Journey",
  totalCost = 40,
  breakdown = [],
  actionLabel = "Confirm & Authorize Dispatch",
  onConfirm
}) {
  const [authorized, setAuthorized] = useState(false);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (!authorized) return;
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white border-2 border-[#FFDBC9] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-[#131B2E] p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-[#FFF8F3] text-[#C26D38] border border-[#FFDBC9]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] font-display">
                HITL Verification Gate
              </span>
              <h2 className="text-base font-bold text-[#131B2E] font-display">
                {title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost & Operator Audit Breakdown */}
        <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-slate-200/90 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-[#64748B]">
            <span>Transit Stage Breakdown</span>
            <span>Tariff</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[#4F5D72]">
                <span>{item.label}</span>
                <span className="font-mono font-semibold text-[#131B2E]">₹{item.cost}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-[#131B2E]">Total Authorized CapEx</span>
            <span className="text-lg font-extrabold text-[#C26D38] font-mono">₹{totalCost}</span>
          </div>
        </div>

        {/* Human Verification Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FFF8F3] border border-[#FFDBC9] cursor-pointer">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-0.5 accent-[#C26D38] w-4 h-4 rounded cursor-pointer"
          />
          <span className="text-xs text-[#4F5D72] leading-relaxed">
            <strong>Human Authorization:</strong> I have reviewed the journey stages, cancellation policy, and verify this transit/dispatch booking.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!authorized}
            onClick={handleExecute}
            className="flex-2 py-2.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold font-display shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
