import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  QrCode,
  ShieldCheck,
  MapPin,
  Phone,
  Clock,
  Train,
  Bus,
  Car
} from 'lucide-react';

export default function OfflineCommutePassModal({ isOpen, onClose, route, origin, destination }) {
  const printRef = useRef(null);

  if (!isOpen || !route) return null;

  const passId = `CF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOfflineHtml = () => {
    const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CityFlow AI — Emergency Offline Transit Pass</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #131B2E; max-width: 800px; margin: 0 auto; line-height: 1.5; background: #fff; }
    .header { border-bottom: 2px solid #C26D38; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #FFDBC9; color: #914714; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .card { border: 1px solid #E2E8F0; padding: 14px; border-radius: 12px; margin-bottom: 14px; background: #FAF8FF; }
    .title { color: #C26D38; font-size: 20px; font-weight: bold; margin-bottom: 4px; }
    .step { margin-bottom: 12px; padding: 10px; border-left: 4px solid #C26D38; background: #fff; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th, td { border: 1px solid #E2E8F0; padding: 8px; text-align: left; }
    th { background: #F8FAFC; font-weight: 600; color: #4F5D72; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CITYFLOW AI — OFFLINE COMMUTE PASS</div>
      <div>Pass Reference: <strong>${passId}</strong> · No Internet Required</div>
    </div>
    <div class="badge">OFFLINE VERIFIED PASS</div>
  </div>

  <div class="card">
    <h3>Journey: ${origin || 'Origin'} ➔ ${destination || 'Destination'}</h3>
    <p><strong>Route Mode:</strong> ${route.name} (${route.time} min · ₹${route.cost})</p>
    <p><strong>Carbon Savings:</strong> ${route.co2?.toFixed(2)} kg CO₂</p>
  </div>

  <div class="card">
    <h4>Step-by-Step Waypoints:</h4>
    ${(route.segments || []).map((seg, i) => `
      <div class="step">
        <strong>Leg ${i + 1}: ${seg.type?.toUpperCase()}</strong> (${seg.duration} min · ₹${seg.cost})<br/>
        From: ${seg.from} ➔ To: ${seg.to}<br/>
        <em>Instructions: ${seg.line || 'Proceed along marked route'}</em>
      </div>
    `).join('')}
  </div>

  <div class="card" style="background: #FFF5F5; border-color: #FED7D7;">
    <h4 style="margin: 0 0 8px 0; color: #9B2C2C;">🚨 Delhi NCR 24/7 Official Emergency Helplines</h4>
    <table>
      <tr><th>Emergency Authority</th><th>Helpline Number</th></tr>
      <tr><td>Central Emergency Police</td><td>112</td></tr>
      <tr><td>Delhi Traffic Police Control</td><td>1095 / 011-25844444</td></tr>
      <tr><td>Delhi Metro (DMRC) 24x7 Helpline</td><td>155370</td></tr>
      <tr><td>DTC Bus Assistance & Lost Property</td><td>1800-11-8181 / 011-23370373</td></tr>
      <tr><td>Women in Distress Helpline</td><td>1091 / 181</td></tr>
      <tr><td>Ambulance & Medical Trauma</td><td>102 / 108</td></tr>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([offlineHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CityFlow_Transit_Pass_${passId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-body">
      <div
        ref={printRef}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[#131B2E] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#FAF8FF]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFF8F3] text-[#C26D38] border border-[#FFDBC9]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display flex items-center gap-2 text-[#131B2E]">
                Emergency Offline Commute Pass
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#006C4A] font-mono font-bold">
                  NO-NET VERIFIED
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">
                Token: <span className="font-mono text-[#C26D38] font-bold">{passId}</span> · Valid for DMRC & DTC corridors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#131B2E] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Content */}
        <div className="p-6 space-y-6">
          {/* Main Transit Summary Badge */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFF8F3] via-white to-[#F2F3FF] border border-[#FFDBC9] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] font-display mb-1">
                Active Transit Corridor
              </div>
              <div className="text-lg font-bold text-[#131B2E] flex items-center gap-2 font-display">
                <span>{origin || 'Origin'}</span>
                <span className="text-[#C26D38]">➔</span>
                <span>{destination || 'Destination'}</span>
              </div>
              <div className="text-xs text-[#64748B] mt-1">
                {route.name} · {route.summary}
              </div>
            </div>
            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-center">
                <div className="text-[10px] uppercase text-[#64748B] font-bold">Duration</div>
                <div className="text-base font-bold text-[#C26D38] font-mono">{route.time} min</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase text-[#64748B] font-bold">Fare</div>
                <div className="text-base font-bold text-[#006C4A] font-mono">₹{route.cost}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase text-[#64748B] font-bold">CO₂ Saved</div>
                <div className="text-base font-bold text-[#D97706] font-mono">{(route.co2 || 0.4).toFixed(2)} kg</div>
              </div>
            </div>
          </div>

          {/* Waypoint Steps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-display mb-3">
              Route Execution Sequence (Offline Guide)
            </h3>
            <div className="space-y-2.5">
              {(route.segments || []).map((seg, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#FAF8FF] border border-slate-200/90 flex items-start gap-3"
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 text-[#C26D38]">
                    {seg.type === 'metro' && <Train className="w-4 h-4" />}
                    {seg.type === 'bus' && <Bus className="w-4 h-4" />}
                    {seg.type === 'cab' && <Car className="w-4 h-4" />}
                    {seg.type === 'walk' && <MapPin className="w-4 h-4" />}
                    {seg.type === 'auto' && <Car className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#131B2E]">
                        Leg {i + 1}: {seg.from} ➔ {seg.to}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#C26D38]">
                        {seg.duration} min · ₹{seg.cost}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{seg.line || 'Proceed through turnstile gates'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency 24/7 Helpline Directory (Official NCT Delhi) */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-3 font-display">
              <Phone className="w-4 h-4" />
              <span>Delhi NCR Official 24/7 Emergency Transit Directory</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-rose-100">
                <span className="text-[#64748B]">Police Emergency</span>
                <span className="font-mono font-bold text-[#131B2E]">112</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-rose-100">
                <span className="text-[#64748B]">Traffic Police</span>
                <span className="font-mono font-bold text-[#131B2E]">1095 / 011-25844444</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-rose-100">
                <span className="text-[#64748B]">DMRC Metro Helpline</span>
                <span className="font-mono font-bold text-[#131B2E]">155370</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-rose-100">
                <span className="text-[#64748B]">DTC Bus Helpline</span>
                <span className="font-mono font-bold text-[#131B2E]">1800-11-8181</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-rose-100">
                <span className="text-[#64748B]">Women Safety</span>
                <span className="font-mono font-bold text-[#131B2E]">1091 / 181</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-rose-100">
                <span className="text-[#64748B]">Ambulance & Trauma</span>
                <span className="font-mono font-bold text-[#131B2E]">102 / 108</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-[#FAF8FF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <QrCode className="w-4 h-4 text-[#006C4A]" />
            <span>Digital QR hash ready for conductor scanner</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadOfflineHtml}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold flex items-center gap-2 text-[#131B2E] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-xs font-bold flex items-center gap-2 text-white transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
