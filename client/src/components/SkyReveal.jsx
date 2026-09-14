import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Mountain, ShieldCheck } from 'lucide-react';

export default function SkyReveal({ children }) {
  const [showClouds, setShowClouds] = useState(true);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowClouds(false);
      return;
    }

    // Show center badge at peak cloud coverage
    const badgeTimer = setTimeout(() => {
      setShowBadge(true);
    }, 250);

    // Fade out / part clouds
    const endTimer = setTimeout(() => {
      setShowBadge(false);
      setShowClouds(false);
    }, 1250);

    return () => {
      clearTimeout(badgeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8FF] overflow-x-hidden">
      <AnimatePresence>
        {showClouds && (
          <motion.div
            key="clash-cloud-transition-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
          >
            {/* Soft Mist Haze Background (occludes viewport) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/95 via-white/98 to-[#f1f5f9]/95 backdrop-blur-md"
            />

            {/* MID-LAYER CLOUDS (Subtle depth & shading) */}
            <div className="absolute inset-0 flex pointer-events-none">
              {/* Left Mid Cloud Puff Bank */}
              <motion.div
                initial={{ x: '-105%' }}
                animate={{ x: '-4%' }}
                exit={{ x: '-110%' }}
                transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
                className="w-[62vw] h-full relative -left-[8vw]"
              >
                <svg
                  className="w-full h-full text-[#e2e8f0]/80 filter drop-shadow-[0_25px_35px_rgba(15,23,42,0.14)]"
                  fill="currentColor"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 1000"
                >
                  <path d="M0,0 L560,0 C630,90 680,180 630,280 C740,320 780,440 690,560 C760,670 710,790 590,870 C540,930 450,980 340,1000 L0,1000 Z" />
                </svg>
              </motion.div>

              {/* Right Mid Cloud Puff Bank */}
              <motion.div
                initial={{ x: '105%' }}
                animate={{ x: '4%' }}
                exit={{ x: '110%' }}
                transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
                className="w-[62vw] h-full relative -right-[8vw] ml-auto"
              >
                <svg
                  className="w-full h-full text-[#e2e8f0]/80 filter drop-shadow-[0_25px_35px_rgba(15,23,42,0.14)]"
                  fill="currentColor"
                  preserveAspectRatio="none"
                  viewBox="0 0 800 1000"
                >
                  <path d="M800,0 L240,0 C170,90 120,180 170,280 C60,320 20,440 110,560 C40,670 90,790 210,870 C260,930 350,980 460,1000 L800,1000 Z" />
                </svg>
              </motion.div>
            </div>

            {/* FOREGROUND CLOUDS (Pure Fluffy White / Clash Puffs with Heavy Billows) */}
            <div className="absolute inset-0 flex pointer-events-none">
              {/* Left Huge Cloud Front Bank */}
              <motion.div
                initial={{ x: '-105%' }}
                animate={{ x: '-4%' }}
                exit={{ x: '-110%' }}
                transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                className="w-[68vw] h-full relative"
              >
                <svg
                  className="w-full h-full text-white filter drop-shadow-[15px_0_40px_rgba(15,23,42,0.18)]"
                  fill="currentColor"
                  preserveAspectRatio="none"
                  viewBox="0 0 900 1100"
                >
                  <circle cx="200" cy="120" r="280" />
                  <circle cx="450" cy="180" r="260" />
                  <circle cx="580" cy="360" r="250" />
                  <circle cx="680" cy="560" r="270" />
                  <circle cx="540" cy="760" r="290" />
                  <circle cx="360" cy="940" r="280" />
                  <circle cx="120" cy="1020" r="300" />
                  <rect height="1100" width="460" x="0" y="0" />
                </svg>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-[#faf8ff]/60 pointer-events-none" />
              </motion.div>

              {/* Right Huge Cloud Front Bank */}
              <motion.div
                initial={{ x: '105%' }}
                animate={{ x: '4%' }}
                exit={{ x: '110%' }}
                transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
                className="w-[68vw] h-full relative ml-auto"
              >
                <svg
                  className="w-full h-full text-white filter drop-shadow-[-15px_0_40px_rgba(15,23,42,0.18)]"
                  fill="currentColor"
                  preserveAspectRatio="none"
                  viewBox="0 0 900 1100"
                >
                  <circle cx="700" cy="120" r="280" />
                  <circle cx="450" cy="180" r="260" />
                  <circle cx="320" cy="360" r="250" />
                  <circle cx="220" cy="560" r="270" />
                  <circle cx="360" cy="760" r="290" />
                  <circle cx="540" cy="940" r="280" />
                  <circle cx="780" cy="1020" r="300" />
                  <rect height="1100" width="460" x="440" y="0" />
                </svg>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-l from-transparent to-[#faf8ff]/60 pointer-events-none" />
              </motion.div>
            </div>

            {/* CENTER EXPEDITION STATUS PILL (Revealed at Peak Cloud Collision) */}
            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
              <AnimatePresence>
                {showBadge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                    className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl p-6 max-w-md w-full flex flex-col items-center text-center"
                  >
                    {/* Spinning Compass Glyph */}
                    <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full border-2 border-dashed border-[#C26D38]/40 animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                      <div className="w-12 h-12 rounded-full bg-[#FFDBC9]/60 flex items-center justify-center text-[#C26D38] shadow-inner">
                        <Compass className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono text-[10px] uppercase font-bold tracking-wider mb-2 border border-emerald-200/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Himalayan Passage Scout
                    </div>

                    <h3 className="font-display font-bold text-lg text-slate-900 tracking-tight">
                      Scouting Himalayan Corridor...
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Harmonizing high valley passes, weather fronts & certified homestays.
                    </p>

                    {/* Live mini altitude tracker */}
                    <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Mountain className="w-3.5 h-3.5 text-[#C26D38]" /> 4,400m Envelope
                      </span>
                      <span className="text-emerald-700 font-bold">100% Acclimatized</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Dashboard (Scales smoothly from 0.98 -> 1.0) */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0.9 }}
        animate={{ scale: 1.0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
