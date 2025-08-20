import { useCallback, useMemo } from 'react';
import blogService from '../api/blogService';

export const useBookmark = (allBlogs = [], user = null, token = null, refreshBlogs = () => {}) => {

  const toggleBookmark = useCallback(async (blogId, options = {}) => {
    const { optimistic = true, onOptimisticUpdate, onError } = options;

    if (!user || !token) {
      console.warn('User must be logged in to bookmark');
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Find the blog
      const blog = allBlogs.find(b => b._id === blogId || b.id === blogId);
      if (!blog) {
        console.error('Blog not found');
        return { success: false, error: 'Blog not found' };
      }

      const isCurrentlyBookmarked = blog.interactionMetrics?.bookmarks?.includes(user.id);
      const newBookmarkState = !isCurrentlyBookmarked;

      if (optimistic && onOptimisticUpdate) {
        onOptimisticUpdate(blogId, user.id, newBookmarkState);
      }

      const response = await blogService.toggleBookmark(blogId);

      if (response.success !== false) {
        if (!optimistic) {
          await refreshBlogs();
        }

        return {
          success: true,
          isBookmarked: newBookmarkState,
          message: newBookmarkState ? 'Bookmark added' : 'Bookmark removed',
          bookmarkCount: newBookmarkState
            ? (blog.interactionMetrics?.bookmarks?.length || 0) + 1
            : Math.max((blog.interactionMetrics?.bookmarks?.length || 1) - 1, 0)
        };
      } else {
        throw new Error(response.message || 'Failed to toggle bookmark');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);

      // Revert optimistic update on error
      if (optimistic && onOptimisticUpdate && onError) {
        const blog = allBlogs.find(b => b._id === blogId || b.id === blogId);
        const currentState = blog?.interactionMetrics?.bookmarks?.includes(user.id) || false;
        onError(blogId, user.id, currentState);
      }

      return {
        success: false,
        error: error.message || 'Failed to toggle bookmark'
      };
    }
  }, [allBlogs, user, token, refreshBlogs]);

  // Get user's bookmarked blogs
  const getUserBookmarks = useCallback(() => {
    if (!user) return [];

    return allBlogs.filter(blog =>
      blog.interactionMetrics?.bookmarks?.includes(user.id)
    );
  }, [allBlogs, user]);

  // Check if a blog is bookmarked by current user
  const isBookmarked = useCallback((blogId) => {
    if (!user) return false;

    const blog = allBlogs.find(b => b._id === blogId || b.id === blogId);
    return blog?.interactionMetrics?.bookmarks?.includes(user.id) || false;
  }, [allBlogs, user]);

  // Get bookmark count for a blog
  const getBookmarkCount = useCallback((blogId) => {
    const blog = allBlogs.find(b => b._id === blogId || b.id === blogId);
    return blog?.interactionMetrics?.bookmarks?.length || 0;
  }, [allBlogs]);

  const bookmarkStats = useMemo(() => {
    if (!user) return { totalBookmarks: 0, userBookmarks: [] };

    const userBookmarks = getUserBookmarks();
    return {
      totalBookmarks: userBookmarks.length,
      userBookmarks,
      bookmarksByGenre: userBookmarks.reduce((acc, blog) => {
        const genre = blog.genre || 'Other';
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {}),
      recentBookmarks: userBookmarks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };
  }, [getUserBookmarks, user]);

  const bulkToggleBookmarks = useCallback(async (blogIds, action = 'toggle') => {
    if (!user || !token) {
      return { success: false, error: 'User not authenticated' };
    }

    const results = [];

    for (const blogId of blogIds) {
      try {
        const result = await toggleBookmark(blogId, { optimistic: false });
        results.push({ blogId, ...result });
      } catch (error) {
        results.push({ blogId, success: false, error: error.message });
      }
    }

    await refreshBlogs();

    return {
      success: results.every(r => r.success),
      results,
      totalProcessed: blogIds.length,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    };
  }, [toggleBookmark, user, token, refreshBlogs]);

  return {
    toggleBookmark,
    getUserBookmarks,
    isBookmarked,
    getBookmarkCount,
    bulkToggleBookmarks,
    userBookmarks: getUserBookmarks(),
    bookmarkStats,
    hasBookmarks: getUserBookmarks().length > 0,
    canBookmark: !!user && !!token
  };
};