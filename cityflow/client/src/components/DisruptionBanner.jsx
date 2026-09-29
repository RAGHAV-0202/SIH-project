import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function DisruptionBanner() {
  const [disruption, setDisruption] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const disruptions = await api.getDisruptions();
        if (disruptions && disruptions.length > 0) {
          setDisruption(disruptions[0]);
          setIsVisible(true);
        }
      } catch {}
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && disruption && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl bg-white/95 border-2 border-[#FFDBC9] backdrop-blur-xl text-[#131B2E] px-4 py-3.5 rounded-2xl shadow-xl font-body"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF8F3] border border-[#FFDBC9] flex items-center justify-center shrink-0 text-[#C26D38]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#131B2E] font-display">
                  Live Disruption Alert: {disruption.location}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#C26D38] bg-[#FFDBC9]/50 px-2 py-0.5 rounded-full font-mono">
                  ACTIVE
                </span>
              </div>
              <p className="text-[#64748B] mt-1 leading-relaxed">{disruption.message}</p>
              <Link
                to="/disruption"
                className="mt-2 text-xs font-bold text-[#C26D38] hover:underline inline-flex items-center gap-1 cursor-pointer font-display"
              >
                <span>View Failover Replan in Disruption Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-[#64748B] hover:text-[#131B2E] p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
