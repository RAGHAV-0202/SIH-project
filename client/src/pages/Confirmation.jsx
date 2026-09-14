import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  ShieldCheck,
  Printer,
  CheckCircle2,
  QrCode,
  AlertTriangle,
  Flame,
  ArrowRight,
  Car,
  PhoneCall,
  UserCheck,
  Download,
  Lock,
} from 'lucide-react';

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripData } = useTrip();
  const { user } = useAuth();
  const { booking, itinerary } = tripData;

  const bookingRef = booking?.id || booking?.bookingId || location.state?.bookingId || 'WNDR-SPITI-8492-AX';
  const totalCost = booking?.total_cost || itinerary?.cost_breakdown?.total || 27850;

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-body text-[#131B2E] antialiased selection:bg-[#C26D38] selection:text-white">
      <Navbar />

      <main className="w-full pt-6 pb-24">
        <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          
          {/* ======================================================================= */}
          {/* 1. STATUS HEADER BANNER                                                 */}
          {/* ======================================================================= */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-[#006C4A]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full bg-[#E6F7F0] text-[#006C4A] font-mono text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
                      Verified & Dispatched
                    </span>
                    <span className="text-xs text-[#4F5D72] font-mono">Protocol v4.12-Spiti</span>
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#131B2E] tracking-tight mt-1">
                    EXPEDITION RESERVATION LOCKED & CONFIRMED
                  </h1>
                  <p className="text-xs text-[#4F5D72] mt-1 font-mono">
                    Booking Reference: <span className="font-bold text-[#131B2E]">{bookingRef}</span> • 100% Direct Local Settlement
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#F2F3FF] hover:bg-slate-200 text-[#131B2E] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer border border-slate-200/60"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ledger</span>
                </button>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <div className="flex items-center gap-1.5 text-[#006C4A] font-mono text-xs font-bold uppercase px-3 py-2 bg-[#E6F7F0] rounded-xl border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-[#006C4A] animate-pulse" />
                  <span>ITBP LINK ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 2. MAIN ASYMMETRIC WORKSPACE (12 COLS)                                  */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: 7 COLS (Traveler Credentials, Stay, Transit) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Traveler Credentials Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#C26D38]" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4F5D72]">
                      Traveler Manifest & Emergency Escalation
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#F2F3FF] text-xs font-bold text-[#131B2E]">
                    2 Active Manifest Slots
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F2F3FF] rounded-xl p-4 border border-slate-200/60">
                    <span className="text-[11px] font-mono text-[#4F5D72] block">Primary Traveler</span>
                    <span className="font-display font-bold text-base text-[#131B2E] mt-1 block">{user?.name || 'Traveler'}</span>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#006C4A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Route & Stay Booking Confirmed</span>
                    </div>
                  </div>

                  <div className="bg-[#F2F3FF] rounded-xl p-4 border border-slate-200/60">
                    <span className="text-[11px] font-mono text-[#4F5D72] block">Accompanying Traveler</span>
                    <span className="font-display font-bold text-base text-[#131B2E] mt-1 block">Travel Companion</span>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#006C4A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Direct Homestay Check-in Ready</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Relay */}
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-[#006C4A] shrink-0" />
                    <span className="text-xs text-slate-800 font-medium">
                      Emergency Comms Linked: <span className="font-bold">ITBP Battalion 17 (Rekong Peo) & Kaza Police HQ (+91-1906-222215)</span>
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#006C4A] uppercase shrink-0">
                    RELAY READY
                  </span>
                </div>
              </div>

              {/* Verified Accommodation Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#C26D38]" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4F5D72]">
                      Verified Alpine Accommodation
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#006C4A] font-mono text-[10px] font-bold border border-emerald-200">
                    DIRECT LOCAL ESCROW
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    alt="Tenzin's Mountain Homestay"
                    className="w-full md:w-44 h-36 rounded-xl object-cover shadow-2xs shrink-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhCRxBwp4tf3_Gr3JWrpeGX8rBSaPOFA-20Fx6bW01YJXviTWDP9beFRbsoHa-ZvYzkms230Temg7w8l-tc3KgpTScVGch-cruwH8HZ0uxmwK9zeFfdG1yXYdWhiAW8z17ymulT9g_Q-pVWZr4VYUUF35fQGZSucRzebXBBh39eCIIuzmAZ3eH7ST-cJzfWmI-chPPM0PITHJon9lGIGf3nlddlAKeHWyzUcMYhhFlw00Ll6CDtOwF_A"
                  />
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-lg text-[#131B2E]">
                          Tenzin’s Mountain Homestay
                        </h3>
                        <span className="font-mono text-xs text-[#4F5D72]">Voucher #SP-091</span>
                      </div>
                      <p className="text-xs text-[#4F5D72] mt-1">
                        Upper Kibber Settlement (4,270m), Spiti, Himachal Pradesh.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F3FF] text-[11px] text-slate-700 font-medium">
                          🔥 Traditional Wood Bukhari Heated
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F3FF] text-[11px] text-slate-700 font-medium">
                          🐑 Yak-Wool Insulation
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F2F3FF] text-[11px] text-slate-700 font-medium">
                          4 Nights (Oct 14 – Oct 18)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[#006C4A] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% Payout Disbursed Directly to Host Family Account
                      </span>
                      <span className="font-display font-black text-sm text-[#131B2E]">₹12,000 Total</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Transit Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-[#C26D38]" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4F5D72]">
                      Mountain Logistics & 4x4 Driver
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F2F3FF] text-[#4F5D72] font-mono text-[10px] font-bold">
                    VETTED PASS ROUTE
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <img
                    alt="Scorpio-N 4x4 Expedition Vehicle"
                    className="w-full md:w-44 h-32 rounded-xl object-cover shadow-2xs shrink-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD49K_HdaJIGRsf4r2UtdNLpcrdixvz_p-FA223Fi7go8v1_hzSf7h6d_MDvceYMnIp83hEt_fWENyw6mNnxmurkRxOKeCqO9HoHkRmfJ3PYsrBXgc6nrQ2ZmCRanAAF2T2vaDaDGiTQx6CDPbeQAJXZz8zI7b07-_bxEgQWlY6o7sozJu1n-UaOX3sWWGv_GJHZu6WUW3ELCpjzYymhgHnOj6qOXAc3k8tuYffTCpcpOBxru51p5mUPA"
                  />
                  <div className="flex flex-col justify-between flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-[#131B2E]">
                          Scorpio-N 4x4 Expedition Spec
                        </h3>
                        <p className="text-xs text-[#4F5D72] mt-0.5">
                          Driver: Dorje Angchuk (14 Yrs Trans-Himalayan Veteran)
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#E6F7F0] text-[#006C4A] font-mono text-[10px] font-bold">
                        CONFIRMED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 bg-[#F2F3FF] p-2.5 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <span className="text-[#4F5D72] font-mono text-[10px] block">Transfer Link</span>
                        <span className="font-bold text-[#131B2E]">Bhuntar (KUU) → Kaza</span>
                      </div>
                      <div>
                        <span className="text-[#4F5D72] font-mono text-[10px] block">Driver Direct Payout</span>
                        <span className="font-bold text-[#006C4A]">₹11,850 Guaranteed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 5 COLS (Ledger, QR Pass, Disruption Test) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Zero-Markup Settlement Ledger */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <span className="font-mono text-[11px] font-bold uppercase text-[#C26D38] tracking-wider">
                    Zero-Markup Settlement Ledger
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#E6F7F0] text-[#006C4A] font-mono text-[10px] font-bold">
                    100% AUDITED
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs text-[#4F5D72]">
                  <div className="flex items-center justify-between p-2.5 bg-[#F2F3FF] rounded-xl border border-slate-200/60">
                    <span className="font-medium text-[#131B2E]">Indigenous Homestays (4 Nights)</span>
                    <span className="font-bold text-[#131B2E]">₹12,000</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F2F3FF] rounded-xl border border-slate-200/60">
                    <span className="font-medium text-[#131B2E]">4x4 Mountain Vehicle & Fuel</span>
                    <span className="font-bold text-[#131B2E]">₹11,850</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#F2F3FF] rounded-xl border border-slate-200/60">
                    <span className="font-medium text-[#131B2E]">Wildlife Sanctuaries & Permits</span>
                    <span className="font-bold text-[#131B2E]">₹4,000</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-[#006C4A]">Wandr Platform Fee</span>
                    <span className="font-black text-[#006C4A]">₹0</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-[#4F5D72]">Total Expedition Settlement</span>
                    <span className="block text-xs text-[#4F5D72]">Zero intermediary markups</span>
                  </div>
                  <span className="font-display font-black text-2xl text-[#131B2E]">
                    ₹{totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Scannable Offline Mountain Pass */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col items-center text-center">
                <div className="flex items-center justify-between w-full pb-3 mb-3 border-b border-slate-100">
                  <span className="font-mono text-[11px] font-bold uppercase text-[#4F5D72]">
                    ITBP Checkpoint Pass
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#006C4A]">
                    OFFLINE SYNCED
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-sm my-2 flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-[#131B2E]" />
                </div>

                <span className="font-mono text-xs font-bold text-[#131B2E] mt-1">
                  CLEARANCE PASS #SP-8492-AX
                </span>
                <p className="text-[11px] text-[#4F5D72] max-w-xs mt-1">
                  Valid for transit at Losar, Kaza, and Rekong Peo ITBP checkpoints with offline cryptographic verification.
                </p>
              </div>

              {/* Test Disruption Simulator Callout */}
              <div className="p-5 bg-[#FAF8FF] rounded-2xl border-2 border-dashed border-[#C26D38]/50 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#C26D38]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-display font-bold text-sm text-[#131B2E]">
                    Disruption Simulator Sandbox
                  </h3>
                </div>
                <p className="text-xs text-[#4F5D72] leading-relaxed">
                  Want to test what happens if Kunzum Pass closes or sudden blizzards hit? Launch the Disruption Simulator to evaluate real-time self-healing rerouting.
                </p>
                <Link
                  to="/disruption"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <span>Launch Disruption Recovery Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
