import React from 'react';
import { motion } from 'framer-motion';

const AdPlaceholder = ({ placement, className = '' }) => {
  // Determine standard height and styling depending on placement
  let sizeLabel = 'Responsive Ad';
  let dimensions = '300x250';
  let heightClass = 'h-[250px]';

  if (placement === 'explore-feed' || placement === 'dashboard-feed') {
    sizeLabel = 'In-Feed Ad';
    dimensions = 'Responsive Card';
    heightClass = 'min-h-[320px]';
  } else if (placement === 'article-end') {
    sizeLabel = 'Leaderboard / Banner Ad';
    dimensions = '728x90 / 320x50';
    heightClass = 'h-[90px] sm:h-[110px]';
  } else if (placement === 'in-article') {
    sizeLabel = 'In-Article Ad';
    dimensions = 'Responsive Banner';
    heightClass = 'h-[120px] sm:h-[150px]';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full rounded-lg overflow-hidden border-2 border-dashed border-blue-500/20 bg-gray-900/40 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center select-none ${heightClass} ${className}`}
    >
      {/* Visual background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      {/* Decorative center icon or indicator */}
      <div className="z-10 flex flex-col items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-widest text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded-full">
          Advertisement ({placement})
        </span>
        <span className="text-sm font-semibold text-gray-300">
          {sizeLabel}
        </span>
        <span className="text-xs text-gray-500 font-mono">
          {dimensions}
        </span>
      </div>

      {/* Glowing bottom line matching site styling */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
    </motion.div>
  );
};

export default AdPlaceholder;
