import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, UserIcon, Tag, Target, Bookmark, Clock, Calendar, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import EditPostModal from './EditPostModal';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import blogService from '../../../api/blogService';
import { NavLink } from 'react-router';
import { formatDate } from '../../../utils/utilityFunctions';
import { parseEmojisEnhanced } from '../../../utils/emojiParser';
import { getScrollDepth } from '../../../utils/scrollUtils';

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
  const [isBookmarked, setIsBookmarked] = useState(
    interactionMetrics.bookmarks?.includes(userId) || false
  );
  const hasIncrementedRef = useRef(false);
  const modalContentRef = useRef(null);

  const name = author?.name || 'Unknown';
  const email = author?.email || '';
  const isAuthor = userId && author?._id === userId;

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

  const getGenreColor = (genre) => {
    const colors = {
      'All': 'bg-gray-600',
      'Lifestyle': 'bg-pink-600',
      'Business': 'bg-blue-600',
      'Entertainment': 'bg-purple-600',
      'Science': 'bg-green-600',
      'Art': 'bg-indigo-600',
      'Sports': 'bg-orange-600',
      'Technology': 'bg-cyan-600',
      'Health': 'bg-red-600',
      'Travel': 'bg-teal-600',
      'Food': 'bg-yellow-600',
      'Education': 'bg-emerald-600'
    };
    return colors[genre] || 'bg-gray-600';
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

  const handleBookmarkToggle = async () => {
    if (!userId || !onToggleBookmark) return;

    try {
      await blogService.toggleBookmark(blogId);
      setIsBookmarked(!isBookmarked);
      if (onToggleBookmark) {
        onToggleBookmark(blogId);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Check out this blog post: ${title}`,
      url: `${window.location.origin}/blog/${blogId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        console.log('URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
      startTime.current = Date.now();
      scrollPositions.current = [];
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleEdit = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleUpdateSuccess = (message) => {
    console.log(message);
    setIsEditModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={handleModalClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1A1C20] rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-6 border-b border-gray-700">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

                {/* Metadata badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getGenreColor(genre)}`}>
                    {genre}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(readingDifficulty)}`}>
                    {getDifficultyIcon(readingDifficulty)} {readingDifficulty}
                  </span>
                  {averageReadTime > 0 && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-400 bg-blue-900/30 flex items-center">
                      <Clock size={14} className="mr-1" />
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
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300"
                      >
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center text-sm text-blue-300 mt-2">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {/* Share button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 text-white transition-all duration-200"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </motion.button>

                {/* Bookmark button (for non-authors) */}
                {!isAuthor && userId && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmarkToggle}
                    className={`p-2 rounded-full transition-all duration-200 ${isBookmarked
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-700 hover:bg-yellow-600 text-gray-300 hover:text-white'
                      }`}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
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
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
              <SimpleBar
                scrollableNodeProps={{ ref: modalContentRef }}
                style={{
                  height: '100%',
                  maxHeight: 'calc(90vh - 200px)',
                  overflowY: 'auto',
                }}
                className="px-6 py-4"
                onScroll={handleScroll}
              >
                <div
                  className="text-gray-300 whitespace-pre-line text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseEmojisEnhanced(content) }}
                />
              </SimpleBar>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-between items-center bg-gray-800/50">
              <div className="flex flex-col">
                <NavLink
                  to={`/user/${author?._id || author?.id}`}
                  className="flex items-center mb-2 hover:text-blue-400 transition-colors duration-200 text-gray-200"
                >
                  <UserIcon className="mr-2" size={18} />
                  <div>
                    <div className="font-medium">Author: {name}</div>
                    {email && (
                      <div className="text-sm text-gray-500">{email}</div>
                    )}
                  </div>
                </NavLink>
              </div>

              <div className="flex items-center space-x-4">
                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  {interactionMetrics.bookmarks?.length > 0 && (
                    <div className="flex items-center text-yellow-400">
                      <Bookmark size={16} className="mr-1" />
                      <span>{interactionMetrics.bookmarks.length}</span>
                    </div>
                  )}

                  <div className="flex items-center text-blue-400">
                    <Eye size={16} className="mr-1" />
                    <span>{currentViews} Views</span>
                  </div>
                </div>

                {/* Author actions */}
                {isAuthor && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition duration-200"
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