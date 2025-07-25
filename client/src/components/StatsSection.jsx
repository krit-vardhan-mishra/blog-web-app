import React from 'react';
import { motion } from 'framer-motion';

const StatsSection = ({ 
  stats, 
  onViewAllStats, 
  onStatClick, 
  itemVariants 
}) => {
  const colorMap = {
    'Your Blogs': 'text-blue-400',
    'Total Views': 'text-green-400',
    'Last Updated': 'text-purple-400',
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
    >
      {/* Header row with title and button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Your Stats</h2>
        <button
          onClick={onViewAllStats}
          className="text-blue-400 hover:text-blue-500 font-medium underline"
        >
          View All Stats
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            stat={stat}
            colorClass={colorMap[stat.title] || 'text-gray-300'}
            onClick={() => onStatClick(stat)}
          />
        ))}
      </div>
    </motion.div>
  );
};

const StatCard = ({ stat, colorClass, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-center hover:border-2 hover:border-gray-600 transition-all duration-100 cursor-pointer border border-gray-700"
  >
    <h3 className="text-white font-semibold mb-2">{stat.title}</h3>
    <p className={`text-2xl font-bold ${colorClass} whitespace-pre-line`}>
      {stat.count || stat.count === 0 ? stat.count : '-'}
    </p>
    <p className="text-gray-400 text-sm">{stat.subtitle}</p>
  </motion.div>
);

export default StatsSection;