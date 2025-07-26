import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, SortAsc, SortDesc, Tag, Target, Clock } from 'lucide-react';
import GenreFilter from './GenreFilter';

const BlogFilters = ({
  onFiltersChange,
  onSearchChange,
  blogCounts = {},
  totalBlogs = 0,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['All']);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created', icon: Clock },
    { value: 'views', label: 'Views', icon: SortDesc },
    { value: 'title', label: 'Title', icon: SortAsc },
    { value: 'averageReadTime', label: 'Read Time', icon: Clock },
    { value: 'engagementScore', label: 'Engagement', icon: Target }
  ];

  const difficultyOptions = [
    { value: '', label: 'All Levels', icon: '🌐' },
    { value: 'beginner', label: 'Beginner', icon: '🟢' },
    { value: 'intermediate', label: 'Intermediate', icon: '🟡' },
    { value: 'advanced', label: 'Advanced', icon: '🔴' }
  ];

  useEffect(() => {
    const filters = {
      search: searchTerm,
      genre: selectedGenres.includes('All') ? undefined : selectedGenres[0],
      difficulty: selectedDifficulty,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sortBy,
      order: sortOrder
    };

    onFiltersChange(filters);
  }, [searchTerm, selectedGenres, selectedDifficulty, selectedTags, sortBy, sortOrder, onFiltersChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearchChange]);

  const handleGenreChange = (genre) => {
    if (genre === 'All') {
      setSelectedGenres(['All']);
    } else {
      setSelectedGenres([genre]);
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !selectedTags.includes(newTag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedGenres(['All']);
    setSelectedDifficulty('');
    setSelectedTags([]);
    setTagInput('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = searchTerm || 
    !selectedGenres.includes('All') || 
    selectedDifficulty || 
    selectedTags.length > 0 || 
    sortBy !== 'createdAt' || 
    sortOrder !== 'desc';

  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search blogs by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-[#1C222A] text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors duration-200" />
            </button>
          )}
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={isLoading}
              className="px-3 py-2 bg-[#1C222A] border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              disabled={isLoading}
              className="p-2 bg-[#1C222A] border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors duration-200"
              title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors duration-200"
          >
            <Filter size={16} />
            <span>Advanced Filters</span>
            <ChevronDown 
              size={16} 
              className={`transform transition-transform duration-200 ${
                showAdvancedFilters ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-colors duration-200"
            >
              <X size={16} />
              <span>Clear All</span>
            </button>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-400 ml-auto">
            {isLoading ? 'Loading...' : `${totalBlogs} blog${totalBlogs !== 1 ? 's' : ''} found`}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-600">
            {/* Genre Filter */}
            <GenreFilter
              selectedGenres={selectedGenres[0] || 'All'}
              onGenreToggle={handleGenreChange}
              showStats={true}
              blogCounts={blogCounts}
            />

            {/* Difficulty Filter */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                <Target className="mr-2 w-4 h-4" />
                Reading Difficulty
              </h4>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDifficulty(option.value)}
                    disabled={isLoading}
                    className={`
                      inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 transform hover:scale-105
                      ${selectedDifficulty === option.value
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                <Tag className="mr-2 w-4 h-4" />
                Filter by Tags
              </h4>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        disabled={isLoading}
                        className="ml-2 hover:text-red-300 transition-colors duration-200"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag to filter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  disabled={isLoading || selectedTags.length >= 5}
                  className="flex-1 px-3 py-2 bg-[#1C222A] border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  maxLength={30}
                />
                <button
                  onClick={addTag}
                  disabled={isLoading || !tagInput.trim() || selectedTags.length >= 5}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {selectedTags.length}/5 tags selected
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogFilters;