import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  'Your Blogs': 'text-blue-400',
  'Total Views': 'text-green-400',
  'Last Updated': 'text-purple-400',
};

const SingleStatModal = ({ stat, isOpen, onClose }) => {
  if (!isOpen || !stat) return null;

  return (
    <AnimatePresence>
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
          className="bg-[#1C222A] w-full max-w-md p-6 rounded-lg shadow-2xl mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white bg-[#2A2E36] rounded-full p-2 shadow-md transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-white text-2xl font-bold mb-4">{stat.title}</h2>
          <p className={`text-4xl font-extrabold ${colorMap[stat.title] || 'text-gray-300'}`}>
            {stat.count || stat.count === 0 ? stat.count : '-'}
          </p>
          <p className="text-gray-400 mt-2">{stat.subtitle}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SingleStatModal;
