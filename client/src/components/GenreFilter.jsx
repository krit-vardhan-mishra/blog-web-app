import React from 'react';
import { TrendingUp } from 'lucide-react';
import { genres } from '@/utils/genres';

const GenreFilter = ({
  selectedGenres = [],
  onGenreToggle,
  multiSelect = false,
  showStats = false,
  blogCounts = {}
}) => {
  const handleGenreClick = (genreValue) => {
    if (multiSelect) {
      const isSelected = selectedGenres.includes(genreValue);
      const updated = isSelected
        ? selectedGenres.filter((g) => g !== genreValue)
        : [...selectedGenres, genreValue];
      onGenreToggle(updated);
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
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 transform hover:scale-105
                ${isSelected ? `${genre.color} text-white shadow-lg` : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <span className="mr-2">{genre.icon}</span>
              {genre.label}
              {showStats && count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isSelected ? 'bg-white/20' : 'bg-gray-600'}`}>
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

export default GenreFilter;