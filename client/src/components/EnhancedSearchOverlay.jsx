import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, User, Hash, FileText, ChevronDown, Eye, Calendar, Tag, Clock } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const EnhancedSearchOverlay = ({
  isOpen,
  onClose,
  onSearchResults,
  onSearchResultClick,
  searchService,
  allBlogs = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('none');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const filterDropdownRef = useRef(null);

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

  const filterOptions = [
    { value: 'none', label: 'Select Search Type', icon: Search, isDefault: true },
    { value: 'all', label: 'All Results', icon: Search },
    { value: 'blogs', label: 'All Blogs', icon: FileText },
    { value: 'title', label: 'Blog Title', icon: FileText },
    { value: 'content', label: 'Blog Content', icon: FileText },
    { value: 'tags', label: 'Blog Tags', icon: Hash },
    { value: 'users', label: 'Users', icon: User },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((query, filter) => {
    if (!query.trim()) return;
    
    const newSearch = { query, filter, timestamp: Date.now() };
    const updated = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    
    const handleScroll = (e) => {
      // Prevent background scrolling when dropdown is scrolled
      if (showFilterDropdown && e.target.closest('.filter-dropdown-menu')) {
        e.stopPropagation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('wheel', handleScroll, { passive: false });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('wheel', handleScroll);
    };
  }, [showFilterDropdown]);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    // Only perform search if a filter is selected
    if (searchFilter !== 'none') {
      setIsLoading(true);

      debounceTimerRef.current = setTimeout(() => {
        performSearch(searchQuery, searchFilter);
      }, 300);
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, searchFilter]);

  const performSearch = async (query, filter) => {
    try {
      setIsLoading(true);
      
      // Check if filter is selected
      if (filter === 'none') {
        setSearchResults([]);
        return;
      }
      
      const results = await searchService.search({
        query: query.trim(),
        filter,
        limit: 20
      });

      setSearchResults(results);
      onSearchResults && onSearchResults(results);
      
      // Save to recent searches
      saveRecentSearch(query, filter);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    setSearchFilter(newFilter);
    setShowFilterDropdown(false);
  };

  const handleRecentSearchClick = (recentSearch) => {
    setSearchQuery(recentSearch.query);
    setSearchFilter(recentSearch.filter);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getCurrentFilterIcon = () => {
    const filter = filterOptions.find(f => f.value === searchFilter);
    return filter ? filter.icon : Search;
  };

  const getCurrentFilterLabel = () => {
    const filter = filterOptions.find(f => f.value === searchFilter);
    return filter ? filter.label : 'All Results';
  };

  const getSearchPlaceholder = () => {
    if (isMobile) return "Search blogs, tags...";
    if (isTablet) return "Search blogs, tags, authors...";
    return "Search blogs, tags, authors, or content...";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-4 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut", type: "spring", stiffness: 300, damping: 30 }}
          className={`bg-[#1C222A]/90 backdrop-blur-md border border-gray-600/50 shadow-2xl w-full mx-4 max-h-[100vh] overflow-hidden rounded-2xl
            ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-2xl' : 'max-w-4xl'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div className="p-6 border-b border-gray-600/30">
            {/* Required search type notice */}
            {searchFilter === 'none' && (
              <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <p className="text-sm text-blue-400 flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Please select a search type from the dropdown to begin searching
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="relative w-full sm:flex-1 flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder={searchFilter === 'none' 
                    ? "Select a search type first..." 
                    : getSearchPlaceholder()}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200
                  ${searchFilter === 'none' 
                    ? 'border-gray-600/50' 
                    : 'border-gray-500/50 hover:border-gray-400/50'}`}
                  disabled={searchFilter === 'none'}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Filter Dropdown */}
                <div className="relative flex-1 sm:flex-none" ref={filterDropdownRef}>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event bubbling
                      setShowFilterDropdown(!showFilterDropdown);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 border rounded-xl hover:bg-gray-700/50 transition-colors duration-200
                    ${searchFilter === 'none'
                      ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
                      : 'bg-gray-800/50 border-gray-500/50 text-gray-300'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {React.createElement(getCurrentFilterIcon(), { 
                      className: `w-4 h-4 ${searchFilter === 'none' ? 'text-blue-400' : 'text-gray-400'}` 
                    })}
                    <span className={`hidden sm:inline text-sm font-medium ${
                      searchFilter === 'none' 
                        ? 'text-blue-700 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {getCurrentFilterLabel()}
                    </span>
                    <span className="sm:hidden text-sm font-medium">
                      Filter
                    </span>
                    <ChevronDown className={`w-4 h-4 ${
                      searchFilter === 'none' 
                        ? 'text-blue-500 dark:text-blue-400' 
                        : 'text-gray-500'
                    }`} />
                  </motion.button>

                  <AnimatePresence>
                    {showFilterDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="filter-dropdown-menu absolute transform -translate-x-1/2 sm:left-auto sm:right-0 sm:transform-none mt-2 w-64 max-h-72 overflow-y-auto bg-[#1C222A]/95 backdrop-blur-md border border-gray-600/50 rounded-xl shadow-2xl z-[999]"
                        style={{
                          top: '100%',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#4B5563 #1F2937',
                          overscrollBehavior: 'contain'
                        }}
                      >
                        {filterOptions.map((option, index) => (
                          <motion.button
                            key={option.value}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              handleFilterChange(option.value);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700/50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                              searchFilter === option.value
                                ? 'bg-blue-900/30 text-blue-400 border-l-2 border-blue-500/50'
                                : 'text-gray-300 hover:text-white'
                            } focus:outline-none focus:ring-1 focus:ring-blue-400`}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {React.createElement(option.icon, {
                              className: `w-4 h-4 ${searchFilter === option.value ? 'text-blue-400' : 'text-gray-400'}`
                            })}
                            <span className="text-sm font-medium">{option.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={onClose}
                  className="p-3 rounded-xl hover:bg-gray-700/50 transition-colors duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="text-white w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-hidden">
            <SimpleBar style={{ minHeight: '30vh', maxHeight: '100vh' }}>
              <div className="p-6">
                {/* Recent Searches */}
                {!searchQuery && recentSearches.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {recentSearches.map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(recent)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                          {recent.query}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {recent.filter === 'all' ? 'All' : recent.filter}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && searchQuery && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {/* Search Results */}
                {!isLoading && searchQuery && (
                  <div className="space-y-3">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <SearchResultItem
                          key={`${result.type}-${result._id || result.id}-${index}`}
                          result={result}
                          onClick={() => {
                            if (onSearchResultClick) {
                              onSearchResultClick(result);
                            }
                            onClose();
                          }}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400">
                          No results found for "{searchQuery}"
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!searchQuery && recentSearches.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">
                      Start typing to search
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Search for blogs, users, or tags
                    </p>
                  </div>
                )}
              </div>
            </SimpleBar>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SearchResultItem = ({ result, onClick }) => {
  const getResultIcon = () => {
    switch (result.type) {
      case 'blog':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'user':
        return <User className="w-5 h-5 text-green-400" />;
      case 'tag':
        return <Hash className="w-5 h-5 text-purple-400" />;
      default:
        return <Search className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResultTitle = () => {
    switch (result.type) {
      case 'blog':
        return result.title;
      case 'user':
        return result.name;
      case 'tag':
        return `#${result.tag}`;
      default:
        return 'Unknown';
    }
  };

  const getResultSubtitle = () => {
    switch (result.type) {
      case 'blog':
        return `By ${result.author?.name || 'Unknown'} • ${result.genre || 'Uncategorized'}`;
      case 'user':
        return result.username || 'User profile';
      case 'tag':
        return `${result.count || 0} posts`;
      default:
        return '';
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-blue-500/50 transition-all duration-200 group"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0">
        {getResultIcon()}
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {getResultTitle()}
        </h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
          {getResultSubtitle()}
        </p>
      </div>
      {result.type === 'blog' && result.views && (
        <div className="flex items-center space-x-1 text-gray-400 text-xs">
          <Eye className="w-3 h-3" />
          <span>{result.views}</span>
        </div>
      )}
    </motion.button>
  );
};

export default EnhancedSearchOverlay;