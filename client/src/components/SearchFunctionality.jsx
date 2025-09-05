import React, { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, UserIcon, Calendar, Tag, Clock, Search, Hash, FileText, User } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
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
  allBlogs = []
}) => {
  const searchContentRef = useRef(null);
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

  const resultItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 30
      },
    }),
  };

  const getSearchPlaceholder = () => {
    if (isMobile) return "Search blogs, tags...";
    if (isTablet) return "Search blogs, tags, authors...";
    return "Search blogs, tags, authors, or content... (use #tag for tag search)";
  };

  const getSearchIcon = () => {
    if (searchQuery.startsWith('#')) return <Hash className="w-5 h-5 text-blue-400" />;
    if (searchQuery.toLowerCase().includes('user') || searchQuery.toLowerCase().includes('author')) return <User className="w-5 h-5 text-green-400" />;
    return <Search className="w-5 h-5 text-gray-400" />;
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
            onClick={onSearchToggle}
          />

          <div className={`
            max-w-6xl w-full px-4 py-3 bg-[#1C222A]/90 backdrop-blur-md border border-gray-600/50
            shadow-2xl rounded-2xl relative overflow-hidden
            ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-6xl'}
          `}>
            <form onSubmit={handleSearchSubmit} className="flex items-center max-w-7xl mx-auto">
              {/* Search Icon */}
              <div className="pl-4 pr-2 flex items-center">
                <motion.div
                  animate={{ rotate: searchQuery ? 0 : 360 }}
                  transition={{ duration: 0.3 }}
                >
                  {getSearchIcon()}
                </motion.div>
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={getSearchPlaceholder()}
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              <motion.button
                type="button"
                onClick={onSearchToggle}
                className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="text-white w-6 h-6" />
              </motion.button>
            </form>

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
                className="mt-4 max-h-96 overflow-hidden border-t border-gray-600/30"
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
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"
                        />
                        <p className="text-sm text-gray-400">
                          {searchQuery.includes('#') ? 'Searching tags...' : 'Searching blogs and users...'}
                        </p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2 p-2">
                      {searchQuery.startsWith('#') && (
                        <div className="text-xs text-blue-400 px-2 py-1 bg-blue-900/30 rounded mb-2">
                          Tag search results for "{searchQuery}"
                        </div>
                      )}
                      {searchResults.map((result, index) => (
                        <SearchResultItem
                          key={`${result.type}-${result._id || result.id}-${index}`}
                          result={result}
                          onClick={() => onSearchResultClick(result)}
                          searchQuery={searchQuery}
                          index={index}
                          variants={resultItemVariants}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                      <p className="text-xs mt-1">Try searching for blogs, tags, or users</p>
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

const BlogSearchResult = ({ result, highlightText, searchQuery }) => {
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
        {highlightText ? highlightText(result.title, searchQuery) : result.title}
      </h4>
      <p className="text-gray-300 text-sm line-clamp-2 mb-2">
        {highlightText ? highlightText(result.content, searchQuery) : result.content}
      </p>

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

const UserSearchResult = ({ result, highlightText, searchQuery }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
        User
      </span>
    </div>
    <h4 className="text-white font-medium mb-1">
      {highlightText ? highlightText(result.name, searchQuery) : result.name}
    </h4>
    {result.email && (
      <p className="text-gray-300 text-sm">
        {highlightText ? highlightText(result.email, searchQuery) : result.email}
      </p>
    )}
  </div>
);

const SearchResultItem = ({ result, onClick, searchQuery, index, variants }) => {
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-blue-500/30 text-blue-300 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getResultType = () => {
    if (result.type === 'blog' || result.title) return 'blog';
    if (result.type === 'user' || result.name) return 'user';
    return 'unknown';
  };

  const renderResult = () => {
    const type = getResultType();
    switch (type) {
      case 'blog':
        return <BlogSearchResult result={result} highlightText={highlightText} searchQuery={searchQuery} />;
      case 'user':
        return <UserSearchResult result={result} highlightText={highlightText} searchQuery={searchQuery} />;
      default:
        return <div>Unknown result type</div>;
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      custom={index}
      className="group cursor-pointer p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-blue-500/50 transition-all duration-200"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {renderResult()}
    </motion.div>
  );
};

export default SearchFunctionality;