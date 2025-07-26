import { useCallback } from 'react';
import blogService from '../api/blogService';
import { useBlogContext } from '@/context/BlogContext';

export const useBookmark = () => {
  const { allBlogs, user, token, refreshBlogs } = useBlogContext();

  // Toggle bookmark for a blog
  const toggleBookmark = useCallback(async (blogId) => {
    if (!user || !token) {
      console.warn('User must be logged in to bookmark');
      return;
    }

    try {
      // Find the blog
      const blog = allBlogs.find(b => b._id === blogId || b.id === blogId);
      if (!blog) {
        console.error('Blog not found');
        return;
      }

      const isBookmarked = blog.interactionMetrics?.bookmarks?.includes(user.id);

      // Call your API to toggle bookmark
      const response = await blogService.toggleBookmark(blogId, {
        userId: user.id,
        action: isBookmarked ? 'remove' : 'add'
      });

      if (response.success) {
        // Refresh blogs to get updated bookmark status
        await refreshBlogs();
        
        return {
          success: true,
          isBookmarked: !isBookmarked,
          message: isBookmarked ? 'Bookmark removed' : 'Bookmark added'
        };
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      return {
        success: false,
        error: error.message
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

  const getBookmarkCount = useCallback((blogId) => {
    const blog = allBlogs.find(b => b._id === blogId || b.id === blogId);
    return blog?.interactionMetrics?.bookmarks?.length || 0;
  }, [allBlogs]);

  return {
    toggleBookmark,
    getUserBookmarks,
    isBookmarked,
    getBookmarkCount,
    userBookmarks: getUserBookmarks()
  };
};