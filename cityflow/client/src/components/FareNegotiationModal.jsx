import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Bot,
  User,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';

/**
 * AI-Assisted Fare Negotiation Module
 * Protocol:
 * 1. AI evaluates distance, traffic surge & fair wage rate, then proposes an optimized fare.
 * 2. Local driver (simulated auto/cab telematic agent) accepts or counters with rationale.
 * 3. Human-in-the-Loop (HITL) user explicitly reviews and confirms or declines.
 */
export default function FareNegotiationModal({
  isOpen,
  onClose,
  stationName = 'Dwarka Sec 21 Metro',
  destination = 'Connaught Place',
  standardFare = 140,
  onFareAgreed
}) {
  const [stage, setStage] = useState('proposing'); // 'proposing' | 'driver_evaluating' | 'counter_offered' | 'agreed' | 'rejected'
  const [aiProposedFare, setAiProposedFare] = useState(Math.round(standardFare * 0.8)); // 20% optimized discount
  const [driverCounterFare, setDriverCounterFare] = useState(Math.round(standardFare * 0.88));
  const [selectedFare, setSelectedFare] = useState(null);
  const [driverNote, setDriverNote] = useState('Flyover traffic is heavy near Dhaula Kuan. Can do ₹' + Math.round(standardFare * 0.88) + ' for direct drop.');

  useEffect(() => {
    if (isOpen) {
      setStage('proposing');
      setSelectedFare(null);
      const calculatedAiFare = Math.round(standardFare * 0.8);
      const calculatedDriverCounter = Math.round(standardFare * 0.88);
      setAiProposedFare(calculatedAiFare);
      setDriverCounterFare(calculatedDriverCounter);
      setDriverNote(`Flyover traffic is heavy near the intersection. Can do ₹${calculatedDriverCounter} for direct priority drop.`);
    }
  }, [isOpen, standardFare]);

  if (!isOpen) return null;

  const handleAiDispatchProposal = () => {
    setStage('driver_evaluating');
    setTimeout(() => {
      // Driver counters with realistic local nuance
      setStage('counter_offered');
    }, 1200);
  };

  const handleUserAcceptsCounter = () => {
    setSelectedFare(driverCounterFare);
    setStage('agreed');
    if (onFareAgreed) onFareAgreed(driverCounterFare);
  };

  const handleUserAcceptsAi = () => {
    setSelectedFare(aiProposedFare);
    setStage('agreed');
    if (onFareAgreed) onFareAgreed(aiProposedFare);
  };

  const handleUserReject = () => {
    setStage('rejected');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-white border-2 border-[#FFDBC9] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-[#131B2E] flex flex-col space-y-5 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#FFF8F3] text-[#C26D38] border border-[#FFDBC9]">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] font-display">
                AI Fare Negotiation Protocol
              </span>
              <h2 className="text-lg font-bold text-[#131B2E] font-display">
                Last-Mile Dynamic Fare Arbiter
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Route Snapshot */}
        <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-slate-200/90 text-xs flex justify-between items-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Route Segment</div>
            <div className="font-bold text-[#131B2E]">{stationName} ➔ {destination}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Standard Meter Rate</div>
            <div className="font-mono text-sm font-bold line-through text-slate-400">₹{standardFare}</div>
          </div>
        </div>

        {/* ─── STAGE 1: AI PROPOSES ─── */}
        {stage === 'proposing' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-[#FFDBC9] shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C26D38] font-display">
                <Bot className="w-4 h-4" />
                <span>AI Algorithmic Fair-Fare Proposal</span>
              </div>
              <p className="text-xs text-[#4F5D72] leading-relaxed">
                Based on current arterial road congestion, low rain probability, and DMRC feeder benchmarks, CityFlow AI recommends a fair tariff:
              </p>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-extrabold text-[#C26D38] font-mono">₹{aiProposedFare}</span>
                <span className="text-xs text-[#006C4A] font-bold">
                  (Save ₹{standardFare - aiProposedFare} vs unregulated street rate)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiDispatchProposal}
              className="w-full py-3 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all font-display"
            >
              <Sparkles className="w-4 h-4" />
              Transmit AI Offer to Nearby Local Auto Drivers
            </button>
          </div>
        )}

        {/* ─── STAGE 2: DRIVER EVALUATING ─── */}
        {stage === 'driver_evaluating' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#C26D38] animate-spin mx-auto" />
            <div className="text-sm font-bold text-[#131B2E]">Broadcasting Offer to Stand Drivers...</div>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              Pinging verified registered autos at {stationName} stand via telematics channel.
            </p>
          </div>
        )}

        {/* ─── STAGE 3: DRIVER COUNTERS / ACCEPTS ─── */}
        {stage === 'counter_offered' && (
          <div className="space-y-4">
            {/* Driver Counter Card */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-[#D97706] flex items-center justify-center text-xs font-bold">
                    👨‍✈️
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#131B2E] block">Ramesh Yadav (DL 1R B 6214)</span>
                    <span className="text-[10px] text-[#64748B]">★ 4.8 Rating · Bajaj CNG Auto</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-[#D97706] px-2 py-0.5 rounded-full border border-amber-200">
                  DRIVER COUNTER-OFFER
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF8F3] border border-[#FFDBC9] text-xs text-[#4F5D72] italic">
                "{driverNote}"
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-[#64748B]">Driver's Counter Quote:</span>
                <span className="text-2xl font-extrabold text-[#131B2E] font-mono">₹{driverCounterFare}</span>
              </div>
            </div>

            {/* Human-in-the-Loop Action Gate */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] text-[#64748B] font-semibold text-center">
                Human-in-the-Loop Authorization: Choose your action
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleUserAcceptsCounter}
                  className="py-2.5 px-3 rounded-xl bg-[#006C4A] hover:bg-[#005238] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer font-display"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Counter (₹{driverCounterFare})
                </button>
                <button
                  type="button"
                  onClick={handleUserAcceptsAi}
                  className="py-2.5 px-3 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer font-display"
                >
                  Hold Firm (₹{aiProposedFare})
                </button>
              </div>
              <button
                type="button"
                onClick={handleUserReject}
                className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Decline & Switch to Walking / Standard Meter
              </button>
            </div>
          </div>
        )}

        {/* ─── STAGE 4: AGREED & CONFIRMED ─── */}
        {stage === 'agreed' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#DEF7EC] text-[#006C4A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#131B2E] font-display">
                Fare Agreed: ₹{selectedFare}
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Driver Ramesh Yadav assigned · Escrow token generated.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#C26D38] text-white text-xs font-bold font-display shadow-xs cursor-pointer"
            >
              Return to Commute Plan
            </button>
          </div>
        )}

        {/* ─── STAGE 5: REJECTED ─── */}
        {stage === 'rejected' && (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-[#131B2E]">Negotiation Cancelled</div>
            <p className="text-xs text-[#64748B]">Zero penalty. Feeder reset to walking.</p>
          </div>
        )}
      </div>
    </div>
  );
}
