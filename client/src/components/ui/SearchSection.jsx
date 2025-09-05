import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Hash, FileText, User } from 'lucide-react';

const SearchSection = ({
  isSearchActive,
  searchQuery,
  handleSearchToggle,
  handleSearchChange,
  handleSearchSubmit,
  searchResults = [],
  searchLoading = false,
  onSearchResultClick,
  allBlogs = []
}) => {
  const searchInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Responsive breakpoints detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 641 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  const searchOverlayVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.1, duration: 0.3 }
    }
  };

  const resultsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.3 }
    }
  };

  const getSearchPlaceholder = () => {
    if (isMobile) return "Search...";
    if (isTablet) return "Search blogs, tags, authors...";
    return "Search blogs, tags, authors, or content... (use #tag for tag search)";
  };

  const getSearchIcon = () => {
    if (searchQuery.startsWith('#')) return <Hash className="w-5 h-5" />;
    if (searchQuery.toLowerCase().includes('user') || searchQuery.toLowerCase().includes('author')) return <User className="w-5 h-5" />;
    return <Search className="w-5 h-5" />;
  };

  return (
    <AnimatePresence>
      {isSearchActive && (
        <motion.div
          variants={searchOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex justify-center items-start pt-4 z-50 px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleSearchToggle}
          />

          {/* Search Container */}
          <motion.div
            className={`
              relative w-full max-w-4xl mx-auto
              ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}
            `}
            layoutId="search-container"
          >
            {/* Search Input */}
            <motion.div
              className="bg-[#1C222A]/90 backdrop-blur-md border border-gray-600/50 rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.form
                onSubmit={handleSearchSubmit}
                className="flex items-center"
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Search Icon */}
                <div className="pl-4 pr-2 flex items-center">
                  <motion.div
                    animate={{ rotate: searchQuery ? 0 : 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getSearchIcon()}
                  </motion.div>
                </div>

                {/* Input Field */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={getSearchPlaceholder()}
                  className={`
                    flex-1 bg-transparent text-white placeholder-gray-400
                    focus:outline-none py-4 px-2
                    ${isMobile ? 'text-base' : 'text-lg'}
                  `}
                />

                {/* Close Button */}
                <motion.button
                  type="button"
                  onClick={handleSearchToggle}
                  className="p-3 mr-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="text-white w-5 h-5" />
                </motion.button>
              </motion.form>

              {/* Search Results */}
              {searchQuery && (
                <motion.div
                  variants={resultsVariants}
                  initial="hidden"
                  animate="visible"
                  className="border-t border-gray-600/30 max-h-96 overflow-hidden"
                >
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <p className="text-gray-400 text-sm">
                        {searchQuery.includes('#') ? 'Searching tags...' : 'Searching blogs and users...'}
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {searchQuery.startsWith('#') && (
                        <div className="text-xs text-blue-400 px-3 py-2 bg-blue-900/20 rounded-lg mb-2 mx-2">
                          Tag search results for "{searchQuery}"
                        </div>
                      )}
                      <div className="space-y-1">
                        {searchResults.slice(0, 8).map((result, index) => (
                          <SearchResultItem
                            key={`${result.type}-${result._id || result.id}-${index}`}
                            result={result}
                            onClick={() => onSearchResultClick && onSearchResultClick(result)}
                            searchQuery={searchQuery}
                            index={index}
                          />
                        ))}
                        {searchResults.length > 8 && (
                          <div className="text-center py-2 text-gray-400 text-sm">
                            +{searchResults.length - 8} more results...
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                      <p className="text-xs mt-1">Try searching for blogs, tags, or users</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Tag Suggestions for mobile/tablet */}
            {searchQuery.startsWith('#') && searchQuery.length >= 2 && !isDesktop && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-[#1C222A]/80 backdrop-blur-md border border-gray-600/50 rounded-xl p-3"
              >
                <div className="flex flex-wrap gap-2">
                  {allBlogs
                    .flatMap(blog => blog.tags || [])
                    .filter((tag, index, arr) => arr.indexOf(tag) === index)
                    .filter(tag => tag.toLowerCase().includes(searchQuery.substring(1).toLowerCase()))
                    .slice(0, 6)
                    .map((tag, index) => (
                      <motion.button
                        key={tag}
                        onClick={() => handleSearchChange({ target: { value: `#${tag}` } })}
                        className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm hover:bg-blue-600/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        #{tag}
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Search Result Item Component
const SearchResultItem = ({ result, onClick, searchQuery, index }) => {
  const isTagSearch = searchQuery?.startsWith('#');
  const tagQuery = isTagSearch ? searchQuery.substring(1).toLowerCase() : '';

  return (
    <motion.div
      onClick={onClick}
      className="mx-2 p-3 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600/20"
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {result.type === 'blog' ? (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                Blog
              </span>
              <span className="text-xs text-gray-400">
                {result.views || 0} views
              </span>
            </div>
            <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">
              {result.title}
            </h4>
            <p className="text-gray-300 text-xs line-clamp-2 mb-2">
              {result.content}
            </p>

            {result.tags && result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {result.tags.slice(0, 2).map((tag, tagIndex) => {
                  const isMatchingTag = isTagSearch && tag.toLowerCase().includes(tagQuery);
                  return (
                    <span
                      key={tagIndex}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        isMatchingTag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/50 text-gray-300'
                      }`}
                    >
                      <Hash size={8} className="mr-1" />
                      {tag}
                    </span>
                  );
                })}
                {result.tags.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{result.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{result.author?.name || 'Anonymous'}</span>
              <span>{new Date(result.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <User className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mb-1 inline-block">
              User
            </span>
            <h4 className="text-white font-medium text-sm mb-1">
              {result.name}
            </h4>
            {result.email && (
              <p className="text-gray-300 text-xs">
                {result.email}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchSection;
