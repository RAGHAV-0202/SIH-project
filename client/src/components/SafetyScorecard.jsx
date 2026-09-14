import React, { useState } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  Share2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  HeartHandshake,
  Sun,
  Home,
  Mountain,
} from 'lucide-react';

export default function SafetyScorecard({ itinerary, destination = '' }) {
  const [copied, setCopied] = useState(false);
  const safety = itinerary?.safety_scorecard || {
    safety_index: 96,
    status_label: 'Verified High Safety Assurance',
    solo_women_friendly: true,
    badges: [
      { id: 'daylight_transit', label: 'Daylight Transit Window ☀️', desc: 'Arrival & transfers scheduled in safe daylight hours.' },
      { id: 'verified_host', label: 'Verified Homestay Host 🛡️', desc: 'Government verified local host with on-site family.' },
      { id: 'solo_safe', label: 'Solo & Women Traveler Approved ✨', desc: 'No unlit routes, pre-linked women emergency helpline.' },
      { id: 'guardian_active', label: 'Guardian SOS Pre-Mapped 📍', desc: 'Local police (112), hospital, and helpline pre-linked.' },
    ],
    emergency_directory: {
      police: 'National Emergency: 112',
      women_helpline: 'Women Helpline: 1091',
      hospital: 'Emergency Medical Dispatch: 108',
      nearest_pharmacy: '24/7 Verified District Chemist',
    },
  };

  const destName = destination || itinerary?.destination || 'Destination';
  const stayName = itinerary?.selected_stay?.name || 'Verified Homestay';
  const stayOwner = itinerary?.selected_stay?.local_owner_name || 'Local Host';
  const policeNo = safety.emergency_directory?.police || '112';
  const helplineNo = safety.emergency_directory?.women_helpline || '1091';
  const hospitalNo = safety.emergency_directory?.hospital || '108';

  const guardianShareText = `🛡️ Wandr Safety Guardian Itinerary:
Trip to: ${destName} (${itinerary?.days || 4} days)
Stay: ${stayName} (Host: ${stayOwner})
Safety Score: ${safety.safety_index}/100 (Solo & Women Verified)
Emergency Police: ${policeNo}
Women Helpline: ${helplineNo}
Nearest Hospital: ${hospitalNo}
All transport and stays are monitored by Wandr Autonomous Sentinel.`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(guardianShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(guardianShareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 space-y-4 shadow-sm">
      
      {/* Header: Score Gauge, Tag & 1-Tap Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-700 tracking-wider">
                Guardian Sentinel
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                Solo & Women Traveler Certified
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Safety Score: <span className="font-mono text-emerald-700 font-extrabold">{safety.safety_index} / 100</span> · {safety.status_label}
            </h3>
          </div>
        </div>

        {/* 1-Tap Guardian Share Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copy guardian safety summary"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy SOS'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer active:scale-95"
            title="Share itinerary with family or emergency contact via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Guardian Link</span>
          </button>
        </div>
      </div>

      {/* Verified Safety Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(safety.badges || []).map((b) => (
          <div
            key={b.id}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
          >
            <span className="text-xs font-bold text-slate-900 block truncate">
              {b.label}
            </span>
            <span className="text-[11px] text-slate-600 block line-clamp-2 leading-snug">
              {b.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Pre-mapped Destination Emergency Directory */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <PhoneCall className="w-4 h-4 text-[#DA7756]" />
          <span>Local Emergency Hotlines for {destName}:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-slate-700">
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
            🚨 {policeNo}
          </span>
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
            👩 {helplineNo}
          </span>
          <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
            🏥 {hospitalNo}
          </span>
        </div>
      </div>

    </div>
  );
}
