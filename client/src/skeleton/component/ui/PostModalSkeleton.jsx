import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostModalSkeleton = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#1C222A] rounded-lg shadow-2xl">
              {/* Close Button */}
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-[#2A2E36] rounded-full p-2 shadow-md transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8 animate-pulse">
                {/* Title Skeleton with horizontal line */}
                <div className="mb-6">
                  <div className="h-8 bg-gray-600 rounded-md mb-4 w-3/4"></div>
                  <div className="w-full h-px bg-gray-600"></div>
                </div>

                {/* Content Skeleton with horizontal line */}
                <div className="mb-6">
                  <div className="space-y-3 mb-4">
                    <div className="h-4 bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-600 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-600 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  </div>
                  <div className="w-full h-px bg-gray-600"></div>
                </div>

                {/* Author Skeleton */}
                <div>
                  <div className="h-5 bg-gray-600 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostModalSkeleton;