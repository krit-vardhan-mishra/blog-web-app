import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import blogService from '../api/blogService';
import userService from '../api/userService';
import { getCurrentDateTime } from '../utils/utilityFunctions.js';
import { calculateGenreMatchScore } from '@/utils/blogUtils.js';

export const useHomePage = () => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    selectedStat: null,
    isStatModalOpen: false,
    isAllStatsOpen: false,
    showWelcomeBanner: false,
    showNotificationBanner: false,
    notificationMessage: '',
    greeting: '',
    displayedUserName: 'Guest',
    isCreatePostOpen: false,
    isEditPostOpen: false,
    currentTime: getCurrentDateTime(),
    blogToEdit: null,
    isLoading: true,
    isBlogListRefreshing: false,
    allBlogs: [],
    isConfirmOpen: false,
    selectedBlogId: null,
    lastUpdated: null,
    isPostModalOpen: false,
    selectedBlogForModal: null,
    isSearchActive: false,
    searchQuery: '',
    searchResults: [],
    allUsers: [],
    searchLoading: false,
    latestBlogs: [],
  });

  const searchInputRef = useRef(null);

  const userBlogs = useMemo(() =>
    state.allBlogs.filter((blog) => blog.author?._id === user?.id),
    [state.allBlogs, user?.id]
  );

  const stats = useMemo(() => {
    const userBlogsCount = userBlogs.length;
    const totalViews = userBlogs.reduce((sum, blog) => sum + (Number(blog.views) || 0), 0);

    const blogUpdateTimes = userBlogs.map(blog => new Date(blog.updatedAt || blog.createdAt));
    const mostRecentBlogUpdate = blogUpdateTimes.length > 0 ? new Date(Math.max(...blogUpdateTimes)) : null;
    const accountCreated = user?.createdAt ? new Date(user.createdAt) : null;
    const lastLogin = user?.lastLogin ? new Date(user.lastLogin) : null;
    
    const allDates = [mostRecentBlogUpdate, accountCreated, lastLogin].filter(Boolean);
    const lastUpdate = allDates.length > 0 ? new Date(Math.max(...allDates)) : null;
    
    const lastUpdateText = lastUpdate ? lastUpdate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'Never';

    return [
      { title: 'Your Blogs', count: userBlogsCount, subtitle: 'Published posts' },
      { title: 'Total Views', count: totalViews, subtitle: 'Across all your posts' },
      {
        title: 'Last Updated',
        count: lastUpdateText,
        subtitle: 'Recent activity',
      },
    ];
  }, [userBlogs, user]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const calculateBlogScore = useCallback((blog, user) => {
    const now = new Date();
    const blogAge = (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);

    const weights = {
      recency: 0.3,
      views: 0.2,
      avgReadTime: 0.2,
      genreMatch: 0.15,
      engagementScore: 0.15
    };

    const recencyScore = Math.exp(-blogAge / 30);
    const viewsScore = Math.min(blog.views / 100, 1);
    const readTimeScore = Math.min(blog.averageReadTime / 300, 1);
    const genreMatchScore = calculateGenreMatchScore(blog, user);

    return (
      recencyScore * weights.recency +
      viewsScore * weights.views +
      readTimeScore * weights.avgReadTime +
      genreMatchScore * weights.genreMatch +
      (blog.engagementScore || 0) * weights.engagementScore
    );
  }, []);

  const getRecommendedBlogs = useCallback((allBlogs, user) => {
    return allBlogs
      .filter(blog => !blog.isDeleted)
      .map(blog => {
        const score = calculateBlogScore(blog, user);
        return { ...blog, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [calculateBlogScore]);

  const fetchAllBlogsData = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      updateState({ isLoading: true });
    } else {
      updateState({ isBlogListRefreshing: true });
    }

    try {
      const response = await blogService.fetchForHomePage();
      const latestBlogs = response.blogs || [];

      const allBlogsResponse = await blogService.fetchAll({}, { page: 1, limit: 50 });
      const allBlogsData = allBlogsResponse.blogs || [];

      updateState({
        allBlogs: allBlogsData,
        latestBlogs: latestBlogs,
        isLoading: false,
        isBlogListRefreshing: false,
      });

    } catch (error) {
      console.error('Failed to fetch blogs', error);
      updateState({
        allBlogs: [],
        latestBlogs: [],
        isLoading: false,
        isBlogListRefreshing: false
      });
    }
  }, [updateState]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await userService.fetchAll();
      updateState({ allUsers: response.users || [] });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      updateState({ allUsers: [] });
    }
  }, [updateState]);

  const updateLastUpdatedTime = useCallback(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const lastUpdatedString = `${timeString}\n${dateString}`;
    updateState({ lastUpdated: lastUpdatedString });
    if (user?.id) {
      localStorage.setItem(`lastUpdated_${user.id}`, lastUpdatedString);
    }
  }, [user?.id, updateState]);

  const updateBlogBookmarks = useCallback((blogId, userId, action) => {
    updateState(prev => ({
      allBlogs: prev.allBlogs.map(blog => {
        if (blog._id === blogId || blog.id === blogId) {
          const currentBookmarks = blog.interactionMetrics?.bookmarks || [];
          const isCurrentlyBookmarked = currentBookmarks.includes(userId);

          let newBookmarks;
          if (action === 'toggle') {
            newBookmarks = isCurrentlyBookmarked
              ? currentBookmarks.filter(id => id !== userId)
              : [...currentBookmarks, userId];
          } else if (action === 'add' && !isCurrentlyBookmarked) {
            newBookmarks = [...currentBookmarks, userId];
          } else if (action === 'remove' && isCurrentlyBookmarked) {
            newBookmarks = currentBookmarks.filter(id => id !== userId);
          } else {
            newBookmarks = currentBookmarks;
          }

          return {
            ...blog,
            interactionMetrics: {
              ...blog.interactionMetrics,
              bookmarks: newBookmarks
            }
          };
        }
        return blog;
      }),
      latestBlogs: prev.latestBlogs.map(blog => {
        if (blog._id === blogId || blog.id === blogId) {
          const currentBookmarks = blog.interactionMetrics?.bookmarks || [];
          const isCurrentlyBookmarked = currentBookmarks.includes(userId);

          let newBookmarks;
          if (action === 'toggle') {
            newBookmarks = isCurrentlyBookmarked
              ? currentBookmarks.filter(id => id !== userId)
              : [...currentBookmarks, userId];
          } else if (action === 'add' && !isCurrentlyBookmarked) {
            newBookmarks = [...currentBookmarks, userId];
          } else if (action === 'remove' && isCurrentlyBookmarked) {
            newBookmarks = currentBookmarks.filter(id => id !== userId);
          } else {
            newBookmarks = currentBookmarks;
          }

          return {
            ...blog,
            interactionMetrics: {
              ...blog.interactionMetrics,
              bookmarks: newBookmarks
            }
          };
        }
        return blog;
      })
    }));
  }, [updateState]);

  // Event handlers
  const handlers = {
    handleStatClick: useCallback((stat) => {
      updateState({ isAllStatsOpen: false });
      setTimeout(() => {
        updateState({ selectedStat: stat, isStatModalOpen: true });
      }, 300);
    }, [updateState]),

    handleEditPost: useCallback((blog) => {
      updateState({ blogToEdit: blog, isEditPostOpen: true });
    }, [updateState]),

    handleDeleteClick: useCallback((blogId) => {
      updateState({ selectedBlogId: blogId, isConfirmOpen: true });
    }, [updateState]),

    handlePostCreationSuccess: useCallback((message) => {
      updateState({
        notificationMessage: message,
        showNotificationBanner: true,
        isCreatePostOpen: false
      });
      updateLastUpdatedTime();
      fetchAllBlogsData(true);
    }, [updateState, updateLastUpdatedTime, fetchAllBlogsData]),

    handlePostUpdateSuccess: useCallback((message) => {
      updateState({
        notificationMessage: message,
        showNotificationBanner: true,
        isEditPostOpen: false
      });
      updateLastUpdatedTime();
      fetchAllBlogsData(true);
    }, [updateState, updateLastUpdatedTime, fetchAllBlogsData]),

    handlePostDeleteSuccess: useCallback(async (blogId) => {
      try {
        await blogService.delete(blogId);
        updateState(prev => ({
          allBlogs: prev.allBlogs.filter((b) => b._id !== blogId),
          notificationMessage: 'Post moved to trash successfully!',
          showNotificationBanner: true
        }));
        updateLastUpdatedTime();
      } catch (error) {
        console.error('Failed to move blog to trash:', error);
        updateState({
          notificationMessage: 'Failed to move the post to trash.',
          showNotificationBanner: true
        });
      }
    }, [updateState, updateLastUpdatedTime]),

    handleOpenPostModal: useCallback((blogData) => {
      updateState({ selectedBlogForModal: blogData, isPostModalOpen: true });
    }, [updateState]),

    handleClosePostModal: useCallback(() => {
      updateState({ isPostModalOpen: false, selectedBlogForModal: null });
    }, [updateState]),

    handleViewIncrement: useCallback((blogId, newViews) => {
      updateState(prev => ({
        allBlogs: prev.allBlogs.map((blog) =>
          blog._id === blogId || blog.id === blogId
            ? { ...blog, views: newViews }
            : blog
        ),
        latestBlogs: prev.latestBlogs.map((blog) =>
          blog._id === blogId || blog.id === blogId
            ? { ...blog, views: newViews }
            : blog
        )
      }));
    }, [updateState]),

    handleToggleBookmark: useCallback(async (blogId) => {
      if (!user?.id) {
        console.warn('🚫 useHomePage: User must be logged in to bookmark');
        return { success: false };
      }

      try {
        const response = await blogService.toggleBookmark(blogId);

        const updatedBlog = response.blog;
        const bookmarks = updatedBlog?.interactionMetrics?.bookmarks || [];

        updateState(prev => ({
          ...prev,
          allBlogs: prev.allBlogs.map(blog =>
            blog._id === blogId ? updatedBlog : blog
          ),
        }));

        await fetchAllBlogsData(true);

        updateState({
          notificationMessage: response.bookmarked ? 'Bookmark added!' : 'Bookmark removed!',
          showNotificationBanner: true
        });

        return {
          success: true,
          updatedBlog,
          isBookmarked: bookmarks.includes(user.id),
          bookmarkCount: bookmarks.length
        };

      } catch (error) {
        console.error('❌ useHomePage: Failed to toggle bookmark:', error);
        updateState({
          notificationMessage: 'Failed to update bookmark. Please try again.',
          showNotificationBanner: true
        });
        return { success: false };
      }
    }, [user?.id, updateState, fetchAllBlogsData]),
  };

  return {
    ...state,
    user,
    token,
    logout,
    navigate,
    searchInputRef,
    userBlogs,
    stats,
    updateState,
    fetchAllBlogsData,
    fetchAllUsers,
    updateLastUpdatedTime,
    setUser,
    updateBlogBookmarks,
    ...handlers,
  };
};