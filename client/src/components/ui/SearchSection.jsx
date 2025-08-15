import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SearchSection = ({
  isSearchActive,
  searchQuery,
  handleSearchToggle,
  handleSearchChange,
  handleSearchSubmit
}) => {
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus the search input when it becomes active
    if (isSearchActive) {
      searchInputRef.current?.focus();

      // Add event listener for 'Escape' key to close the search bar
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          handleSearchToggle();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      // Clean up the event listener when the component unmounts or search becomes inactive
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSearchActive, handleSearchToggle]); // Dependencies for useEffect

  return (
    // AnimatePresence enables exit animations for components that are removed from the DOM
    <AnimatePresence>
      {isSearchActive && ( // Render the search section only if isSearchActive is true
        <motion.div
          // Define animation for entry (initial, animate) and exit (exit)
          initial={{ opacity: 0, y: -20 }} // Start invisible, slightly above its final position
          animate={{ opacity: 1, y: 0 }} // Fade in and slide to its final position
          exit={{ opacity: 0, y: -20 }} // Fade out and slide up when exiting
          transition={{ duration: 0.2 }} // Short transition duration for a snappy feel
          className="fixed top-0 left-0 right-0 flex justify-center items-start pt-4 z-20 px-4"
          // Using `fixed` and `top-0` to position it globally at the top
        >
          <motion.div
            className="max-w-6xl w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-lg rounded-lg"
            whileHover={{ scale: 1.01 }} // Subtle scale effect on hover
            transition={{ type: "spring", stiffness: 300, damping: 30 }} // Spring physics for hover
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center max-w-7xl mx-auto">
              <input
                ref={searchInputRef} // Attach ref to input for focusing
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search blogs, tags, authors, or content..."
                className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              <motion.button
                type="button" // Use type="button" to prevent form submission
                onClick={handleSearchToggle} // Toggle search active state
                className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }} // Scale up and rotate on hover
                whileTap={{ scale: 0.9 }} // Scale down on tap
              >
                <X className="text-white w-6 h-6" /> {/* Close icon */}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchSection;
