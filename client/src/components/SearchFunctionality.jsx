import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, UserIcon, Calendar, Tag, Clock } from 'lucide-react';
import SimpleBar from 'simplebar-react'; // Custom scrollbar library
import 'simplebar-react/dist/simplebar.min.css'; // Styles for SimpleBar
import { formatDate } from '@/utils/utilityFunctions.js';
import TagSuggestions from './TagSuggestions';

const SearchFunctionality = ({
  isSearchActive,
  searchQuery,
  searchResults,
  searchLoading,
  searchInputRef,
  onSearchToggle,
  onSearchChange,
  onSearchResultClick,
  onPerformSearch,
  allBlogs = [] // Used for tag suggestions
}) => {
  const searchContentRef = useRef(null); // Ref for the scrollable search results container

  // Determine if tag suggestions should be shown based on search query
  const showTagSuggestions = useMemo(() => {
    return searchQuery.startsWith('#') && searchQuery.length >= 2;
  }, [searchQuery]);

  // Callback for when a tag is selected from suggestions
  const handleTagSelect = useCallback((tag) => {
    const event = { target: { value: tag } };
    onSearchChange(event); // Update the search query with the selected tag
  }, [onSearchChange]);

  // Effect to perform search whenever the search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      onPerformSearch();
    } else {
      onPerformSearch(); // Also perform search if query is empty (e.g., to clear results)
    }
  }, [searchQuery, onPerformSearch]);

  // Effect to handle search input focus and keyboard events (like Escape to close)
  useEffect(() => {
    if (isSearchActive) {
      searchInputRef.current?.focus(); // Focus the input when search is active

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onSearchToggle(); // Close search on Escape key press
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown); // Clean up event listener
      };
    }
  }, [isSearchActive, onSearchToggle, searchInputRef]);

  // Callback for form submission (prevents default browser behavior)
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Define animation variants for the main search overlay
  const searchOverlayVariants = {
    hidden: { opacity: 0, y: -50 }, // Start invisible and slide from top
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }, // Fade in and slide to position
    exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }, // Fade out and slide up on exit
  };

  // Define animation variants for individual search result items
  const resultItemVariants = {
    hidden: { opacity: 0, y: 20 }, // Start invisible and slightly below
    visible: (i) => ({ // Use a function to allow staggered animation
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, // Stagger results by 50ms each
        type: "spring",
        stiffness: 300,
        damping: 30
      },
    }),
  };

  return (
    <AnimatePresence>
      {isSearchActive && (
        <motion.div
          variants={searchOverlayVariants} // Apply overlay animations
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 flex justify-center items-start pt-4 z-10 px-4"
          // Using `fixed` and `inset-0` to cover the entire screen
        >
          <div className="max-w-6xl w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-lg rounded-lg relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center max-w-7xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search blogs, tags, authors, or content... (use #tag for tag search)"
                className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              <motion.button
                type="button"
                onClick={onSearchToggle}
                className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }} // Rotate and scale on hover
                whileTap={{ scale: 0.9 }} // Shrink on tap
              >
                <X className="text-white w-6 h-6" />
              </motion.button>
            </form>

            {/* Tag Suggestions component, shown conditionally */}
            <TagSuggestions
              searchQuery={searchQuery}
              allBlogs={allBlogs}
              onTagSelect={handleTagSelect}
              isVisible={showTagSuggestions && !searchLoading}
            />

            {/* Search Results Area - only shown if there's a search query */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} // Fade in and slight slide up for results container
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-h-96 overflow-hidden" // Limit height and hide overflow
              >
                <SimpleBar // Custom scrollbar for a better UX
                  ref={searchContentRef}
                  style={{
                    maxHeight: '384px', // Max height for the scrollable area
                    width: '100%',
                  }}
                  className="pr-2 p-4"
                  forceVisible="y"
                  autoHide={false}
                >
                  {searchLoading ? (
                    // Loading indicator
                    <div className="text-center py-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="text-sm text-gray-400">
                          {searchQuery.includes('#') ? 'Searching tags...' : 'Searching blogs and users...'}
                        </p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    // Display search results
                    <div className="space-y-2 p-2">
                      {searchQuery.startsWith('#') && (
                        <div className="text-xs text-blue-400 px-2 py-1 bg-blue-900/30 rounded">
                          Tag search results for "{searchQuery}"
                        </div>
                      )}
                      {searchResults.map((result, index) => (
                        <SearchResultItem
                          key={`${result.type}-${result._id || result.id}-${index}`}
                          result={result}
                          onClick={() => onSearchResultClick(result)}
                          searchQuery={searchQuery}
                          index={index} // Pass index for staggered animation
                          variants={resultItemVariants} // Apply item animation variants
                        />
                      ))}
                    </div>
                  ) : (
                    // No results message
                    <div className="text-center py-4 text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </SimpleBar>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Component for a single search result item, with entrance and hover animations
const SearchResultItem = ({ result, onClick, searchQuery, index, variants }) => (
  <motion.div
    variants={variants} // Use the variants passed from parent
    initial="hidden"
    animate="visible"
    custom={index} // Pass index as custom prop for staggered animation
    whileHover={{ scale: 1.02 }} // Subtle scale on hover
    onClick={onClick}
    className="p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600"
  >
    {result.type === 'blog' ? (
      <BlogSearchResult result={result} searchQuery={searchQuery} />
    ) : (
      <UserSearchResult result={result} />
    )}
  </motion.div>
);

// Component to display a blog search result
const BlogSearchResult = ({ result, searchQuery }) => {
  const isTagSearch = searchQuery?.startsWith('#');
  const tagQuery = isTagSearch ? searchQuery.substring(1).toLowerCase() : '';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
          Blog
        </span>
        <div className="flex items-center space-x-1 text-gray-400 text-xs">
          <Eye className="w-3 h-3" />
          <span>{result.views || 0}</span>
        </div>
      </div>
      <h4 className="text-white font-medium mb-1 line-clamp-1">
        {result.title}
      </h4>
      <p className="text-gray-300 text-sm line-clamp-2 mb-2">
        {result.content}
      </p>

      {/* Tags section, highlighting matching tags if it's a tag search */}
      {result.tags && result.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {result.tags.slice(0, 3).map((tag, index) => {
            const isMatchingTag = isTagSearch && tag.toLowerCase().includes(tagQuery);
            return (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                  isMatchingTag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Tag size={8} className="mr-1" />
                {tag}
              </span>
            );
          })}
          {result.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
              +{result.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Author and Date for blog result */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <UserIcon className="w-3 h-3" />
          <span>{result.author?.name || 'Anonymous'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(result.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

// Component to display a user search result
const UserSearchResult = ({ result }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
        User
      </span>
    </div>
    <h4 className="text-white font-medium mb-1">
      {result.name}
    </h4>
    {result.email && (
      <p className="text-gray-300 text-sm">
        {result.email}
      </p>
    )}
  </div>
);

export default SearchFunctionality;