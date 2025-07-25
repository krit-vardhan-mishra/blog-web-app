import React from 'react';
import { Tag, BookOpen, TrendingUp } from 'lucide-react';

const GenreSelector = ({ 
  selectedGenre, 
  onGenreChange, 
  disabled = false,
  showLabel = true,
  size = 'default' 
}) => {
  const genres = [
    { value: 'All', label: 'All Categories', icon: '🌐', color: 'bg-gray-600' },
    { value: 'Lifestyle', label: 'Lifestyle', icon: '🌟', color: 'bg-pink-600' },
    { value: 'Business', label: 'Business', icon: '💼', color: 'bg-blue-600' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-purple-600' },
    { value: 'Science', label: 'Science', icon: '🔬', color: 'bg-green-600' },
    { value: 'Art', label: 'Art', icon: '🎨', color: 'bg-indigo-600' },
    { value: 'Sports', label: 'Sports', icon: '⚽', color: 'bg-orange-600' },
    { value: 'Technology', label: 'Technology', icon: '💻', color: 'bg-cyan-600' },
    { value: 'Health', label: 'Health', icon: '🏥', color: 'bg-red-600' },
    { value: 'Travel', label: 'Travel', icon: '✈️', color: 'bg-teal-600' },
    { value: 'Food', label: 'Food', icon: '🍳', color: 'bg-yellow-600' },
    { value: 'Education', label: 'Education', icon: '📚', color: 'bg-emerald-600' }
  ];

  const sizeClasses = {
    small: 'text-sm py-1 px-2',
    default: 'text-base py-2 px-3',
    large: 'text-lg py-3 px-4'
  };

  const containerClasses = {
    small: 'mb-3',
    default: 'mb-4',
    large: 'mb-6'
  };

  return (
    <div className={`${containerClasses[size]}`}>
      {showLabel && (
        <label className="flex items-center mb-2 font-medium text-white">
          <Tag className="mr-2 w-4 h-4" />
          Genre/Category
        </label>
      )}
      
      <div className="relative">
        <select
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full ${sizeClasses[size]} bg-[#1C222A] border border-gray-600 rounded-lg 
            focus:outline-none focus:border-blue-500 text-white
            disabled:bg-gray-700 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            hover:border-gray-500 transition-colors duration-200
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
            paddingLeft: '2rem'
          }}
        >
          {genres.map((genre) => (
            <option 
              key={genre.value} 
              value={genre.value}
              className="bg-[#1C222A] text-white"
            >
              {genre.icon} {genre.label}
            </option>
          ))}
        </select>
        
        {/* Custom styling indicator */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <div className={`w-2 h-2 rounded-full ${
            genres.find(g => g.value === selectedGenre)?.color || 'bg-gray-600'
          }`} />
        </div>
      </div>

      {/* Genre chips display (optional) */}
      <div className="mt-2 flex flex-wrap gap-1">
        {selectedGenre !== 'All' && (
          <span className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white
            ${genres.find(g => g.value === selectedGenre)?.color || 'bg-gray-600'}
          `}>
            <span className="mr-1">
              {genres.find(g => g.value === selectedGenre)?.icon}
            </span>
            {genres.find(g => g.value === selectedGenre)?.label}
          </span>
        )}
      </div>
    </div>
  );
};

export const GenreFilter = ({ 
  selectedGenres = [], 
  onGenreToggle, 
  multiSelect = false,
  showStats = false,
  blogCounts = {}
}) => {
  const genres = [
    { value: 'All', label: 'All', icon: '🌐', color: 'bg-gray-600' },
    { value: 'Lifestyle', label: 'Lifestyle', icon: '🌟', color: 'bg-pink-600' },
    { value: 'Business', label: 'Business', icon: '💼', color: 'bg-blue-600' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-purple-600' },
    { value: 'Science', label: 'Science', icon: '🔬', color: 'bg-green-600' },
    { value: 'Art', label: 'Art', icon: '🎨', color: 'bg-indigo-600' },
    { value: 'Sports', label: 'Sports', icon: '⚽', color: 'bg-orange-600' },
    { value: 'Technology', label: 'Technology', icon: '💻', color: 'bg-cyan-600' },
    { value: 'Health', label: 'Health', icon: '🏥', color: 'bg-red-600' },
    { value: 'Travel', label: 'Travel', icon: '✈️', color: 'bg-teal-600' },
    { value: 'Food', label: 'Food', icon: '🍳', color: 'bg-yellow-600' },
    { value: 'Education', label: 'Education', icon: '📚', color: 'bg-emerald-600' }
  ];

  const handleGenreClick = (genreValue) => {
    if (multiSelect) {
      const isSelected = selectedGenres.includes(genreValue);
      if (isSelected) {
        onGenreToggle(selectedGenres.filter(g => g !== genreValue));
      } else {
        onGenreToggle([...selectedGenres, genreValue]);
      }
    } else {
      onGenreToggle(genreValue);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
        <TrendingUp className="mr-2 w-5 h-5" />
        Filter by Genre
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => {
          const isSelected = multiSelect 
            ? selectedGenres.includes(genre.value)
            : selectedGenres === genre.value;
          
          const count = blogCounts[genre.value] || 0;
          
          return (
            <button
              key={genre.value}
              onClick={() => handleGenreClick(genre.value)}
              className={`
                inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 transform hover:scale-105
                ${isSelected 
                  ? `${genre.color} text-white shadow-lg` 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              <span className="mr-2">{genre.icon}</span>
              {genre.label}
              {showStats && count > 0 && (
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs
                  ${isSelected ? 'bg-white/20' : 'bg-gray-600'}
                `}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GenreSelector;