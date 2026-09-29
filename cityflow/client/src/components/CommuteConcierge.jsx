import React, { useState } from 'react';
import {
  Clock,
  Home,
  MapPin,
  Car,
  Bike,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Handshake,
  UserCheck
} from 'lucide-react';
import FareNegotiationModal from './FareNegotiationModal';
import BookingConfirmationGate from './BookingConfirmationGate';

export default function CommuteConcierge({
  route,
  origin = 'Dwarka Sec 21',
  destination = 'Connaught Place',
  targetArrival = '09:00 AM',
  onOpenOfflinePass
}) {
  const [firstMileMode, setFirstMileMode] = useState('auto'); // 'walk' | 'auto' | 'erickshaw'
  const [lastMileMode, setLastMileMode] = useState('auto');   // 'walk' | 'auto' | 'bike'
  const [pacingBufferMinutes, setPacingBufferMinutes] = useState(15); // 5 | 15 | 30

  // AI Fare Negotiation states
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [negotiatedFare, setNegotiatedFare] = useState(null);

  // Human-in-the-Loop Confirmation Gate
  const [isHitlGateOpen, setIsHitlGateOpen] = useState(false);

  if (!route) return null;

  // Calculate recommended home departure time
  const calculateLeaveHomeTime = (arrivalTimeStr, travelMinutes, bufferMins) => {
    try {
      const match = arrivalTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      let hours = match ? parseInt(match[1], 10) : 9;
      let minutes = match ? parseInt(match[2], 10) : 0;
      const meridiem = match && match[3] ? match[3].toUpperCase() : 'AM';

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      let totalMins = hours * 60 + minutes - (travelMinutes + bufferMins);
      if (totalMins < 0) totalMins += 24 * 60;

      let depH = Math.floor(totalMins / 60);
      const depM = totalMins % 60;
      const ampm = depH >= 12 ? 'PM' : 'AM';
      depH = depH % 12 || 12;

      return `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')} ${ampm}`;
    } catch (e) {
      return '08:05 AM';
    }
  };

  const travelTime = route.time || 45;
  const leaveHomeTime = calculateLeaveHomeTime(targetArrival, travelTime, pacingBufferMinutes);

  const firstMileCosts = { walk: 0, erickshaw: 20, auto: 40 };
  const lastMileCosts = { walk: 0, bike: 25, auto: negotiatedFare || 45 };

  const firstMileFee = firstMileCosts[firstMileMode] || 0;
  const lastMileFee = lastMileCosts[lastMileMode] || 0;
  const totalAdjustedCost = (route.cost || 40) + firstMileFee + lastMileFee;

  // Prepare line-item CapEx breakdown for Human-in-the-Loop gate
  const costBreakdown = [
    { label: `First-Mile: ${firstMileMode.toUpperCase()} (${origin})`, cost: firstMileFee },
    { label: `Core Transit: ${route.name}`, cost: route.cost || 40 },
    { label: `Last-Mile: ${lastMileMode.toUpperCase()}${negotiatedFare ? ' (AI Negotiated)' : ''}`, cost: lastMileFee },
  ];

  return (
    <div className="bg-white border-2 border-[#FFDBC9] rounded-3xl p-6 shadow-xs space-y-5 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] bg-[#FFDBC9]/50 px-2.5 py-0.5 rounded-full font-display">
              Door-to-Door Concierge Protocol
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#006C4A] bg-[#DEF7EC] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <UserCheck className="w-3.5 h-3.5" />
              HITL Guard Enforced
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#131B2E] mt-1 font-display">
            Autonomous Commute Synchronization
          </h2>
          <p className="text-xs text-[#64748B]">
            Synchronizes first-mile feeder, core transit corridor, and last-mile connection.
          </p>
        </div>

        {/* Departure Countdown Alarm Pill */}
        <div className="flex items-center gap-3 bg-[#FFF8F3] p-3.5 rounded-2xl border border-[#FFDBC9]">
          <div className="w-8 h-8 rounded-xl bg-[#C26D38] text-white flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Leave House By</div>
            <div className="text-lg font-bold text-[#131B2E] font-mono">{leaveHomeTime}</div>
          </div>
        </div>
      </div>

      {/* 3-Step Concierge Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: First-Mile Feeder */}
        <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5 font-display">
              <Home className="w-4 h-4 text-[#C26D38]" />
              1. First-Mile Feeder
            </span>
            <span className="text-xs font-mono text-[#006C4A] font-bold">+₹{firstMileFee}</span>
          </div>
          <p className="text-xs text-[#64748B]">Doorstep to nearest transit station.</p>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'walk', label: 'Walk', price: '₹0' },
              { id: 'erickshaw', label: 'E-Rickshaw', price: '₹20' },
              { id: 'auto', label: 'Auto', price: '₹40' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setFirstMileMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  firstMileMode === m.id
                    ? 'bg-[#C26D38] text-white shadow-xs'
                    : 'bg-white text-[#4F5D72] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m.label} ({m.price})
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Core Transit Corridor */}
        <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-[#FFDBC9] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5 font-display">
              <ShieldCheck className="w-4 h-4 text-[#006C4A]" />
              2. Core Transit Backbone
            </span>
            <span className="text-xs font-mono text-[#C26D38] font-bold">{route.time} min</span>
          </div>
          <div className="text-xs text-[#131B2E] font-bold">{route.name}</div>
          <div className="text-[11px] text-[#64748B] line-clamp-1">
            {route.summary || 'Express multimodal transit network'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#006C4A] pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006C4A]" />
            <span>Guaranteed transit priority & gate pass</span>
          </div>
        </div>

        {/* Step 3: Last-Mile Connect + AI Negotiation */}
        <div className="p-4 rounded-2xl bg-[#FAF8FF] border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5 font-display">
              <MapPin className="w-4 h-4 text-rose-500" />
              3. Last-Mile Connect
            </span>
            <span className="text-xs font-mono text-[#006C4A] font-bold">+₹{lastMileFee}</span>
          </div>
          <p className="text-xs text-[#64748B]">Station exit to final destination.</p>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'walk', label: 'Walk', price: '₹0' },
              { id: 'bike', label: 'Rapido Bike', price: '₹25' },
              { id: 'auto', label: negotiatedFare ? `Auto (₹${negotiatedFare})` : 'Auto', price: negotiatedFare ? `₹${negotiatedFare}` : '₹45' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setLastMileMode(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  lastMileMode === m.id
                    ? 'bg-[#006C4A] text-white shadow-xs'
                    : 'bg-white text-[#4F5D72] hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* AI Fare Negotiation Trigger */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsNegotiationOpen(true)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-[#D97706] hover:text-[#B45309] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>{negotiatedFare ? `Negotiated Rate: ₹${negotiatedFare} (Re-negotiate)` : 'Negotiate Last-Mile Auto Fare with AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pacing Buffer Control & Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#4F5D72] font-display">Transit Buffer:</span>
          <div className="flex items-center gap-1.5">
            {[
              { mins: 5, label: '5m (Rapid)' },
              { mins: 15, label: '15m (Balanced)' },
              { mins: 30, label: '30m (Relaxed)' }
            ].map(b => (
              <button
                key={b.mins}
                type="button"
                onClick={() => setPacingBufferMinutes(b.mins)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  pacingBufferMinutes === b.mins
                    ? 'bg-[#C26D38] text-white font-bold shadow-xs'
                    : 'bg-[#F2F3FF] text-[#4F5D72] hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] uppercase text-[#64748B] font-bold block">Door-to-Door Cap</span>
            <span className="text-lg font-bold text-[#131B2E] font-mono">₹{totalAdjustedCost}</span>
          </div>

          {/* Enforces Human-in-the-Loop Confirmation Gate before pass issuance */}
          <button
            type="button"
            onClick={() => setIsHitlGateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2 font-display"
          >
            <ShieldCheck className="w-4 h-4" />
            Review & Issue Pass (HITL)
          </button>
        </div>
      </div>

      {/* AI Fare Negotiation Modal */}
      <FareNegotiationModal
        isOpen={isNegotiationOpen}
        onClose={() => setIsNegotiationOpen(false)}
        stationName={route.summary || `${destination} Metro`}
        destination={destination}
        standardFare={45}
        onFareAgreed={(fare) => {
          setNegotiatedFare(fare);
          setLastMileMode('auto');
        }}
      />

      {/* Human-in-the-Loop Confirmation Gate */}
      <BookingConfirmationGate
        isOpen={isHitlGateOpen}
        onClose={() => setIsHitlGateOpen(false)}
        title="Human Authorization: Issue Transit Pass"
        totalCost={totalAdjustedCost}
        breakdown={costBreakdown}
        actionLabel="Authorize & Generate Offline Pass"
        onConfirm={onOpenOfflinePass}
      />
    </div>
  );
}
