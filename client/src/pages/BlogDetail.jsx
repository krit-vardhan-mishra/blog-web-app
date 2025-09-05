import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import blogService from '../api/blogService';

import { Eye, Calendar, User as UserIcon, Edit, Trash2, Bookmark, Tag, Target, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
import getGenreColor from '@/utils/genreColors';
import ShareButton from '../components/ShareButton';
import SharePreview from '@/components/SharePreview';

const BlogDetail = () => {
    const { user, token } = useAuth();
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
    const [isMobile, setIsMobile] = useState(false);
    const [showMoreMetadata, setShowMoreMetadata] = useState(false);
    const startTime = useRef(Date.now());
    const scrollPositions = useRef([]);
    const hasIncrementedRef = useRef(false);
    const contentRef = useRef(null);
    const longPressTimer = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });

    const userId = user?.id;
    const isAuthor = userId && blog?.author?._id === userId;

    // Check if device is mobile
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

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

    // Long press functionality for mobile
    const handleTouchStart = (e, action) => {
        if (!isMobile) return;

        e.preventDefault();

        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };

        longPressTimer.current = setTimeout(() => {
            action();
        }, 3000); // 3 seconds
    };

    const handleTouchEnd = (e) => {
        if (!isMobile) return;

        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    const handleTouchMove = (e) => {
        if (!isMobile || !longPressTimer.current) return;

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

        // Cancel long press if user moves finger too much
        if (deltaX > 10 || deltaY > 10) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
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

            setIsBookmarked((prev) => !prev);

            setBlog((prevBlog) => {
                if (!prevBlog) return prevBlog;
                const updatedBookmarks = isBookmarked
                    ? prevBlog.interactionMetrics.bookmarks.filter(id => id !== userId)
                    : [...(prevBlog.interactionMetrics.bookmarks || []), userId];

                return {
                    ...prevBlog,
                    interactionMetrics: {
                        ...prevBlog.interactionMetrics,
                        bookmarks: updatedBookmarks,
                    },
                };
            });

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

    useEffect(() => {
        const recordEngagement = async () => {
            const timeSpent = (Date.now() - startTime.current) / 1000;
            const maxScrollDepth = scrollPositions.current.length > 0
                ? Math.max(...scrollPositions.current.map(p => p.position))
                : getScrollDepth() / 100;

            try {
                if (blogId && timeSpent > 5) {
                    await blogService.updateEngagement(blogId, {
                        metrics: {
                            timeSpent,
                            scrollDepth: maxScrollDepth,
                            completedReading: maxScrollDepth > 0.7 && timeSpent > 30
                        },
                        userId: userId || null,
                        isAnonymous: !userId
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

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const result = await blogService.fetchById(blogId);
                setBlog(result);
                setCurrentViews(result.views || 0);

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

    useEffect(() => {
        let timer;

        if (blog && blogId && !hasIncrementedRef.current) {
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
    }, [blog, blogId]);

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

    // Framer Motion variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-screen bg-[#0f0f23] text-white flex items-center justify-center"
            >
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2 text-red-500">
                        Blog Not Found
                    </h2>
                    <p className="text-gray-400">
                        We couldn't find the blog post you're looking for.
                    </p>
                </div>
            </motion.div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-[#0f0f23] text-white">
                {/* Loading skeleton with pulsing animation */}
                <div className="max-w-4xl mx-auto p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gray-800/50 rounded-lg p-4 sm:p-6 h-96 animate-pulse"
                    >
                    </motion.div>
                </div>
            </div>
        );
    }

    const {
        title,
        content,
        author,
        createdAt,
        updatedAt,
        genre = 'All',
        tags = [],
        readingDifficulty = 'intermediate',
        averageReadTime = 0,
        interactionMetrics = { bookmarks: [] },
        engagementScore = 0
    } = blog;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-[#0f0f23] text-white"
        >
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                        className={`bg-gray-800/50 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-gray-700 mb-6 transition-all duration-300 relative ${!isMobile ? 'hover:shadow-lg hover:border-blue-900' : ''
                            }`}
                    >
                        {/* Header with title and action buttons - Responsive Layout */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            {/* Title section */}
                        <div className="flex-grow min-w-0">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={`text-2xl sm:text-3xl font-bold text-white transition-colors duration-300 break-words ${!isMobile ? 'hover:text-orange-300' : ''
                                    }`}
                            >
                                {title}
                            </motion.h1>
                        </div>

                        {/* Action buttons section */}
                        <div className="flex items-center justify-end gap-2 flex-shrink-0">
                            {/* Share button */}
                            <motion.div
                                whileHover={!isMobile ? { scale: 1.1 } : {}}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ShareButton
                                    blog={blog}
                                    size="fixed"
                                    variant="ghost"
                                />
                            </motion.div>

                            {userId && (
                                <motion.button
                                    whileHover={!isMobile ? { scale: 1.1 } : {}}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleBookmarkToggle}
                                    className={`flex items-center justify-center p-2 rounded-full transition-all duration-200 h-10 w-10 flex-shrink-0 ${isBookmarked
                                        ? 'bg-yellow-600 text-white' + (!isMobile ? ' hover:bg-yellow-700' : '')
                                        : 'bg-gray-700 text-gray-300' + (!isMobile ? ' hover:bg-yellow-600 hover:text-white' : '')
                                        }`}
                                    aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                >
                                    <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                                </motion.button>
                            )}

                            {/* Author Action Buttons */}
                            {isAuthor && (
                                <>
                                    <motion.div
                                        whileHover={!isMobile ? { scale: 1.1 } : {}}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            onClick={isMobile ? undefined : handleEdit}
                                            onTouchStart={isMobile ? (e) => handleTouchStart(e, handleEdit) : undefined}
                                            onTouchEnd={isMobile ? handleTouchEnd : undefined}
                                            onTouchMove={isMobile ? handleTouchMove : undefined}
                                            disabled={isDeleting}
                                            className={`flex items-center justify-center p-2 rounded-full bg-blue-600 text-white transition-all duration-200 h-10 w-10 flex-shrink-0 ${!isMobile ? 'hover:bg-blue-700' : ''
                                                }`}
                                            aria-label={isMobile ? "Hold for 3s to Edit Post" : "Edit Post"}
                                            title={isMobile ? "Hold for 3 seconds to edit" : "Edit Post"}
                                        >
                                            <Edit size={18} />
                                        </Button>
                                    </motion.div>

                                    <motion.div
                                        whileHover={!isMobile ? { scale: 1.1 } : {}}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            onClick={isMobile ? undefined : handleDelete}
                                            onTouchStart={isMobile ? (e) => handleTouchStart(e, handleDelete) : undefined}
                                            onTouchEnd={isMobile ? handleTouchEnd : undefined}
                                            onTouchMove={isMobile ? handleTouchMove : undefined}
                                            disabled={isDeleting}
                                            className={`flex items-center justify-center p-2 rounded-full bg-red-600 text-white transition-all duration-200 h-10 w-10 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${!isMobile ? 'hover:bg-red-700' : ''
                                                }`}
                                            aria-label={isMobile ? "Hold for 3s to Delete Post" : "Delete Post"}
                                            title={isMobile ? "Hold for 3 seconds to delete" : "Delete Post"}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Basic metadata - Genre and Show More button */}
                    <div className="flex items-center justify-between mb-3">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex items-center gap-2"
                        >
                            <motion.span
                                variants={itemVariants}
                                className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-${getGenreColor(genre)}`}
                            >
                                {genre}
                            </motion.span>
                        </motion.div>

                        <motion.button
                            whileHover={!isMobile ? { scale: 1.05 } : {}}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowMoreMetadata(!showMoreMetadata)}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200"
                        >
                            {showMoreMetadata ? 'Show less' : 'Click to show more'}
                            {showMoreMetadata ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </motion.button>
                    </div>

                    {/* Expanded metadata - shown conditionally */}
                    {showMoreMetadata && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Enhanced metadata badges */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap items-center gap-2 mb-3"
                            >
                                <motion.span variants={itemVariants} className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(readingDifficulty)}`}>
                                    {getDifficultyIcon(readingDifficulty)} {readingDifficulty}
                                </motion.span>
                                {averageReadTime > 0 && (
                                    <motion.span variants={itemVariants} className="px-3 py-1 rounded-full text-sm font-medium text-blue-400 bg-blue-900/30 flex items-center">
                                        <Clock size={14} className="mr-1" />
                                        {formatReadTime(averageReadTime)} read
                                    </motion.span>
                                )}
                                {engagementScore > 0 && (
                                    <motion.span variants={itemVariants} className="px-3 py-1 rounded-full text-sm font-medium text-purple-400 bg-purple-900/30 flex items-center">
                                        <Target size={14} className="mr-1" />
                                        {Math.round(engagementScore)} engagement
                                    </motion.span>
                                )}
                            </motion.div>

                            {/* Tags */}
                            {tags.length > 0 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex flex-wrap gap-1 mb-3"
                                >
                                    {tags.map((tag, index) => (
                                        <motion.span
                                            key={index}
                                            variants={itemVariants}
                                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300"
                                        >
                                            <Tag size={10} className="mr-1" />
                                            {tag}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            )}

                            {/* Additional metadata */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap text-sm mb-4 gap-x-4 gap-y-2"
                            >
                                <motion.span
                                    variants={itemVariants}
                                    className={`flex items-center space-x-1 text-indigo-100 transition-colors duration-200 ${!isMobile ? 'hover:text-indigo-300' : ''
                                        }`}
                                >
                                    <Calendar size={16} />
                                    <span>{formatDate(createdAt)}</span>
                                </motion.span>

                                <motion.span
                                    variants={itemVariants}
                                    className={`flex items-center space-x-1 text-teal-100 transition-colors duration-200 ${!isMobile ? 'hover:text-teal-300' : ''
                                        }`}
                                >
                                    <Eye size={16} />
                                    <span>{currentViews} views</span>
                                </motion.span>

                                {author?.name && (
                                    <motion.span
                                        variants={itemVariants}
                                        className={`flex items-center space-x-1 cursor-pointer text-blue-100 transition-colors duration-200 ${!isMobile ? 'hover:text-blue-300' : ''
                                            }`}
                                        onClick={() => navigate(`/user/${author._id || author.id}`)}
                                    >
                                        <UserIcon size={16} />
                                        <span>{author.name || 'Deleted User'}</span>
                                    </motion.span>
                                )}

                                {/* Bookmark count */}
                                {interactionMetrics.bookmarks?.length > 0 && (
                                    <motion.span variants={itemVariants} className="flex items-center space-x-1 text-yellow-400">
                                        <Bookmark size={16} />
                                        <span>{interactionMetrics.bookmarks.length} bookmarks</span>
                                    </motion.span>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Content Section */}
                    <SimpleBar
                        ref={contentRef}
                        className='border-t-white/10 h-[60vh] sm:h-[70vh] border-t-2 border-b-white/10 border-b-2'
                        style={{ maxHeight: isMobile ? '60vh' : '70vh' }}
                        scrollableNodeProps={{
                            onScroll: handleScroll,
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-gray-300 whitespace-pre-line text-sm sm:text-base leading-relaxed p-4"
                        >
                            {content ? content.split(/(\s+)/).map((part, index) => {
                                if (/^\s+$/.test(part)) {
                                    return part;
                                }
                                return (
                                    <span
                                        key={index}
                                        className={`inline-block transition-all duration-200 ease-out cursor-pointer ${!isMobile
                                            ? 'hover:scale-110 hover:text-white hover:font-medium hover:bg-gray-700/30 hover:px-1 hover:rounded hover:shadow-lg'
                                            : ''
                                            }`}
                                    >
                                        <div
                                            className="text-gray-300 whitespace-pre-line"
                                            dangerouslySetInnerHTML={{ __html: parseEmojisEnhanced(part) }}
                                        />
                                    </span>
                                );
                            }) : 'Content not available.'}
                        </motion.div>
                    </SimpleBar>
                </motion.div>
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
        </motion.div>
    );
};

export default BlogDetail;