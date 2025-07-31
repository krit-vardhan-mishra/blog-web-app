import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Eye, UserIcon, Tag, Target, Bookmark, Clock } from 'lucide-react';
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
        y: -4,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
      }}
      onClick={() => onOpenModal(blog)}
      className="bg-gray-800/50 rounded-lg p-6 shadow-md 
                  border-t-[4px] hover:border-t-[8px] border-blue-500
                  hover:scale-105 hover:bg-[#282c34]
                  transition-all duration-200 ease-in-out
                  relative cursor-pointer group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />

      {/* Header with actions */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-200 pr-4">
            {title}
          </h3>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Bookmark button for non-authors */}
          {!isAuthor && onToggleBookmark && (
            <motion.button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-full transition-all duration-200 ${bookmarkState.isBookmarked
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white'
                }`}
              aria-label={bookmarkState.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark size={16} fill={bookmarkState.isBookmarked ? 'currentColor' : 'none'} />
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
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white transition-all duration-200"
                aria-label="Edit Post"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-full bg-red-700 hover:bg-red-600 hover:scale-110 text-white transition-all duration-200"
                aria-label="Delete Post"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Genre and Difficulty badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-${getGenreColor(genre)}`}>
          {genre}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(readingDifficulty)}`}>
          {getDifficultyIcon(readingDifficulty)} {readingDifficulty}
        </span>
        {averageReadTime > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/30 flex items-center">
            <Clock size={12} className="mr-1" />
            {formatReadTime(averageReadTime)} read
          </span>
        )}
        {engagementScore > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-purple-400 bg-purple-900/30 flex items-center">
            <Target size={14} className="mr-1" />
            {Math.round(engagementScore)} engagement
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
            >
              <Tag size={10} className="mr-1" />
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Content preview */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3 group-hover:text-gray-200 transition-colors duration-200">
        {content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-gray-400 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center group-hover:scale-105 transition-transform duration-200">
            <NavLink
              to={`/user/${author?._id || author?.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex hover:text-blue-400 transition-colors duration-200"
            >
              <UserIcon size={14} className="mr-1 text-blue-400" />
              {author ? author.name : 'Unknown'}
            </NavLink>
          </div>

          <div className="flex items-center text-gray-500">
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {bookmarkState.bookmarkCount > 0 && (
            <div className="flex items-center text-yellow-400">
              <Bookmark size={12} className="mr-1" />
              <span>{bookmarkState.bookmarkCount}</span>
            </div>
          )}

          <div className="flex items-center hover:text-gray-300 transition-colors duration-200">
            <Eye size={14} className="mr-1" />
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