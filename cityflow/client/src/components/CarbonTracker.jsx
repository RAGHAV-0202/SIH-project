import React from 'react';
import { Leaf } from 'lucide-react';

export default function CarbonTracker({ co2 = 0.5 }) {
  // Baseline comparative private car emission for the same distance (~3.8kg CO2)
  const carCO2 = 3.8;
  const safeCo2 = typeof co2 === 'number' ? co2 : parseFloat(co2) || 0.5;
  const saved = Math.max(0, carCO2 - safeCo2).toFixed(2);
  const percentage = Math.min(99, Math.max(10, Math.round((saved / carCO2) * 100)));
  const trees = Math.max(1, Math.ceil(saved / 0.8));

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 flex flex-col items-center text-center h-full justify-center shadow-2xs font-body">
      <div className="relative w-24 h-24 mb-3">
        {/* SVG Circular Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48" cy="48" r="38"
            stroke="currentColor" strokeWidth="7" fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="48" cy="48" r="38"
            stroke="currentColor" strokeWidth="7" fill="transparent"
            strokeDasharray="238.7"
            strokeDashoffset={238.7 - (238.7 * percentage) / 100}
            strokeLinecap="round"
            className="text-[#006C4A] transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Leaf className="w-5 h-5 text-[#006C4A] mb-0.5" />
          <span className="text-sm font-extrabold text-[#131B2E] font-display">{percentage}%</span>
        </div>
      </div>

      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006C4A] font-display block">
        Environmental Dividend
      </span>
      <h4 className="font-bold text-[#131B2E] text-sm mt-0.5 mb-1 font-display">Carbon Saved</h4>
      <p className="text-xs text-[#64748B] mb-3">
        Saved <strong>{saved} kg CO₂</strong> vs private car commute.
      </p>

      <div className="text-xs font-semibold text-[#006C4A] bg-[#DEF7EC] px-3 py-1 rounded-full border border-emerald-200/60 font-mono">
        🌳 ≈ {trees} {trees === 1 ? 'tree' : 'trees'} planted
      </div>
    </div>
  );
}
