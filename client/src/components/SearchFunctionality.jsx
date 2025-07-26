import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, UserIcon, Calendar } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { formatDate } from '../utils/utilityFunctions.js';
import 'simplebar-react/dist/simplebar.min.css';

const SearchFunctionality = ({
  isSearchActive,
  searchQuery,
  searchResults,
  searchLoading,
  searchInputRef,
  onSearchToggle,
  onSearchChange,
  onSearchResultClick,
  onPerformSearch
}) => {
  const searchContentRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      onPerformSearch();
    } else {
      onPerformSearch();
    }
  }, [searchQuery, onPerformSearch]);

  useEffect(() => {
    if (isSearchActive) {
      searchInputRef.current?.focus();

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onSearchToggle();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSearchActive, onSearchToggle, searchInputRef]);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <AnimatePresence>
      {isSearchActive && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="inset-0 flex justify-center items-start pt-4 z-10 px-4"
        >
          <div className="max-w-6xl w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-lg rounded-lg">
            <form onSubmit={handleSearchSubmit} className="flex items-center max-w-7xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Search blogs, users, or content..."
                className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              <button
                type="button"
                onClick={onSearchToggle}
                className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <X className="text-white w-6 h-6" />
              </button>
            </form>

            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 max-h-96 overflow-hidden"
              >
                <SimpleBar
                  ref={searchContentRef}
                  style={{
                    maxHeight: '384px',
                    width: '100%',
                  }}
                  className="pr-2 p-4"
                  forceVisible="y"
                  autoHide={false}
                >
                  {searchLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2 p-2">
                      {searchResults.map((result, index) => (
                        <SearchResultItem
                          key={`${result.type}-${result._id || result.id}-${index}`}
                          result={result}
                          onClick={() => onSearchResultClick(result)}
                        />
                      ))}
                    </div>
                  ) : (
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

const SearchResultItem = ({ result, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600"
  >
    {result.type === 'blog' ? (
      <BlogSearchResult result={result} />
    ) : (
      <UserSearchResult result={result} />
    )}
  </motion.div>
);

const BlogSearchResult = ({ result }) => (
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