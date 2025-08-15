import React from 'react';
import { motion } from 'framer-motion';

const LoadingStates = ({ loading, pagination, blogsLength }) => {
  // Loading indicator for pagination
  if (loading) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.5 }} // Start invisible and small
        animate={{ opacity: 1, scale: 1 }} // Fade in and scale up
        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Spring animation
      >
        <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-lg backdrop-blur-md">
          <motion.div
            className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }} // Continuous rotation
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }} // Linear easing for constant speed
          />
          <span className="text-gray-300">Loading more blogs...</span>
        </div>
      </motion.div>
    );
  }

  // End of content indicator, shown when no more pages to load and blogs exist
  if (!pagination?.hasNextPage && blogsLength > 0) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }} // Start invisible and slightly below
        animate={{ opacity: 1, y: 0 }} // Fade in and slide up
        transition={{ type: "spring", stiffness: 300, damping: 30 }} // Spring animation
      >
        <motion.div
          className="inline-flex items-center px-6 py-3 bg-gray-800/50 rounded-lg border border-gray-700 backdrop-blur-md"
          whileHover={{ scale: 1.05 }} // Slight scale on hover
          animate={{
            // Pulsating multi-color box shadow animation
            boxShadow: [
              "0 0 0px rgba(59, 130, 246, 0.3)", // Initial state (no shadow)
              "0 0 40px rgba(168, 85, 247, 0.3)", // Purple glow
              "0 0 20px rgba(34, 197, 94, 0.3)",  // Green glow
              "0 0 20px rgba(59, 130, 246, 0.3)", // Blue glow
              "0 0 0px rgba(59, 130, 246, 0.3)"  // Back to subtle glow
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }} // Loop the shadow animation
        >
          <motion.span
            className="text-xl mr-2"
            // Emoji animation: rotate and scale for a celebratory feel
            animate={{
              rotate: [0, 10, -10, 0], // Slight wobble
              scale: [1, 1.2, 1] // Pop effect
            }}
            transition={{ duration: 2, repeat: Infinity }} // Loop the emoji animation
          >
            🎉
          </motion.span>
          <span className="text-gray-300">You've reached the end! No more blogs to load.</span>
        </motion.div>
      </motion.div>
    );
  }

  // If not loading and not at the end of content, render nothing
  return null;
};

export default LoadingStates;
