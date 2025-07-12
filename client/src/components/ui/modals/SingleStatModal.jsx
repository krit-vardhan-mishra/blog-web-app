import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  'Your Blogs': 'text-blue-400',
  'Total Views': 'text-green-400',
  'Last Updated': 'text-purple-400',
};

const infoMessages = {
  'Your Blogs': 'This shows the number of blog posts you’ve published. Create more to grow your content library.',
  'Total Views': 'This shows the total number of times your blogs have been viewed. More views mean more reach!',
  'Last Updated': 'This shows when you last created, edited, or deleted a blog post.'
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

          <div className={`text-4xl font-extrabold ${colorMap[stat.title] || 'text-gray-300'}`}>
            {stat.title === 'Last Updated' && stat.count && stat.count !== 'Never' ? (
              <div className="whitespace-pre-line leading-tight text-center">
                {stat.count}
              </div>
            ) : (
              <div className="text-center">
                {stat.count || stat.count === 0 ? stat.count : '-'}
              </div>
            )}
          </div>

          <p className="text-gray-400 mt-4 text-center">{stat.subtitle}</p>

          {/* Additional info message */}
          {infoMessages[stat.title] && (
            <div className="mt-4 p-3 bg-[#2A2E36] rounded-lg">
              <p className="text-gray-300 text-sm text-center">
                {stat.title === 'Last Updated' && stat.count === 'Never'
                  ? 'No blog activities yet. Create, edit, or delete a blog to see the last updated time.'
                  : infoMessages[stat.title]}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SingleStatModal;
