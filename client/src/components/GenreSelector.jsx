import React from 'react';
import { Tag } from 'lucide-react';
import { genres } from '@/utils/genres';

const GenreSelector = ({
  selectedGenre,
  onGenreChange,
  disabled = false,
  showLabel = true,
  size = 'default'
}) => {
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
              {genre.label} {genre.icon}
            </option>
          ))}
        </select>

        {/* Left-side colored dot indicator */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <div className={`w-2 h-2 rounded-full ${genres.find(g => g.value === selectedGenre)?.color || 'bg-gray-600'}`} />
        </div>
      </div>

      {/* Genre Chip with Emoji shown here instead */}
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

export default GenreSelector;