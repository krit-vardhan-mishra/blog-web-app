import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Tag,
  Target,
  Bookmark,
  Clock,
  Eye
} from 'lucide-react';
import { formatDate } from '@/utils/utilityFunctions';
import getGenreColor, { getColorValue } from '@/utils/genreColors';

const BlogCard = memo(({ blog, index, handleBlogClick, handleAuthorClick }) => {
  const genreColor = getGenreColor(blog.genre || 'All');
  const colorValue = getColorValue(genreColor);

  // Define animation variants for the card's appearance and hover state.
  const cardVariants = {
    // Initial hidden state for entrance animation
    hidden: { opacity: 0, scale: 0.98 },
    // Visible state after animation
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15 }, // Quick transition for quick appearance
    },
    // Hover state for interactive feedback
    hover: {
      scale: 1.01, // Slightly enlarge on hover
      y: -2, // Lift slightly on hover
      transition: { duration: 0.1 }, // Quick transition for responsiveness
    },
  };

  return (
    <motion.div
      className="break-inside-avoid mb-4 sm:mb-6 cursor-pointer"
      variants={cardVariants} // Apply defined variants
      whileHover="hover" // Trigger "hover" variant on hover
      onClick={() => handleBlogClick(blog._id)} // Handle click to navigate to blog details
      initial="hidden" // Start from the "hidden" state
      animate="visible" // Animate to the "visible" state
      style={{
        animationDelay: `${index * 0.03}s` // Stagger animation based on index in the list
      }}
    >
      <div
        className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-gray-700 transition-all duration-200 hover:shadow-lg"
        style={{
          '--genre-color': colorValue // Custom CSS property for genre-based styling
        }}
        // Dynamic border color and shadow on mouse enter based on genre
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colorValue;
          e.currentTarget.style.boxShadow = `0 10px 15px -3px ${colorValue}20, 0 4px 6px -2px ${colorValue}10`;
        }}
        // Reset border color and shadow on mouse leave
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#374151'; // Default gray border
          e.currentTarget.style.boxShadow = ''; // Clear shadow
        }}
      >
        {/* Blog Title */}
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white hover:text-blue-300 transition-colors duration-200 line-clamp-2">
          {blog.title}
        </h3>

        {/* Metadata: Genre, Difficulty, Read Time, Engagement Score */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          {/* Genre Tag */}
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: colorValue }}
          >
            {blog.genre || 'Uncategorized'}
          </span>

          {/* Reading Difficulty Tag */}
          {blog.readingDifficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.readingDifficulty === 'beginner' ? 'text-green-400 bg-green-900/30' :
              blog.readingDifficulty === 'intermediate' ? 'text-yellow-400 bg-yellow-900/30' :
                blog.readingDifficulty === 'advanced' ? 'text-red-400 bg-red-900/30' :
                  'text-gray-400 bg-gray-900/30'
              }`}>
              {/* Emojis for difficulty levels */}
              {blog.readingDifficulty === 'beginner' ? '📚' :
                blog.readingDifficulty === 'intermediate' ? '🧠' :
                  blog.readingDifficulty === 'advanced' ? '🧪' : '✨'}
              <span className="hidden sm:inline ml-1">{blog.readingDifficulty}</span>
            </span>
          )}

          {/* Average Read Time Tag */}
          {blog.averageReadTime > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/30 flex items-center">
              <Clock size={10} className="mr-1" />
              {Math.round(blog.averageReadTime / 60)}m
              <span className="hidden sm:inline ml-1">read</span>
            </span>
          )}

          {/* Engagement Score Tag */}
          {blog.engagementScore > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-900/30 flex items-center">
              <Target size={10} className="mr-1" />
              {Math.round(blog.engagementScore)}
              <span className="hidden sm:inline ml-1">score</span>
            </span>
          )}
        </div>

        {/* Tags Section */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {blog.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200">
                <Tag size={8} className="mr-1" />
                <span className="truncate max-w-[80px] sm:max-w-none">{tag}</span>
              </span>
            ))}
            {blog.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
                +{blog.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Blog Content Snippet */}
        <p className="text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-4 leading-relaxed">
          {blog.content}
        </p>

        {/* Footer: Author, Date, Views, Bookmarks */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 space-y-2 sm:space-y-0">
          {/* Author and Date */}
          <div
            className="flex items-center space-x-1 hover:text-blue-300 transition-colors duration-200"
            onClick={(e) => handleAuthorClick(e, blog.author?._id || blog.author?.id)} // Handle author click, preventing blog click propagation
          >
            <User className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span className="truncate">{blog.author?.name || 'Deleted User'}</span>
            <span className="text-gray-500 ml-1 flex-shrink-0">{formatDate(blog.createdAt)}</span>
          </div>

          {/* Bookmarks and Views */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            {blog.interactionMetrics?.bookmarks?.length > 0 && (
              <div className="flex items-center text-yellow-400">
                <Bookmark size={10} className="mr-1" />
                <span>{blog.interactionMetrics.bookmarks.length}</span>
              </div>
            )}

            <div className="flex items-center text-gray-400 hover:text-blue-300 transition-colors duration-200">
              <Eye size={10} className="mr-1" />
              <span>{blog.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default BlogCard;
