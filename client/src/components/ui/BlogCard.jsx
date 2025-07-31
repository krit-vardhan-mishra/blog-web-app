import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  UserIcon,
  Tag,
  Target,
  Bookmark,
  Clock,
  Eye
} from 'lucide-react';
import getGenreColor, { getColorValue } from '@/utils/genreColors';
import { formatDate } from '@/utils/utilityFunctions';

const BlogCard = memo(({ blog, index, handleBlogClick, handleAuthorClick }) => {
  const genreColor = getGenreColor(blog.genre || 'All');
  const colorValue = getColorValue(genreColor);
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15 },
    },
    hover: {
      scale: 1.01,
      y: -2,
      transition: { duration: 0.1 },
    },
  };

  return (
    <motion.div
      className="break-inside-avoid mb-6 cursor-pointer"
      variants={cardVariants}
      whileHover="hover"
      onClick={() => handleBlogClick(blog._id)}
      initial="hidden"
      animate="visible"
      style={{
        animationDelay: `${index * 0.03}s`
      }}
    >
      <div
        className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 transition-all duration-200 hover:shadow-lg"
        style={{
          '--genre-color': colorValue
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colorValue;
          e.currentTarget.style.boxShadow = `0 10px 15px -3px ${colorValue}20, 0 4px 6px -2px ${colorValue}10`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#374151';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* Title */}
        <h3 className="text-lg font-semibold mb-3 text-white hover:text-blue-300 transition-colors duration-200 line-clamp-2">
          {blog.title}
        </h3>

        {/* Genre, Difficulty, Read Time, Engagement */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: colorValue }}
          >
            {blog.genre || 'Uncategorized'}
          </span>

          {blog.readingDifficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.readingDifficulty === 'beginner' ? 'text-green-400 bg-green-900/30' :
              blog.readingDifficulty === 'intermediate' ? 'text-yellow-400 bg-yellow-900/30' :
                blog.readingDifficulty === 'advanced' ? 'text-red-400 bg-red-900/30' :
                  'text-gray-400 bg-gray-900/30'
              }`}>
              {blog.readingDifficulty === 'beginner' ? '🟢' :
                blog.readingDifficulty === 'intermediate' ? '🟡' :
                  blog.readingDifficulty === 'advanced' ? '🔴' : '⚪'} {blog.readingDifficulty}
            </span>
          )}

          {blog.averageReadTime > 0 && (
            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/30 flex items-center">
              <Clock size={12} className="mr-1" />
              {Math.round(blog.averageReadTime / 60)}m read
            </span>
          )}

          {blog.engagementScore > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-900/30 flex items-center">
              <Target size={12} className="mr-1" />
              {Math.round(blog.engagementScore)} score
            </span>
          )}
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200">
                <Tag size={10} className="mr-1" />
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-4 leading-relaxed">
          {blog.content}
        </p>

        {/* Footer: Author, Date, Views, Bookmarks */}
        <div className="flex items-center justify-between text-xs text-gray-400 space-x-4">
          <div
            className="flex items-center space-x-1 hover:text-blue-300 transition-colors duration-200"
            onClick={(e) => handleAuthorClick(e, blog.author?._id || blog.author?.id)}
          >
            <UserIcon className="w-3 h-3 text-blue-400" />
            <span>{blog.author?.name || 'Anonymous'}</span>
            <div className="flex items-center text-gray-500">
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {blog.interactionMetrics?.bookmarks?.length > 0 && (
              <div className="flex items-center text-yellow-400">
                <Bookmark size={12} className="mr-1" />
                <span>{blog.interactionMetrics.bookmarks.length}</span>
              </div>
            )}

            <div className="flex items-center text-gray-400 hover:text-blue-300 transition-colors duration-200">
              <Eye size={12} className="mr-1" />
              <span>{blog.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default BlogCard;