import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Home,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Users,
  Calendar,
  ShieldCheck,
  Building,
  Truck
} from 'lucide-react';

const MOCK_PROVIDER_BOOKINGS = [
  {
    ref: 'WNDR-SPITI-8492',
    guest: 'Aarav Sharma (2 guests)',
    dates: '14 Oct – 19 Oct 2026',
    nights: '5 nights',
    payout: '₹12,000',
    service: 'Homestay + Bukhari Heating',
    isNew: true,
  },
  {
    ref: 'WNDR-SPITI-5129',
    guest: 'Ananya Sharma (3 guests)',
    dates: '22 Oct – 25 Oct 2026',
    nights: '3 nights',
    payout: '₹7,200',
    service: 'Homestay & Traditional Meals',
    isNew: false,
  },
  {
    ref: 'WNDR-SPITI-3104',
    guest: 'Devendra Patel (2 guests)',
    dates: '01 Nov – 05 Nov 2026',
    nights: '4 nights',
    payout: '₹9,600',
    service: 'Upper Kibber Homestay',
    isNew: false,
  },
  {
    ref: 'WNDR-SPITI-9081',
    guest: 'Pooja Mehta (4 guests)',
    dates: '12 Nov – 16 Nov 2026',
    nights: '4 nights',
    payout: '₹14,400',
    service: 'Homestay + Local Guide',
    isNew: false,
  },
];

export default function ProviderDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Traveler Planner</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tenzin's Mountain Homestay & 4x4 Fleet
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                Verified Host Partner
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Upper Kibber Settlement (4,270m), Spiti Valley · 100% Direct Escrow Partner
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Instant Direct Settlements</span>
          </div>
        </header>

        {/* Impact Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Bookings Driven</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              34 Stays
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Zero cancellation rate</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">100% Direct Payouts</span>
            <span className="text-3xl font-black text-[#C26D38] mt-1 block font-mono">
              ₹1,84,000
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">₹0 middleman deductions</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Guest Safety Rating</span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              99.2%
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Wood Bukhari heating verified</span>
          </div>
        </div>

        {/* Table of Recent Bookings */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Direct Traveler Reservations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Funds are escrowed directly upon booking and released directly to your account.
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Auto-Synchronized
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Guest & Party</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Service Reserved</th>
                  <th className="pb-3 text-right">Host Payout</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PROVIDER_BOOKINGS.map((b) => (
                  <tr key={b.ref} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono text-[#C26D38] font-bold">
                      {b.ref}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      {b.guest}
                    </td>
                    <td className="py-3.5 text-slate-500 font-medium">
                      {b.dates} ({b.nights})
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {b.service}
                    </td>
                    <td className="py-3.5 text-right font-mono font-extrabold text-slate-900 text-sm">
                      {b.payout}
                    </td>
                    <td className="py-3.5 text-right">
                      {b.isNew ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Upcoming
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Confirmed & Cleared
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner Footer */}
        <footer className="pt-6 border-t border-slate-200/80 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Wandr Himalayan Host Network · Dedicated to direct village prosperity</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Zero-Commission Local Partner Tier
          </span>
        </footer>

      </main>
    </div>
  );
}
