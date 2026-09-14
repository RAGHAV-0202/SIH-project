import React from 'react';
import { motion } from 'framer-motion';

export default function AmbientBackground({ state = 'planning' }) {
  const isDisrupted = state === 'disrupted';
  const isActive = state === 'active';

  const blob1Color = isDisrupted
    ? 'rgba(239, 68, 68, 0.08)'
    : isActive
    ? 'rgba(218, 119, 86, 0.06)'
    : 'rgba(99, 102, 241, 0.04)';

  const blob2Color = isDisrupted
    ? 'rgba(245, 158, 11, 0.08)'
    : isActive
    ? 'rgba(16, 185, 129, 0.05)'
    : 'rgba(218, 119, 86, 0.05)';

  const blob3Color = 'rgba(241, 245, 249, 0.8)';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#F6F7F9]">
      {/* Soft warm luminous background with subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFFFFF] via-[#F6F7F9] to-[#EDEEF2] opacity-95" />

      {/* Blob 1: Top-left luminous orb */}
      <motion.div
        animate={{
          backgroundColor: blob1Color,
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
          scale: isDisrupted ? [1, 1.1, 1] : [1, 1.05, 1],
        }}
        transition={{
          backgroundColor: { duration: 0.8 },
          duration: isDisrupted ? 4 : 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full blur-3xl"
      />

      {/* Blob 2: Right ambient orb */}
      <motion.div
        animate={{
          backgroundColor: blob2Color,
          x: [0, -40, 30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          backgroundColor: { duration: 0.8 },
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 -right-28 w-[700px] h-[700px] rounded-full blur-3xl"
      />
    </div>
  );
}
