import React from 'react';
import { Clock, IndianRupee, Leaf, Train, Bus, Car, Footprints, Package } from 'lucide-react';

const MODE_ACCENTS = {
  metro: 'border-l-[#C26D38]',
  bus: 'border-l-[#006C4A]',
  auto: 'border-l-[#D97706]',
  cab: 'border-l-rose-500',
  bike: 'border-l-[#D97706]',
  walk: 'border-l-slate-400'
};

const MODE_ICONS = {
  metro: Train,
  bus: Bus,
  auto: Car,
  cab: Car,
  bike: Car,
  walk: Footprints
};

export default function RouteResults({ routes, selectedId, onSelect }) {
  return (
    <div className="space-y-3 pb-4 font-body">
      {routes.map(route => {
        const isSelected = selectedId === route.id;
        const mainMode = route.mainMode || 'metro';
        const accentBorder = MODE_ACCENTS[mainMode] || 'border-l-[#C26D38]';

        return (
          <div
            key={route.id}
            onClick={() => onSelect(route)}
            className={`cursor-pointer rounded-2xl border-l-4 p-4 transition-all ${accentBorder} ${
              isSelected
                ? 'bg-[#FFF8F3] border-y-[#FFDBC9] border-r-[#FFDBC9] shadow-sm ring-1 ring-[#C26D38]'
                : 'bg-white hover:bg-slate-50 border border-y-slate-200 border-r-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-[#131B2E] text-sm font-display">{route.name}</h4>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {route.is_logistics && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#FFF8F3] text-[#C26D38] border border-[#FFDBC9] font-bold flex items-center gap-1">
                      <Package className="w-2.5 h-2.5" />
                      Logistics Freight {route.payload_capacity_kg ? `(${route.payload_capacity_kg}kg max)` : ''}
                    </span>
                  )}
                  {route.sla_type && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-50 text-blue-700 font-medium">
                      {route.sla_type}
                    </span>
                  )}
                  {route.tags.map(tag => {
                    let badgeColor = 'bg-[#F2F3FF] text-[#4F5D72]';
                    if (tag === 'Best') badgeColor = 'bg-[#FFDBC9]/60 text-[#C26D38] font-bold';
                    if (tag === 'Cheapest') badgeColor = 'bg-[#DEF7EC] text-[#006C4A] font-bold';
                    if (tag === 'Greenest') badgeColor = 'bg-emerald-50 text-emerald-700 font-bold';
                    return (
                      <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${badgeColor}`}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-base font-bold text-[#131B2E] font-mono justify-end">
                  <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-[#C26D38]" />
                  {route.cost}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#64748B] mt-2">
              <span className="flex items-center font-medium">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#64748B]" />
                {route.time} min
              </span>
              <span className="flex items-center font-medium text-[#006C4A]">
                <Leaf className="w-3.5 h-3.5 mr-1 text-[#006C4A]" />
                {(route.co2 || 0).toFixed(2)} kg CO₂
              </span>
            </div>

            {/* Segment Icons Sequence */}
            <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100">
              {route.segments.map((seg, i) => {
                const Icon = MODE_ICONS[seg.type] || Footprints;
                return (
                  <React.Fragment key={seg.id || i}>
                    <div
                      className="w-6 h-6 rounded-lg bg-[#FAF8FF] border border-slate-200 flex items-center justify-center text-[#4F5D72]"
                      title={`${seg.type}: ${seg.from} ➔ ${seg.to}`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    {i < route.segments.length - 1 && (
                      <div className="w-3 h-0.5 bg-slate-300"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
