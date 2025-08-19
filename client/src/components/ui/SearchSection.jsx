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
    if (isSearchActive) {
      searchInputRef.current?.focus();

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          handleSearchToggle();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSearchActive, handleSearchToggle]); 

  return (
    <AnimatePresence>
      {isSearchActive && ( 
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 flex justify-center items-start pt-4 z-20 px-4"
        >
          <motion.div
            className="max-w-6xl w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-lg rounded-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center max-w-7xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search blogs, tags, authors, or content..."
                className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              <motion.button
                type="button"
                onClick={handleSearchToggle}
                className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
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
