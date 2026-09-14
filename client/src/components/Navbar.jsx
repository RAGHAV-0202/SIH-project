import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../context/MemoryContext';
import { Compass, Plus, Settings, LogIn, LogOut, ChevronDown, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { memory, openDrawer } = useMemory();
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef(null);

  // Close profile dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [profileMenuOpen]);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const isHome = location.pathname === '/';

  // Smooth scroll handler for Homepage sections
  const handleScrollTo = (sectionId) => {
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  // Contextual breadcrumb for internal flow pages
  const getContextualBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/login' || path === '/auth') {
      return {
        title: 'Traveler Sign-In',
        subtitle: 'Biometric & SMS Vault',
        badge: 'Secure Gateway',
        badgeColor: 'text-[#006C4A] bg-[#006C4A]/10',
      };
    }
    if (path === '/plan/start' || path === '/plan') {
      return {
        title: 'Expedition Formulation',
        subtitle: 'Step 1 of 2: Define Constraints',
        badge: 'Acclimatization Guard',
        badgeColor: 'text-[#C26D38] bg-[#FFDBC9]/50',
      };
    }
    if (path === '/planning' || path === '/workspace' || path === '/plan-expedition') {
      return {
        title: 'Trip planner',
        subtitle: null,
        badge: null,
        badgeColor: '',
      };
    }
    if (path === '/voice' || path === '/voice-intake') {
      return {
        title: 'Multimodal Voice Intake',
        subtitle: 'Acoustic Trip Matrix',
        badge: 'Live Audio',
        badgeColor: 'text-[#C26D38] bg-[#FFDBC9]/50',
      };
    }
    if (path === '/dashboard' || path === '/planner' || path === '/overview') {
      return {
        title: 'Mission Dashboard',
        subtitle: 'Autonomous Plan Cockpit',
        badge: 'Plan Verified',
        badgeColor: 'text-[#006C4A] bg-[#006C4A]/10',
      };
    }
    if (path === '/deck' || path === '/flightdeck' || path === '/flight-deck') {
      return {
        title: 'Flight Deck Cockpit',
        subtitle: 'Multi-Agent Autonomous Core',
        badge: 'Swarm Synced',
        badgeColor: 'text-[#006C4A] bg-[#006C4A]/10',
      };
    }
    if (path === '/itinerary') {
      return {
        title: 'Expedition Itinerary',
        subtitle: 'Verified Local Routes & Escrow Locked',
        badge: 'Route Sealed',
        badgeColor: 'text-[#006C4A] bg-[#006C4A]/10',
      };
    }
    if (path === '/confirmation') {
      return {
        title: 'Reservation Confirmed',
        subtitle: 'Direct Host & Driver Escrow Locked',
        badge: '100% Guaranteed',
        badgeColor: 'text-[#006C4A] bg-[#006C4A]/10',
      };
    }
    if (path === '/disruption' || path === '/disruption-lab') {
      return {
        title: 'Mountain Disruption Shield',
        subtitle: '24/7 Road & Weather Self-Healing',
        badge: 'Protection Active',
        badgeColor: 'text-[#914714] bg-[#FFDBC9]/50',
      };
    }
    return {
      title: 'Autonomous Trip Planner',
      subtitle: 'Intelligent Route & Stay Synthesis',
      badge: 'Online',
      badgeColor: 'text-[#006C4A] bg-[#006C4A]/10',
    };
  };

  const breadcrumb = getContextualBreadcrumb();

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_8px_rgba(15,23,42,0.03)]">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#C26D38] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-xs group-hover:scale-105 transition-transform font-['Geist']">
              W
            </div>
            <span className="font-['Geist'] font-extrabold text-base sm:text-lg text-[#131B2E] tracking-tight uppercase">
              Wandr<span className="text-[#C26D38]">.</span>
            </span>
          </Link>

          {isHome && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#F2F3FF] rounded-full border border-slate-200/60 text-[11px] font-semibold text-[#4F5D72] font-['Geist']">
              <Compass className="w-3.5 h-3.5 text-[#C26D38]" />
              <span className="tracking-wide">India travel planner</span>
            </div>
          )}
        </div>

        {/* ─── CASE 2: INTERNAL FLOW PAGES (Clean Breadcrumb & Stage Indicator) ─── */}
        {!isHome && (
          <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F2F3FF] border border-slate-200/70 text-xs font-['Geist'] shadow-2xs">
            <span className="font-bold text-[#131B2E]">{breadcrumb.title}</span>
            {breadcrumb.subtitle && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-[#4F5D72] font-medium">{breadcrumb.subtitle}</span>
              </>
            )}
            {breadcrumb.badge && (
              <>
                <span className="text-slate-300">•</span>
                <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${breadcrumb.badgeColor}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {breadcrumb.badge}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right Tools: Plan a Trip, Settings & Traveler Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-['Geist']">



          {/* Plan a Trip Button (Hidden if currently on /planning) */}
          {location.pathname !== '/planning' && location.pathname !== '/workspace' && (
            <Link
              to="/planning"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C26D38] hover:bg-[#A85A2A] text-white text-xs font-bold shadow-xs active:scale-98 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan a Trip</span>
            </Link>
          )}

          {/* Traveler Settings Button */}
          <button
            type="button"
            onClick={openDrawer}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Traveler Settings & Personal Memory"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Member Profile Dropdown / Avatar */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200/80 cursor-pointer hover:opacity-90 transition-all rounded-xl py-1 px-1.5 hover:bg-slate-100/70"
                title="Account Menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C26D38] via-amber-500 to-emerald-600 p-[2px] shadow-xs shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#131B2E] uppercase font-mono">
                    {user.name && user.name !== 'Lord K. Stirling' ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'TR'}
                  </div>
                </div>
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-[#131B2E] truncate max-w-[120px]">
                    {user.name && user.name !== 'Lord K. Stirling' ? user.name : 'Traveler'}
                  </span>
                  <span className="text-[10px] font-medium text-[#006C4A] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006C4A]"></span>
                    Member
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180 text-slate-700' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-['Geist']">
                  {/* User info banner */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#131B2E] truncate">{user.name || 'Traveler'}</p>
                    <p className="text-[11px] text-[#4F5D72] truncate">{user.email || user.phone || 'traveler@wandr.travel'}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-800 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Authenticated Session</span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        openDrawer();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#131B2E] hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Traveler Settings & Memory</span>
                    </button>
                    <Link
                      to="/deck"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-[#131B2E] hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-slate-500" />
                      <span>Expedition Flight Deck</span>
                    </Link>
                  </div>

                  {/* Log Out Action */}
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-[#131B2E] transition-all shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C26D38]" />
              <span>Log In</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
