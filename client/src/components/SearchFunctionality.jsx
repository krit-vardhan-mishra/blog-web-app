import React, { useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, UserIcon, Calendar, Tag, Clock } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { formatDate } from '../utils/utilityFunctions.js';
import TagSuggestions from './TagSuggestions.jsx';
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
  onPerformSearch,
  allBlogs = [] 
}) => {
  const searchContentRef = useRef(null);
  
  const showTagSuggestions = useMemo(() => {
    return searchQuery.startsWith('#') && searchQuery.length >= 2;
  }, [searchQuery]);

  const handleTagSelect = useCallback((tag) => {
    const event = { target: { value: tag } };
    onSearchChange(event);
  }, [onSearchChange]);

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
              <button
                type="button"
                onClick={onSearchToggle}
                className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              >
                <X className="text-white w-6 h-6" />
              </button>
            </form>

            {/* Tag Suggestions */}
            <TagSuggestions
              searchQuery={searchQuery}
              allBlogs={allBlogs}
              onTagSelect={handleTagSelect}
              isVisible={showTagSuggestions && !searchLoading}
            />

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
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                        <p className="text-sm text-gray-400">
                          {searchQuery.includes('#') ? 'Searching tags...' : 'Searching blogs and users...'}
                        </p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
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

const SearchResultItem = ({ result, onClick, searchQuery }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
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
      
      {/* Tags */}
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