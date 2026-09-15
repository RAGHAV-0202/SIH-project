import React from 'react';

export default function ExpeditionReviewScene({
  itinerary = {},
  selectedTransport = null,
  selectedStay = null,
  selectedActivities = [],
  budget = 30000,
  people = 2,
  days = 4,
  onConfirm,
  onBack,
}) {
  const [needHomeCab, setNeedHomeCab] = React.useState(false);
  const [needArrivalCab, setNeedArrivalCab] = React.useState(true);
  const [restPacingHours, setRestPacingHours] = React.useState(2.5); // 1 | 2.5 | 4

  const depTime = selectedTransport?.departure || '07:00 AM';
  const arrTime = selectedTransport?.arrival || '01:30 PM';
  const operatorName = selectedTransport?.operator || 'Direct Transit';

  // Calculate recommended home departure time (approx 2h 45m before flight, or 1h 30m before train/bus)
  const isFlight = selectedTransport?.mode?.includes('flight') || operatorName.toLowerCase().includes('flight') || operatorName.toLowerCase().includes('air');
  const bufferMinutes = isFlight ? 165 : 90; // 2h45m for flight, 1.5h for rail/road

  const calculateDepartureTime = (timeStr, subMinutes) => {
    try {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return '04:15 AM';
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3] ? match[3].toUpperCase() : null;

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      let totalMins = hours * 60 + minutes - subMinutes;
      if (totalMins < 0) totalMins += 24 * 60;

      let depH = Math.floor(totalMins / 60);
      const depM = totalMins % 60;
      const ampm = depH >= 12 ? 'PM' : 'AM';
      depH = depH % 12 || 12;

      return `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')} ${ampm}`;
    } catch (e) {
      return '04:15 AM';
    }
  };

  const recommendedHomeLeave = calculateDepartureTime(depTime, bufferMinutes);

  const homeCabCost = needHomeCab ? 650 : 0;
  const arrivalCabCost = needArrivalCab ? 750 : 0;

  const transitCost = (selectedTransport?.price_inr || 2400) * people + homeCabCost + arrivalCabCost;
  const lodgingCost = (selectedStay?.price_per_night_inr || 1200) * days;
  const activitiesCost = selectedActivities.reduce((acc, curr) => acc + (curr.cost_inr || 0), 0);
  const estimatedDailyExpenses = (days || 4) * 600 * people; // Food + local cabs
  const calculatedTotal = transitCost + lodgingCost + activitiesCost + estimatedDailyExpenses;
  const reserveSurplus = Math.max(0, budget - calculatedTotal);

  return (
    <div className="w-full max-w-[1360px] mx-auto flex flex-col gap-6 pb-28 select-none font-['Geist']">

      {/* Editorial Stage Intro Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#DAE2FD]/80">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase text-[#914714] tracking-widest font-['Geist']">
              Stage 05 — Expedition Lock & Synthesis
            </span>
            <span className="bg-[#82F5C1] text-[#002114] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              Expedition Ready
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] tracking-tight">
            Your Himalayan Expedition Blueprint
          </h1>
          <p className="text-xs sm:text-sm text-[#4F5D72] leading-relaxed">
            Every leg, verified village homestay, and door-to-door transition has been orchestrated against your safety envelope.
          </p>
        </div>

        {/* Quick Budget Compliance Badge */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#DAE2FD]/80 shadow-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#4F5D72] block">Total Expedition Cap-Ex</span>
            <span className="text-2xl font-extrabold text-[#131B2E]">₹{calculatedTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-px h-8 bg-[#DAE2FD]" />
          <div>
            <span className="text-[10px] font-bold uppercase text-[#4F5D72] block">Safety Reserve Kept</span>
            <span className="text-2xl font-extrabold text-[#006C4A]">₹{reserveSurplus.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Bento Grid: Assembled Expedition Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. Transit, Concierge & Basecamp Pillar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* ─── LIVE AGENTIC CONCIERGE: Door-to-Door Transition Protocol ─── */}
          <div className="bg-gradient-to-br from-[#FFF8F3] via-white to-[#F2F3FF] rounded-3xl p-6 border-2 border-[#FFDBC9] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#DAE2FD]/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#914714] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">door_front</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#914714] tracking-wider block">
                      Autonomous Concierge
                    </span>
                    <span className="bg-[#82F5C1]/30 text-[#006C4A] text-[10px] font-bold px-2 py-0.2 rounded">
                      Door-to-Door
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#131B2E]">
                    Your Day 1 Hand-Off & Rest Pacing Protocol
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold text-[#914714] bg-[#FFDBC9]/70 px-2.5 py-1 rounded-lg">
                ⚡ Active Assistant
              </span>
            </div>

            {/* Step 1: Home Departure & Airport/Station Cab */}
            <div className="p-4 bg-white rounded-2xl border border-[#DAE2FD]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#914714] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-[#131B2E]">Departure Logistics (Home → Terminal)</span>
                </div>
                <p className="text-xs text-[#4F5D72] pl-7">
                  {operatorName} departs at <strong className="text-[#131B2E]">{depTime}</strong>. Leave your home by <strong className="text-[#914714] bg-[#FFDBC9]/50 px-1.5 py-0.5 rounded font-bold">{recommendedHomeLeave}</strong> to clear traffic & security seamlessly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNeedHomeCab(!needHomeCab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 self-end sm:self-center shrink-0 ${
                  needHomeCab
                    ? 'bg-[#006C4A] text-white shadow-xs'
                    : 'bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] border border-[#DAE2FD]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {needHomeCab ? 'check_circle' : 'local_taxi'}
                </span>
                <span>{needHomeCab ? 'Home Cab Reserved (₹650)' : '+ Book Pickup Cab'}</span>
              </button>
            </div>

            {/* Step 2: Arrival Gate & Homestay Driver Sync */}
            <div className="p-4 bg-white rounded-2xl border border-[#DAE2FD]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006C4A] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-[#131B2E]">Touchdown & Homestay Transfer</span>
                </div>
                <p className="text-xs text-[#4F5D72] pl-7">
                  Arrival at <strong className="text-[#131B2E]">{arrTime}</strong>. Pre-assigned verified mountain driver will meet you with a Wandr nameboard for direct drop to your basecamp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNeedArrivalCab(!needArrivalCab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 self-end sm:self-center shrink-0 ${
                  needArrivalCab
                    ? 'bg-[#006C4A] text-white shadow-xs'
                    : 'bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] border border-[#DAE2FD]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {needArrivalCab ? 'check_circle' : 'airport_shuttle'}
                </span>
                <span>{needArrivalCab ? 'Arrival Taxi Synced (₹750)' : '+ Sync Arrival Cab'}</span>
              </button>
            </div>

            {/* Step 3: Interactive Rest & Recovery Pacing Buffer */}
            <div className="p-4 bg-white rounded-2xl border border-[#DAE2FD]/70 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#131B2E] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-[#131B2E]">Physiological Rest Buffer at Basecamp</span>
                </div>
                <span className="text-[11px] font-semibold text-[#006C4A]">
                  Day 1 starts ~{restPacingHours}h after check-in
                </span>
              </div>
              <p className="text-xs text-[#4F5D72] pl-7">
                How long would you like to unpack, take tea, and rest before your first activity?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-7 pt-1">
                {[
                  { hours: 1, label: '⚡ 1h Quick Refresh', sub: 'Hit the town early' },
                  { hours: 2.5, label: '☕ 2.5h Chai & Nap', sub: 'Recommended for altitude' },
                  { hours: 4, label: '🌙 Evening Unwind', sub: 'Relaxed slow start' },
                ].map((pill) => (
                  <button
                    key={pill.hours}
                    type="button"
                    onClick={() => setRestPacingHours(pill.hours)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      restPacingHours === pill.hours
                        ? 'bg-[#131B2E] text-white border-[#131B2E] shadow-sm'
                        : 'bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] border-[#DAE2FD]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{pill.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${restPacingHours === pill.hours ? 'text-slate-300' : 'text-[#4F5D72]'}`}>
                      {pill.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transit Vector Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#DAE2FD]/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DAE2FD]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFDBC9] text-[#914714] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">directions_transit</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#914714] tracking-wider block">Stage 02 Selection</span>
                  <h3 className="text-base font-bold text-[#131B2E]">Inbound & Mountain Transit</h3>
                </div>
              </div>
              <span className="text-xs font-bold text-[#006C4A] bg-[#82F5C1]/20 px-2.5 py-1 rounded-lg border border-[#82F5C1]/40">
                Confirmed Corridor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F2F3FF] rounded-xl">
                <span className="text-[#4F5D72] block text-[10px] font-semibold uppercase">Operator</span>
                <strong className="text-[#131B2E] text-sm">{selectedTransport?.operator || 'Alliance Air + 4x4'}</strong>
              </div>
              <div className="p-3 bg-[#F2F3FF] rounded-xl">
                <span className="text-[#4F5D72] block text-[10px] font-semibold uppercase">Pacing & Duration</span>
                <strong className="text-[#131B2E] text-sm">{selectedTransport?.duration_hours || 12}h Transit</strong>
              </div>
              <div className="p-3 bg-[#F2F3FF] rounded-xl">
                <span className="text-[#4F5D72] block text-[10px] font-semibold uppercase">Transit Spend ({people} seats)</span>
                <strong className="text-[#131B2E] text-sm">₹{transitCost.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Homestay Habitat Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#DAE2FD]/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DAE2FD]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAEDFF] text-[#006C4A] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">holiday_village</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#006C4A] tracking-wider block">Stage 03 Selection</span>
                  <h3 className="text-base font-bold text-[#131B2E]">Verified Village Basecamp</h3>
                </div>
              </div>
              <span className="text-xs font-bold text-[#914714] bg-[#FFDBC9]/50 px-2.5 py-1 rounded-lg border border-[#FFDBC9]">
                100% Direct Dividend
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#F2F3FF] rounded-2xl">
              <div>
                <h4 className="text-base font-bold text-[#131B2E]">{selectedStay?.name || "Tenzin's Mountain Homestay"}</h4>
                <p className="text-xs text-[#4F5D72] mt-0.5">
                  Host: {selectedStay?.local_owner_name || 'Resident Family Host'} · Bukhari Heating · Solar Hot Water
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#4F5D72] block font-semibold uppercase">{days} Nights Total</span>
                <span className="text-base font-black text-[#131B2E]">₹{lodgingCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Curated Experiences Summary */}
          <div className="bg-white rounded-3xl p-6 border border-[#DAE2FD]/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#DAE2FD]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFDBC9] text-[#914714] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#914714] tracking-wider block">Stage 04 Selection</span>
                  <h3 className="text-base font-bold text-[#131B2E]">Curated Experience Itinerary</h3>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#4F5D72]">
                {selectedActivities.length} Experiences Locked
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedActivities.map((act, idx) => (
                <div key={act.id || idx} className="flex items-center justify-between p-3 bg-[#FAF8FF] rounded-xl border border-[#DAE2FD]/40 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#006C4A] text-white flex items-center justify-center text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#131B2E]">{act.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#4F5D72]">
                    <span>{act.duration_hours}h</span>
                    <span className="font-bold text-[#131B2E]">
                      {act.cost_inr === 0 ? 'Complimentary' : `₹${act.cost_inr}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. Cap-Ex Breakdown & Safety Sentinel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Financial Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#DAE2FD]/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#131B2E] border-b border-[#DAE2FD]/40 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#914714]">payments</span>
              <span>Expedition Cap-Ex Breakdown</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#DAE2FD]/20">
                <span className="text-[#4F5D72]">Mountain Transit ({people} travelers)</span>
                <span className="font-bold text-[#131B2E]">₹{transitCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DAE2FD]/20">
                <span className="text-[#4F5D72]">Village Homestay ({days} nights)</span>
                <span className="font-bold text-[#131B2E]">₹{lodgingCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DAE2FD]/20">
                <span className="text-[#4F5D72]">Curated Activities & Community Guides</span>
                <span className="font-bold text-[#131B2E]">₹{activitiesCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#DAE2FD]/20">
                <span className="text-[#4F5D72]">Estimated Food & Local Transit</span>
                <span className="font-bold text-[#131B2E]">₹{estimatedDailyExpenses.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="text-[#131B2E]">Total Committed</span>
                <span className="text-[#131B2E]">₹{calculatedTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 bg-[#82F5C1]/20 rounded-2xl border border-[#82F5C1]/40 flex items-center justify-between text-xs">
                <span className="font-bold text-[#006C4A]">Safety Contingency Reserve</span>
                <span className="font-extrabold text-[#006C4A]">₹{reserveSurplus.toLocaleString('en-IN')} Remaining</span>
              </div>
            </div>
          </div>

          {/* Autonomous Sentinel Protections */}
          <div className="bg-white rounded-3xl p-6 border border-[#DAE2FD]/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#131B2E] border-b border-[#DAE2FD]/40 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#006C4A]">shield_with_heart</span>
              <span>Mountain Trip Protections</span>
            </h3>

            <div className="space-y-3 text-xs text-[#4F5D72]">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#006C4A] shrink-0">check_circle</span>
                <p><strong className="text-[#131B2E]">Thoughtfully Paced for Altitude Safety:</strong> Day 1 buffer applied for gentle acclimatization before high passes.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#006C4A] shrink-0">check_circle</span>
                <p><strong className="text-[#131B2E]">100% Direct Village Dividend:</strong> Zero aggregator markups. Funds go directly to host families and local drivers.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-[#006C4A] shrink-0">check_circle</span>
                <p><strong className="text-[#131B2E]">24/7 Mountain SOS Sentinel:</strong> Pre-linked emergency oxygen stations, local police, and medical clinics.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Action Execution Bar (Final Launch) */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-[1360px] mx-auto flex justify-end">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-[#DAE2FD]/80 flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col pr-4 border-r border-[#DAE2FD]">
              <span className="font-['Geist'] text-[10px] font-semibold text-[#4F5D72] uppercase tracking-wider">
                Expedition Status
              </span>
              <span className="font-['Geist'] text-xs font-semibold text-[#006C4A]">
                ✓ All Constraints Synthesized
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="bg-[#006C4A] hover:bg-[#005137] active:scale-98 text-white px-6 sm:px-8 py-3 rounded-xl font-['Geist'] text-xs font-semibold flex items-center gap-2.5 shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                <span>Lock Expedition & Launch Dashboard FlightDeck</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
