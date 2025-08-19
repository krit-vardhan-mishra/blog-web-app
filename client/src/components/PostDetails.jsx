import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Eye, User, Bookmark } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';

const PostDetails = ({
  blog,
  userId,
  onOpenModal,
  onEdit,
  onDelete,
  onToggleBookmark,
}) => {
  const navigate = useNavigate();
  const touchTimeoutRef = useRef(null);
  const isTouchingRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  const {
    _id,
    title,
    content,
    author,
    views,
    interactionMetrics = { bookmarks: [] }
  } = blog;

  const isAuthor = author?._id === userId;

  // Mobile detection
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Touch handlers for mobile modal
  const handleTouchStart = (e) => {
    if (!isMobile || !onOpenModal) return;
    
    isTouchingRef.current = true;
    setIsLongPressing(true);
    touchTimeoutRef.current = setTimeout(() => {
      if (isTouchingRef.current) {
        e.preventDefault();
        onOpenModal(blog);
        setIsLongPressing(false);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    isTouchingRef.current = false;
    setIsLongPressing(false);
  };

  const handleClick = () => {
    // On mobile, only navigate if it wasn't a long press
    if (isMobile && touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      setIsLongPressing(false);
    }
    
    // Navigate to blog detail page
    const blogId = _id || blog.id;
    navigate(`/blog/${blogId}`);
  };

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
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isLongPressing ? 0.98 : 1,
        boxShadow: isLongPressing 
          ? '0 0 20px rgba(59, 130, 246, 0.5)' 
          : '0 8px 20px rgba(0, 0, 0, 0.25)'
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
      }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`flex flex-col h-full bg-gray-800/50 rounded-lg p-4 sm:p-6 shadow-md 
             border-t-[3px] sm:border-t-[4px] hover:border-t-[6px] sm:hover:border-t-[8px] border-blue-500
             hover:scale-[1.02] sm:hover:scale-105 hover:bg-[#282c34]
             transition-all duration-200 ease-in-out
             relative cursor-pointer group mx-2 sm:mx-0 ${isLongPressing ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />

      {/* Long press indicator for mobile */}
      {isMobile && isLongPressing && (
        <div className="absolute top-2 right-2 z-20">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            📱 Hold to preview
          </div>
        </div>
      )}

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

      {/* Content preview - with overflow handling */}
      <div className="flex-1 mb-3 sm:mb-4">
        <div className="relative">
          <p className="text-gray-300 text-sm line-clamp-3 sm:line-clamp-4 group-hover:text-gray-200 transition-colors duration-200 leading-relaxed">
            {content}
          </p>
          {/* Gradient overlay for overflow indication */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none opacity-70"></div>
        </div>
      </div>

      {/* Footer - simplified */}
      <div className="mt-auto flex items-center justify-between text-gray-400 text-xs">
        <div className="flex items-center group-hover:scale-105 transition-transform duration-200">
          <NavLink
            to={`/user/${author?._id || author?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center hover:text-blue-400 transition-colors duration-200"
          >
            <User size={12} className="mr-1 text-blue-400 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">{author ? author.name : 'Unknown'}</span>
          </NavLink>
        </div>

        <div className="flex items-center space-x-3">
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