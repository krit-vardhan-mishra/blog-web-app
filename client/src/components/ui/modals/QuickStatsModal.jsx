import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  'Your Blogs': 'text-blue-400',
  'Total Views': 'text-green-400',
  'Last Updated': 'text-purple-400',
};

const QuickStatsModal = ({ isOpen, onClose, stats = [], onStatClick }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="bg-[#1C222A] w-full max-w-3xl p-6 rounded-lg shadow-2xl mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#2A2E36] rounded-full p-2 shadow-md transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-white text-2xl font-bold mb-6">Quick Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map(({ title, count, subtitle }, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    onStatClick({ title, count, subtitle }); 
                  }}
                  className="bg-[#2A2E36] rounded-lg p-4 text-center hover:border-2 transition-all duration-100 cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <div className={`text-2xl font-bold ${colorMap[title] || 'text-gray-300'}`}>
                    {title === 'Last Updated' && count && count !== 'Never' ? (
                      <div className="whitespace-pre-line leading-tight">
                        {count}
                      </div>
                    ) : (
                      <div>
                        {count || count === 0 ? count : '-'}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{subtitle}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickStatsModal;