import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Eye, User, Tag, Target, Bookmark, Clock } from 'lucide-react';
import { NavLink } from 'react-router';
import getGenreColor from '@/utils/genreColors';

const PostDetails = ({
  blog,
  userId,
  onOpenModal,
  onEdit,
  onDelete,
  onToggleBookmark,
}) => {
  const {
    _id,
    title,
    content,
    author,
    views,
    genre,
    tags = [],
    readingDifficulty = 'intermediate',
    averageReadTime = 0,
    interactionMetrics = { bookmarks: [] },
    createdAt,
    engagementScore = 0
  } = blog;

  const isAuthor = author?._id === userId;

  const [bookmarkState, setBookmarkState] = useState({
    isBookmarked: interactionMetrics.bookmarks?.includes(userId) || false,
    bookmarkCount: interactionMetrics.bookmarks?.length || 0
  });

  useEffect(() => {
    setBookmarkState({
      isBookmarked: interactionMetrics.bookmarks?.includes(userId) || false,
      bookmarkCount: interactionMetrics.bookmarks?.length || 0
    });
  }, [interactionMetrics, userId]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/30';
      case 'advanced': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  const formatReadTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();

    const result = await onToggleBookmark(_id);
    if (result?.success) {
      setBookmarkState({
        isBookmarked: result.isBookmarked,
        bookmarkCount: result.bookmarkCount,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
      }}
      onClick={() => onOpenModal(blog)}
      className="bg-gray-800/50 rounded-lg p-4 sm:p-6 shadow-md 
                  border-t-[3px] sm:border-t-[4px] hover:border-t-[6px] sm:hover:border-t-[8px] border-blue-500
                  hover:scale-[1.02] sm:hover:scale-105 hover:bg-[#282c34]
                  transition-all duration-200 ease-in-out
                  relative cursor-pointer group mx-2 sm:mx-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />

      {/* Header with actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-200 pr-2 sm:pr-4">
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Bookmark button for non-authors */}
          {!isAuthor && onToggleBookmark && (
            <motion.button
              onClick={handleBookmarkToggle}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${bookmarkState.isBookmarked
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
                }`}
              aria-label={bookmarkState.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark size={14} className="sm:w-4 sm:h-4" fill={bookmarkState.isBookmarked ? 'currentColor' : 'none'} />
            </motion.button>
          )}

          {/* Author actions */}
          {isAuthor && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 sm:p-2 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white transition-all duration-200">
                <Pencil size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 sm:p-2 rounded-full bg-red-700 hover:bg-red-600 hover:scale-110 text-white transition-all duration-200"
                aria-label="Delete Post"
              >
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Genre and Difficulty badges */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-${getGenreColor(genre)}`}>
          {genre}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(readingDifficulty)}`}>
          {getDifficultyIcon(readingDifficulty)} 
          <span className="hidden sm:inline ml-1">{readingDifficulty}</span>
        </span>
        {averageReadTime > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/30 flex items-center">
            <Clock size={10} className="mr-1" />
            {formatReadTime(averageReadTime)}
            <span className="hidden sm:inline ml-1">read</span>
          </span>
        )}
        {engagementScore > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-900/30 flex items-center">
            <Target size={12} className="mr-1" />
            {Math.round(engagementScore)}
            <span className="hidden sm:inline ml-1">engagement</span>
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
          {tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
            >
              <Tag size={8} className="mr-1" />
              <span className="truncate max-w-[80px] sm:max-w-none">{tag}</span>
            </span>
          ))}
          {tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
              +{tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Content preview */}
      <p className="text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 group-hover:text-gray-200 transition-colors duration-200">
        {content}
      </p>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-400 text-xs space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center group-hover:scale-105 transition-transform duration-200">
            <NavLink
              to={`/user/${author?._id || author?.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex hover:text-blue-400 transition-colors duration-200"
            >
              <User size={12} className="mr-1 text-blue-400 flex-shrink-0" />
              <span className="truncate">{author ? author.name : 'Unknown'}</span>
            </NavLink>
          </div>

          <div className="flex items-center text-gray-500">
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3">
          {bookmarkState.bookmarkCount > 0 && (
            <div className="flex items-center text-yellow-400">
              <Bookmark size={10} className="mr-1" />
              <span>{bookmarkState.bookmarkCount}</span>
            </div>
          )}

          <div className="flex items-center hover:text-gray-300 transition-colors duration-200">
            <Eye size={12} className="mr-1" />
            <span>{views || 0}</span>
          </div>
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-lg border border-blue-400/0 group-hover:border-blue-400/20 transition-all duration-200 pointer-events-none" />
    </motion.div>
  );
};

export default PostDetails;