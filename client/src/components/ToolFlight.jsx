import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToolFlight({ isFlying, onFlightComplete }) {
  return (
    <AnimatePresence>
      {isFlying && (
        <motion.div
          key="tool-flight-plane"
          initial={{
            opacity: 0,
            x: '26vw',
            y: '32vh',
            scale: 0.6,
            rotate: -20,
          }}
          animate={{
            opacity: [0, 1, 1, 0.9, 0],
            x: ['26vw', '45vw', '65vw'],
            y: ['32vh', '20vh', '36vh'],
            scale: [0.6, 1.1, 0.8],
            rotate: [-20, 5, 25],
          }}
          transition={{
            duration: 1.1,
            ease: [0.25, 1, 0.5, 1],
            times: [0, 0.5, 1],
          }}
          onAnimationComplete={() => {
            if (onFlightComplete) onFlightComplete();
          }}
          className="fixed z-40 pointer-events-none text-[#DA7756] drop-shadow-[0_0_12px_rgba(218,119,86,0.7)]"
        >
          <div className="relative">
            {/* SVG Paper Plane Icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="transform rotate-45"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>

            {/* Glowing trail particle */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [1, 2], opacity: [0.8, 0] }}
              transition={{ duration: 0.4, repeat: 2 }}
              className="absolute -bottom-1 -left-2 w-3 h-3 rounded-full bg-[#E07A5F] blur-sm"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
