import React from 'react';
import { motion } from 'framer-motion';

const LoadingStates = ({ loading, pagination, blogsLength }) => {
  // Loading indicator for pagination
  if (loading) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-lg backdrop-blur-md">
          <motion.div
            className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-gray-300">Loading more blogs...</span>
        </div>
      </motion.div>
    );
  }

  // End of content indicator
  if (!pagination?.hasNextPage && blogsLength > 0) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="inline-flex items-center px-6 py-3 bg-gray-800/50 rounded-lg border border-gray-700 backdrop-blur-md"
          whileHover={{ scale: 1.05 }}
          animate={{
            boxShadow: [
              "0 0 0px rgba(59, 130, 246, 0.3)",
              "0 0 40px rgba(168, 85, 247, 0.3)",
              "0 0 20px rgba(34, 197, 94, 0.3)",
              "0 0 20px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.span
            className="text-xl mr-2"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.span>
          <span className="text-gray-300">You've reached the end! No more blogs to load.</span>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default LoadingStates;
