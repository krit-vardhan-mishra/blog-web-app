import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../api/blogService';
import Header from '../components/Header';
import { Eye, ArrowLeft, Calendar, User as UserIcon, Edit, Trash2, Bookmark, Share2, Tag, Target, Clock } from 'lucide-react';
import { formatDate } from '../utils/utilityFunctions';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { parseEmojisEnhanced } from '../utils/emojiParser';
import { getScrollDepth } from '../utils/scrollUtils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import EditPostModal from '../components/ui/modals/EditPostModal';
import NotifyBanner from '../components/ui/NotifyBanner';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import { motion } from 'framer-motion';
import Lenis from '@studio-freight/lenis';

const BlogDetail = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentViews, setCurrentViews] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Engagement tracking
  const startTime = useRef(Date.now());
  const scrollPositions = useRef([]);
  const hasIncrementedRef = useRef(false);
  const contentRef = useRef(null);
  const lenisRef = useRef(null);

  const userId = user?.id;
  const isAuthor = userId && blog?.author?._id === userId;

  // Utility functions from PostModal
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

  // Scroll tracking
  const handleScroll = (e) => {
    scrollPositions.current.push({
      position: e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight),
      timestamp: Date.now()
    });
  };

  // Bookmark functionality
  const handleBookmarkToggle = async () => {
    if (!userId) return;

    try {
      await blogService.toggleBookmark(blogId);
      setIsBookmarked(!isBookmarked);
      setNotification({
        message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      setNotification({
        message: 'Failed to update bookmark',
        type: 'error',
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: blog?.title,
      text: `Check out this blog post: ${blog?.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setNotification({
          message: 'URL copied to clipboard',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Record engagement on page unload
  useEffect(() => {
    const recordEngagement = async () => {
      const timeSpent = (Date.now() - startTime.current) / 1000;
      const maxScrollDepth = scrollPositions.current.length > 0
        ? Math.max(...scrollPositions.current.map(p => p.position))
        : getScrollDepth() / 100;

      try {
        if (blogId && userId && timeSpent > 5) { // Only record if spent more than 5 seconds
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
    };

    const handleBeforeUnload = () => {
      recordEngagement();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      recordEngagement();
    };
  }, [blogId, userId]);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    let lenisInstance;
    if (contentRef.current) {
      const scrollableElement = contentRef.current.getScrollElement();

      if (scrollableElement) {
        lenisInstance = new Lenis({
          wrapper: scrollableElement,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        lenisRef.current = lenisInstance;

        const raf = (time) => {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
      }
    }

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisRef.current = null;
      }
    };
  }, [blog]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const result = await blogService.fetchById(blogId);
        setBlog(result);
        setCurrentViews(result.views || 0);
        
        // Set bookmark status
        if (userId && result.interactionMetrics?.bookmarks) {
          setIsBookmarked(result.interactionMetrics.bookmarks.includes(userId));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load blog post');
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId, userId]);

  useEffect(() => {
    if (blog?.title) {
      document.title = `${blog.title}`;
    }
  }, [blog]);

  // View increment with enhanced logic from PostModal
  useEffect(() => {
    let timer;

    if (blog && blogId && token && !hasIncrementedRef.current) {
      timer = setTimeout(async () => {
        try {
          const updatedBlogResponse = await blogService.incrementView(blogId);
          const newViews = updatedBlogResponse.views;
          setCurrentViews(newViews);
          hasIncrementedRef.current = true;
        } catch (err) {
          console.error('Failed to increment blog view:', err);
        }
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [blog, blogId, token]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateSuccess = (message) => {
    setNotification({
      message: message || 'Blog updated successfully!',
      type: 'success',
    });
    setIsEditModalOpen(false);
    
    // Refresh the blog data
    const fetchUpdatedBlog = async () => {
      try {
        const result = await blogService.fetchById(blogId);
        setBlog(result);
        setCurrentViews(result.views || 0);
      } catch (err) {
        console.error('Failed to refresh blog data:', err);
      }
    };
    
    fetchUpdatedBlog();
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsConfirmDeleteOpen(false);
    
    try {
      await blogService.delete(blogId);
      setNotification({
        message: 'Blog moved to trash successfully!',
        type: 'success',
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error('Failed to delete blog:', err);
      setNotification({
        message: 'Failed to delete blog. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white">
        <Header title="Blog" icons={[{ icon: ArrowLeft, link: -1 }]} />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2 text-red-500">
              Blog Not Found
            </h2>
            <p className="text-gray-400">
              We couldn't find the blog post you're looking for.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white">
        <Header
          title="Blog"
          isLoading={true}
          icons={[{ icon: ArrowLeft, link: -1 }]} />
        <div className="max-w-4xl mx-auto p-6 animate-pulse">
          <div className="bg-gray-800/50 rounded-lg p-6 h-96"></div>
        </div>
      </div>
    );
  }

  const { 
    title, 
    content, 
    author, 
    createdAt, 
    genre = 'All',
    tags = [],
    readingDifficulty = 'intermediate',
    averageReadTime = 0,
    interactionMetrics = { bookmarks: [] },
    engagementScore = 0
  } = blog;

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      <Header title="Blog" icons={[{ icon: ArrowLeft, link: -1 }]}
        customElements={[
          !isAuthenticated && (
            <div className="flex gap-3" key="auth-buttons">
              <Button
                type="login"
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                type="signup"
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/signup')}
              >
                Signup
              </Button>
            </div>
          ),
        ]} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 mb-6 transition-all duration-300 hover:shadow-lg hover:border-blue-900 relative">
          
          {/* Action buttons row */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {/* Share button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 text-white transition-all duration-200"
              aria-label="Share"
            >
              <Share2 size={18} />
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
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </motion.button>
            )}

            {/* Author Action Buttons */}
            {isAuthor && (
              <>
                <Button
                  onClick={handleEdit}
                  disabled={isDeleting}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white transition-all duration-200 flex items-center justify-center"
                  aria-label="Edit Post"
                >
                  <Edit size={18} />
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 hover:scale-110 text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Delete Post"
                >
                  <Trash2 size={18} />
                </Button>
              </>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-3 text-white hover:text-orange-300 transition-colors duration-300 pr-32">
            {title}
          </h1>
          
          {/* Enhanced metadata badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
            <div className="flex flex-wrap gap-1 mb-3">
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
          
          <div className="flex flex-wrap text-sm mb-4 space-x-4">
            <span className="flex items-center space-x-1 hover:text-indigo-300 text-indigo-100 transition-colors duration-200">
              <Calendar size={16} />
              <span>{formatDate(createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1 hover:text-teal-300 text-teal-100 transition-colors duration-200">
              <Eye size={16} />
              <span>{currentViews} views</span>
            </span>
            {author?.name && (
              <span
                className="flex items-center space-x-1 cursor-pointer hover:text-blue-300 text-blue-100 transition-colors duration-200"
                onClick={() => navigate(`/user/${author._id || author.id}`)}
              >
                <UserIcon size={16} />
                <span>{author.name}</span>
              </span>
            )}

            {/* Bookmark count */}
            {interactionMetrics.bookmarks?.length > 0 && (
              <span className="flex items-center space-x-1 text-yellow-400">
                <Bookmark size={16} />
                <span>{interactionMetrics.bookmarks.length} bookmarks</span>
              </span>
            )}
          </div>
          
          <SimpleBar 
            ref={contentRef}
            className='border-t-white/10 h-[70vh] border-t-2 border-b-white/10 border-b-2' 
            style={{ maxHeight: '70vh' }}
            scrollableNodeProps={{
              onScroll: handleScroll,
            }}
          >
            <div className="text-gray-300 whitespace-pre-line text-base leading-relaxed p-4">
              {content.split(/(\s+)/).map((part, index) => {
                if (/^\s+$/.test(part)) {
                  return part;
                }
                return (
                  <span
                    key={index}
                    className="inline-block transition-all duration-200 ease-out hover:scale-110 hover:text-white hover:font-medium hover:bg-gray-700/30 hover:px-1 hover:rounded cursor-pointer hover:shadow-lg"
                  >
                    <div
                      className="text-gray-300 whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: parseEmojisEnhanced(part) }}
                    />
                  </span>
                );
              })}
            </div>
          </SimpleBar>
        </div>
      </div>

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

      {/* Confirm Delete Modal */}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal
          isOpen={isConfirmDeleteOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          title="Delete Blog Post"
          message="Are you sure you want to delete this blog post? This action cannot be undone."
        />
      )}

      {/* Notification */}
      {notification && (
        <NotifyBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default BlogDetail;