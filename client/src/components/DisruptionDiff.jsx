import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Plane,
  Train,
  Building2,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

export default function DisruptionDiff({
  oldItinerary,
  newItinerary,
  disruptionEvent = {
    title: 'Transit Cancellation Alert',
    reason: 'Kalka Shatabdi Express cancelled due to track maintenance.',
    deltaCost: 1200,
    deltaHours: -4,
  },
  onAcceptReroute,
  isAccepting = false,
  onDismiss,
}) {
  const oldTransport = oldItinerary?.selected_transport_outbound || oldItinerary?.day_plans?.[0]?.transport;
  const newTransport = newItinerary?.selected_transport_outbound || newItinerary?.day_plans?.[0]?.transport;

  const oldStay = oldItinerary?.selected_stay || oldItinerary?.day_plans?.[0]?.stay;
  const newStay = newItinerary?.selected_stay || newItinerary?.day_plans?.[0]?.stay;

  const oldTotal = oldItinerary?.cost_breakdown?.total || 21100;
  const newTotal = newItinerary?.cost_breakdown?.total || 22300;
  const diffCost = newTotal - oldTotal;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="w-full max-w-5xl mx-auto space-y-6 animate-subtle-shake"
    >
      {/* Amber Disruption Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#212120] border border-amber-500/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#282725] text-amber-400 border border-amber-500/30 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-wider text-amber-400 font-medium">
                Trip alert · Live route repair
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#282725] border border-[#383533] text-amber-400">
                Alert #904
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#FAF8F5] mt-0.5">
              {disruptionEvent.title || 'Transit cancellation alert'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {disruptionEvent.reason || 'Unexpected operational suspension on outbound route. Alternative route found.'}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-stone-400 hover:text-[#FAF8F5] cursor-pointer self-start sm:self-center"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* ─── LEFT COLUMN: OLD PLAN (Grayscale + Red Strikethrough) ─── */}
        <div className="p-6 rounded-2xl bg-[#212120] backdrop-blur-md border border-[#383533] filter grayscale opacity-75 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#383533] pb-3">
              <span className="text-xs tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                Original booking (cancelled)
              </span>
              <span className="text-xs text-stone-400">
                Cancelled
              </span>
            </div>

            {/* Cancelled Transit Card with Strikethrough */}
            {oldTransport && (
              <div className="p-4 rounded-xl bg-[#282725] border border-[#383533] relative overflow-hidden">
                <div className="absolute -right-6 top-3 rotate-45 bg-rose-600 text-white text-[10px] font-medium px-7 py-0.5 tracking-wider">
                  Cancelled
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
                  <span>Outbound transit</span>
                  <span>·</span>
                  <span>{oldTransport.duration_hours}h</span>
                </div>

                <h4 className="text-base font-bold text-stone-400 line-through decoration-rose-500 decoration-2">
                  {oldTransport.operator} ({oldTransport.mode})
                </h4>

                <p className="text-xs text-stone-400 line-through mt-1">
                  Departure {oldTransport.departure || '07:40'} → Arrival {oldTransport.arrival || '22:00'}
                </p>

                <div className="mt-3 pt-2 border-t border-[#383533] flex justify-between text-xs text-stone-400 line-through">
                  <span>Price per seat</span>
                  <span>₹{oldTransport.price_inr?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Old Lodging Card */}
            {oldStay && (
              <div className="p-4 rounded-xl bg-[#282725] border border-[#383533] text-xs">
                <span className="text-xs text-stone-400">Selected stay</span>
                <h4 className="font-semibold text-stone-300 mt-0.5">{oldStay.name}</h4>
                <div className="text-stone-400 mt-1">₹{oldStay.price_per_night_inr?.toLocaleString('en-IN')}/night</div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#383533] flex items-center justify-between text-xs text-stone-400">
            <span>Original total expenditure</span>
            <span className="text-sm font-bold text-stone-300">₹{oldTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: AGENT'S FIX (Full Color + Delta Highlight) ─── */}
        <div className="p-6 rounded-2xl bg-[#212120] backdrop-blur-md border-2 border-[#DA7756]/80 shadow-xl shadow-black/40 space-y-5 flex flex-col justify-between relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#383533] pb-3">
              <span className="text-xs tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Alternative route found
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#282725] border border-[#383533] text-emerald-400">
                Route protected
              </span>
            </div>

            {/* Repaired Transit Card */}
            {newTransport && (
              <div className="p-4 rounded-xl bg-[#282725] border border-[#383533] relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-[#DA7756] mb-1">
                  <span>Confirmed replacement</span>
                  <span className="px-2 py-0.5 rounded bg-[#212120] border border-[#383533] text-emerald-400 text-xs">
                    4.5 hours faster
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#FAF8F5]">
                  {newTransport.operator} ({newTransport.mode})
                </h4>

                <p className="text-xs text-stone-400 mt-1">
                  Departure {newTransport.departure || '06:00'} → Arrival {newTransport.arrival || '18:00'} · {newTransport.duration_hours}h
                </p>

                <div className="mt-3 pt-2 border-t border-[#383533] flex justify-between text-xs">
                  <span className="text-stone-400">Price per seat</span>
                  <span className="font-bold text-[#DA7756]">₹{newTransport.price_inr?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Repaired / Preserved Lodging */}
            {newStay && (
              <div className="p-3.5 rounded-xl bg-[#282725] border border-[#383533] text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#383533] bg-[#181816]">
                    <img
                      src={newStay.images?.[0] || 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80'}
                      alt={newStay.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-amber-400 block font-medium">Confirmed homestay</span>
                    <h4 className="font-semibold text-[#FAF8F5] mt-0.5 truncate">{newStay.name}</h4>
                    <div className="text-stone-400 mt-0.5 truncate">Host: {newStay.local_owner_name || 'Tenzin Dorje'}</div>
                  </div>
                </div>
                <span className="font-bold text-xs text-amber-400 flex-shrink-0">
                  ₹{newStay.price_per_night_inr?.toLocaleString('en-IN')}/night
                </span>
              </div>
            )}

            {/* Delta Highlight Box */}
            <div className="p-3.5 rounded-xl bg-[#282725] border border-[#383533] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#DA7756]">
                <TrendingUp className="w-4 h-4 text-[#DA7756]" />
                <span>Cost difference:</span>
              </div>
              <span className="font-bold text-[#FAF8F5]">
                {diffCost >= 0 ? `+₹${diffCost.toLocaleString('en-IN')}` : `-₹${Math.abs(diffCost).toLocaleString('en-IN')}`}
                <span className="text-stone-400 text-xs font-normal ml-1">(Within reserve budget)</span>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#383533] flex items-center justify-between text-xs">
            <span className="text-stone-400">New total cost</span>
            <span className="text-lg font-bold text-[#DA7756]">₹{newTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* Sticky Accept Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#212120] border border-[#383533] backdrop-blur-md">
        <div className="text-xs text-stone-400">
          Accepting updates your booking and confirms your replacement seats.
        </div>

        <button
          type="button"
          onClick={onAcceptReroute}
          disabled={isAccepting}
          className="w-full sm:w-auto bg-[#DA7756] hover:bg-[#C96645] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#DA7756]/20 flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer transition-all active:scale-[0.98]"
        >
          {isAccepting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Confirming replacement...</span>
            </>
          ) : (
            <>
              <span>Accept replacement</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
