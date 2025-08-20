import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, UserIcon, Tag, Target, Bookmark, Clock, Calendar, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import EditPostModal from './EditPostModal';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import blogService from '../../../api/blogService';
import { NavLink } from 'react-router-dom'; // Changed to react-router-dom for NavLink
import { formatDate } from '../../../utils/utilityFunctions';
import { parseEmojisEnhanced } from '../../../utils/emojiParser';
import { getScrollDepth } from '../../../utils/scrollUtils';
import getGenreColor from '@/utils/genreColors';
import ShareButton from '../../ShareButton';

const PostModal = ({
  isOpen,
  onClose,
  blog,
  token,
  userId,
  onEdit,
  onDelete,
  onViewIncrement,
  onToggleBookmark,
}) => {
  const {
    title,
    content,
    author,
    views,
    _id,
    id,
    createdAt,
    genre = 'All',
    tags = [],
    readingDifficulty = 'intermediate',
    averageReadTime = 0,
    interactionMetrics = { bookmarks: [] },
    engagementScore = 0
  } = blog || {};

  const blogId = id || _id;
  const startTime = useRef(Date.now());
  const scrollPositions = useRef([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentViews, setCurrentViews] = useState(views);
  const [showDetails, setShowDetails] = useState(false);

  const [bookmarkState, setBookmarkState] = useState({
    isBookmarked: interactionMetrics.bookmarks?.includes(userId) || false,
    bookmarkCount: interactionMetrics.bookmarks?.length || 0
  });

  const hasIncrementedRef = useRef(false);
  const modalContentRef = useRef(null);

  const name = author?.name || 'Unknown';
  const email = author?.email || '';
  const isAuthor = userId && author?._id === userId;

  useEffect(() => {
    if (blog && interactionMetrics) {
      setBookmarkState({
        isBookmarked: interactionMetrics.bookmarks?.includes(userId) || false,
        bookmarkCount: interactionMetrics.bookmarks?.length || 0
      });
    }
  }, [blog, interactionMetrics, userId]);

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

  const handleScroll = (e) => {
    scrollPositions.current.push({
      position: e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight),
      timestamp: Date.now()
    });
  };

  const handleModalClose = async () => {
    const timeSpent = (Date.now() - startTime.current) / 1000;
    const maxScrollDepth = scrollPositions.current.length > 0
      ? Math.max(...scrollPositions.current.map(p => p.position))
      : getScrollDepth();

    try {
      if (blogId && userId) {
        await blogService.updateEngagement(blogId, {
          metrics: {
            timeSpent,
            scrollDepth: maxScrollDepth,
            completedReading: maxScrollDepth > 0.7 && timeSpent > 30
          },
          userId
        });
      }
    } catch (error) {
      console.error('Failed to record engagement:', error);
    }

    onClose();
  };

  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();

    if (!onToggleBookmark) {
      console.warn('onToggleBookmark function not provided');
      return;
    }

    const result = await onToggleBookmark(blogId);
    if (result?.success) {
      setBookmarkState({
        isBookmarked: result.isBookmarked,
        bookmarkCount: result.bookmarkCount,
      });
    }
  };

  useEffect(() => {
    let timer;

    if (isOpen && blogId && token && !hasIncrementedRef.current) {
      timer = setTimeout(async () => {
        try {
          const updatedBlogResponse = await blogService.incrementView(blogId);
          const newViews = updatedBlogResponse.views;
          setCurrentViews(newViews);
          hasIncrementedRef.current = true;

          if (onViewIncrement) {
            onViewIncrement(blogId, newViews);
          }
        } catch (error) {
          console.error('Failed to increment blog view:', error);
        }
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [isOpen, blogId, token, onViewIncrement]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleEdit = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleUpdateSuccess = (message) => {
    setIsEditModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-2 sm:p-4"
          onClick={handleModalClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1A1C20] rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Simplified Header */}
            <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-700">
              <div className="flex-1 pr-2 sm:pr-4">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 line-clamp-2">{title}</h2>

                {/* Details toggle button */}
                <motion.button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center text-xs sm:text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 mt-2"
                >
                  <Info size={14} className="mr-1" />
                  <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
                  {showDetails ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                </motion.button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Share button */}
                <ShareButton 
                  blog={blog} 
                  size="default" 
                  variant="ghost"
                  showPlatformOptions={true}
                />

                {/* Bookmark button (for non-authors) */}
                {!isAuthor && userId && onToggleBookmark && (
                  <motion.button
                    onClick={handleBookmarkToggle}
                    className={`p-2 rounded-full transition-all duration-200 ${bookmarkState.isBookmarked
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-700 hover:bg-yellow-600 text-gray-300 hover:text-white'
                      }`}
                    aria-label={bookmarkState.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark size={16} className="sm:w-5 sm:h-5" fill={bookmarkState.isBookmarked ? 'currentColor' : 'none'} />
                  </motion.button>
                )}

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ rotation: { duration: 0.4 } }}
                  onClick={handleModalClose}
                  className="p-2 rounded-full bg-gray-700 hover:bg-red-600 text-white transition-all duration-200"
                  aria-label="Close"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </motion.button>
              </div>
            </div>

            {/* Expandable Details Section */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-gray-700 bg-gray-800/30 px-4 sm:px-6 overflow-hidden"
                >
                  <div className="py-3 sm:py-4">
                    {/* Metadata badges */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white bg-${getGenreColor(genre)}`}>
                        {genre}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDifficultyColor(readingDifficulty)}`}>
                        {getDifficultyIcon(readingDifficulty)} {readingDifficulty}
                      </span>
                      {averageReadTime > 0 && (
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-blue-400 bg-blue-900/30 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatReadTime(averageReadTime)} read
                        </span>
                      )}
                      {engagementScore > 0 && (
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-purple-400 bg-purple-900/30 flex items-center">
                          <Target size={12} className="mr-1" />
                          {Math.round(engagementScore)} engagement
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300"
                          >
                            <Tag size={8} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 min-h-0">
              <SimpleBar
                ref={modalContentRef}
                scrollableNodeProps={{
                  onScroll: handleScroll,
                }}
                style={{
                  height: '100%',
                  maxHeight: showDetails ? 'calc(95vh - 300px)' : 'calc(95vh - 200px)',
                  overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}
                className="px-4 sm:px-6 py-4"
              >
                <div
                  className="text-gray-300 whitespace-pre-line text-sm sm:text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseEmojisEnhanced(content) }}
                />
              </SimpleBar>
            </div>

            {/* Simplified Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800/50 space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <NavLink
                  to={`/user/${author?._id || author?.id}`}
                  className="flex items-center hover:text-blue-400 transition-colors duration-200 text-gray-200"
                >
                  <UserIcon className="mr-2" size={16} />
                  <div>
                    <div className="font-medium text-sm sm:text-base">{name}</div>
                    <div className="flex items-center text-xs sm:text-sm text-blue-300">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(createdAt)}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <Eye size={12} className="mr-1" />
                      <span>{currentViews} Views</span>
                    </div>
                  </div>
                </NavLink>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
                {/* Stats */}
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-400">
                  {bookmarkState.bookmarkCount > 0 && (
                    <div className="flex items-center text-yellow-400">
                      <Bookmark size={14} className="mr-1" />
                      <span>{bookmarkState.bookmarkCount}</span>
                    </div>
                  )}
                </div>

                {/* Author actions */}
                {isAuthor && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm transition duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm transition duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditPostModal
          key={`edit-${blogId}`}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateSuccess={handleUpdateSuccess}
          blogId={blogId}
          title={title}
          content={content}
          genre={genre}
          tags={tags}
          readingDifficulty={readingDifficulty}
          token={token}
          userId={userId}
        />
      )}
    </AnimatePresence>
  );
};

export default PostModal;