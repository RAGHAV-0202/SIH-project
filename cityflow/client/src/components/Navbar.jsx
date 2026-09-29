import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Train, Menu, X, ShieldAlert, Database, Compass, Navigation } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  const getPageBreadcrumb = () => {
    switch (location.pathname) {
      case '/plan':
        return { label: 'Commute Dispatcher', badge: 'Real-Time Routing', color: 'text-[#C26D38] bg-[#FFDBC9]/50' };
      case '/dashboard':
        return { label: 'Congestion & Resource Dashboard', badge: 'Load Telematics', color: 'text-[#006C4A] bg-[#DEF7EC]' };
      case '/disruption':
        return { label: 'Disruption Shield Lab', badge: 'Chaos Failover Active', color: 'text-rose-700 bg-rose-50' };
      case '/data-registry':
        return { label: 'Data Provenance & Audit', badge: '100% Transparent', color: 'text-[#0284C7] bg-[#E0F2FE]' };
      default:
        return { label: 'Smart Mobility Agent', badge: 'Real-Time Routing', color: 'text-[#006C4A] bg-[#DEF7EC]' };
    }
  };

  const breadcrumb = getPageBreadcrumb();

  const navClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all ${
      isActive
        ? 'bg-[#FFFFFF] text-[#C26D38] shadow-xs border border-slate-200/80'
        : 'text-[#4F5D72] hover:text-[#131B2E] hover:bg-white/60'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm font-semibold ${
      isActive
        ? 'bg-white text-[#C26D38] shadow-xs'
        : 'text-[#4F5D72] hover:text-[#131B2E] hover:bg-white/60'
    }`;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(15,23,42,0.03)]">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#C26D38] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-xs group-hover:scale-105 transition-transform font-display">
              C
            </div>
            <span className="font-display font-extrabold text-base sm:text-lg text-[#131B2E] tracking-tight">
              CityFlow<span className="text-[#C26D38]">.</span>
            </span>
          </Link>

          {/* Contextual Overline Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200/80 text-[11px] font-semibold text-[#4F5D72] shadow-2xs font-body">
            <span className="w-2 h-2 rounded-full bg-[#006C4A] animate-pulse" />
            <span>{breadcrumb.label}</span>
            <span className="text-slate-300">•</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${breadcrumb.color}`}>
              {breadcrumb.badge}
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#F2F3FF] p-1 rounded-xl border border-slate-200/70 shadow-2xs">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/plan" className={navClass}>Plan Route</NavLink>
          <NavLink to="/dashboard" className={navClass}>Congestion Dashboard</NavLink>
          <NavLink to="/disruption" className={navClass}>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Disruption Lab
            </span>
          </NavLink>
          <NavLink to="/data-registry" className={navClass}>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#006C4A]" />
              Data Registry
            </span>
          </NavLink>
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/plan"
            className="px-4 py-2 rounded-lg bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-semibold font-body shadow-xs transition-all flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            Dispatch Route
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="p-2 rounded-lg text-[#4F5D72] hover:text-[#131B2E] hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-[#FAF8FF] px-4 pt-3 pb-4 space-y-1.5 shadow-lg animate-fade-in">
          <NavLink to="/" onClick={() => setIsOpen(false)} className={mobileNavClass}>Home</NavLink>
          <NavLink to="/plan" onClick={() => setIsOpen(false)} className={mobileNavClass}>Plan Route</NavLink>
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={mobileNavClass}>Congestion Dashboard</NavLink>
          <NavLink to="/disruption" onClick={() => setIsOpen(false)} className={mobileNavClass}>Disruption Lab</NavLink>
          <NavLink to="/data-registry" onClick={() => setIsOpen(false)} className={mobileNavClass}>Data Registry</NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;
