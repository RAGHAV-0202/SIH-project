import React from 'react';
import { Train, Bus, Car, Footprints, Clock, IndianRupee } from 'lucide-react';

const MODE_ICONS = { metro: Train, bus: Bus, auto: Car, cab: Car, bike: Car, walk: Footprints };
const MODE_COLORS = { metro: 'text-[#C26D38]', bus: 'text-[#006C4A]', auto: 'text-[#D97706]', cab: 'text-rose-600', bike: 'text-[#D97706]', walk: 'text-slate-500' };
const MODE_BG = { metro: 'bg-[#C26D38]', bus: 'bg-[#006C4A]', auto: 'bg-[#D97706]', cab: 'bg-rose-600', bike: 'bg-[#D97706]', walk: 'bg-slate-500' };

export default function TransitTimeline({ segments }) {
  if (!segments || segments.length === 0) return null;

  return (
    <div className="relative pl-6 space-y-4 font-body">
      {/* Vertical line connecting nodes */}
      <div className="absolute left-3 top-2 bottom-4 w-0.5 bg-slate-200"></div>

      {segments.map((seg, idx) => {
        const Icon = MODE_ICONS[seg.type] || Footprints;
        const color = MODE_COLORS[seg.type] || 'text-slate-500';
        const bg = MODE_BG[seg.type] || 'bg-slate-500';

        return (
          <div key={seg.id || idx} className="relative">
            {/* Node marker */}
            <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full ${bg} flex items-center justify-center ring-4 ring-white shadow-xs z-10`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>

            <div className="bg-[#FAF8FF] p-3.5 rounded-2xl border border-slate-200 ml-2 shadow-2xs">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#131B2E] font-display">
                      {seg.type}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      {seg.from} ➔ {seg.to}
                    </span>
                  </div>
                  {seg.line && (
                    <div className="mt-1.5">
                      <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 ${color}`}>
                        {seg.line}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right text-xs font-mono text-[#64748B] shrink-0 space-y-1">
                  <div className="flex items-center justify-end font-semibold text-[#131B2E]">
                    <Clock className="w-3 h-3 mr-1 text-[#64748B]" />
                    {seg.duration} min
                  </div>
                  {seg.cost > 0 && (
                    <div className="flex items-center justify-end text-[#006C4A] font-bold">
                      <IndianRupee className="w-3 h-3 mr-0.5" />
                      {seg.cost}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
