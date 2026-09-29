import React from 'react';
import { Database, ShieldCheck, AlertCircle, CheckCircle2, Server, Globe, Cpu } from 'lucide-react';

export default function MockRegistry() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#FAF8FF] text-[#131B2E] p-4 sm:p-6 lg:p-8 font-body">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C26D38] bg-[#FFDBC9]/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-display">
              <Database className="w-3.5 h-3.5 text-[#C26D38]" />
              Municipal Data Integrity & Provenance
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#006C4A] bg-[#DEF7EC] px-2.5 py-0.5 rounded-full font-mono">
              Full Transparency Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#131B2E] mt-2 font-display tracking-tight">
            Data Provenance & Mock Data Registry
          </h1>
          <p className="text-sm text-[#4F5D72] mt-1 leading-relaxed">
            Complete transparency on where <strong>Real Live APIs</strong>, <strong>Authentic Transit Datasets</strong>,
            and <strong>Simulated Layers</strong> are utilized across CityFlow AI.
          </p>
        </div>

        {/* Real Data Highlights */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#131B2E] flex items-center gap-2 font-display">
            <CheckCircle2 className="w-5 h-5 text-[#006C4A]" />
            100% Real Live Production Integrations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131B2E] font-display">Live OpenWeather API</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#006C4A] font-bold">LIVE API</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Direct REST calls to OpenWeatherMap querying live Delhi temperature, rainfall, and humidity. Reroutes around rain and extreme heat.
              </p>
              <div className="text-[10px] font-mono text-[#C26D38] pt-1">api.openweathermap.org/data/2.5/weather</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131B2E] font-display">Live Groq LLM Inference</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#006C4A] font-bold">LIVE AI</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Groq LPUs running Llama 3 / GPT-OSS / Qwen models to parse natural Hindi, Hinglish, and English commuter requests with Zod schemas.
              </p>
              <div className="text-[10px] font-mono text-[#C26D38] pt-1">api.groq.com/openai/v1</div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131B2E] font-display">OpenStreetMap Nominatim</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#DEF7EC] text-[#006C4A] font-bold">LIVE GEO</span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Dynamic geocoding resolving actual latitude and longitude for any address, metro station, or Delhi neighborhood with local caching.
              </p>
              <div className="text-[10px] font-mono text-[#C26D38] pt-1">nominatim.openstreetmap.org/search</div>
            </div>
          </div>
        </div>

        {/* Authentic Transit Datasets */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#131B2E] flex items-center gap-2 font-display">
            <Server className="w-5 h-5 text-[#C26D38]" />
            Official Transit Networks & Scientific Baselines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#131B2E] font-display block">Delhi Metro (DMRC) & DTC Network</span>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Accurate geographic stations, interchanges (Rajiv Chowk, Kashmere Gate, Hauz Khas), line colors, and official distance-based fare table (₹10 to ₹60). Authentic DTC bus routes (501, 544, 423, etc.).
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-[#131B2E] font-display block">CPCB & IEA Carbon Standards</span>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Standard emission factors per passenger-km from Central Pollution Control Board (Metro: 0.008 kg/km, Bus: 0.025 kg/km, Auto: 0.065 kg/km, Cab: 0.12 kg/km).
              </p>
            </div>
          </div>
        </div>

        {/* Where and Why Mock Data is Used */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#131B2E] flex items-center gap-2 font-display">
            <AlertCircle className="w-5 h-5 text-[#D97706]" />
            Simulated / Mock Layers & Architecture Rationale
          </h2>

          <div className="space-y-3">
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#131B2E] font-display">Uber / Ola Live Driver Dispatch API</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  MOCK FLEET
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                <strong>Why simulated:</strong> Commercial ride-hailing partner APIs require approved corporate contracts, NDA credentials, and real billing. Tariffs are accurately modeled from Delhi RTO taxi rates (₹50 base + ₹14/km).
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#131B2E] font-display">Live ITMS Traffic Camera Telematics</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  MOCK TRAFFIC
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                <strong>Why simulated:</strong> Delhi Traffic Police ITMS camera feeds are restricted to government command rooms without public streaming APIs. Modeled realistically using empirical peak hour modifiers (1.5x delay between 8–10 AM and 5–8 PM).
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#131B2E] font-display">Disruption Lab Crisis Vectors</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                  TESTBED VECTOR
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                <strong>Why simulated:</strong> Provides interactive test scenarios (Rajiv Chowk signal failure, Moolchand flooding) so evaluators can inspect real-time autonomous rerouting without triggering live municipal disruption alarms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
