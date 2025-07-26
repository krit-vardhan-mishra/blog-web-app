import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import blogService from '../api/blogService';
import userService from '../api/userService';
import { getTimeBasedGreeting, getCurrentDateTime } from '../utils/utilityFunctions.js';
import { getInitialRecommendations } from '@/utils/recommendationUtils.js';
import { calculateGenreMatchScore } from '@/utils/blogUtils.js';

export const useHomePage = () => {
  const { user, token, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
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

  // Memoized calculations
  const userBlogs = useMemo(() => 
    state.allBlogs.filter((blog) => blog.author?._id === user?.id), 
    [state.allBlogs, user?.id]
  );

  const stats = useMemo(() => {
    const userBlogsCount = userBlogs.length;
    const totalViews = userBlogs.reduce((sum, blog) => sum + (Number(blog.views) || 0), 0);
    
    return [
      { title: 'Your Blogs', count: userBlogsCount, subtitle: 'Published posts' },
      { title: 'Total Views', count: totalViews, subtitle: 'Page views' },
      {
        title: 'Last Updated',
        count: state.lastUpdated || 'Never',
        subtitle: 'Recent activity',
      },
    ];
  }, [userBlogs, state.lastUpdated]);

  // Helper function to update state
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Blog scoring algorithm
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

  // Fetch functions
  const fetchAllBlogsData = useCallback(async () => {
    updateState({ isLoading: true });
    const start = Date.now();

    try {
      const blogsData = await blogService.fetchAll();

      const duration = Date.now() - start;
      const minDelay = 500;
      if (duration < minDelay) {
        await new Promise((res) => setTimeout(res, minDelay - duration));
      }

      const hasEngagementMetrics = blogsData.some(blog =>
        blog.engagementScore !== undefined &&
        blog.averageReadTime !== undefined
      );

      const recommended = hasEngagementMetrics
        ? getRecommendedBlogs(blogsData, user)
        : getInitialRecommendations(blogsData, user);

      updateState({
        allBlogs: blogsData,
        latestBlogs: recommended,
        isLoading: false
      });

    } catch (error) {
      console.error('Failed to fetch blogs', error);
      updateState({ allBlogs: [], isLoading: false });
    }
  }, [user, getRecommendedBlogs, updateState]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await userService.fetchAll();
      updateState({ allUsers: response.users || [] });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      updateState({ allUsers: [] });
    }
  }, [updateState]);

  // Update last updated time
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
      fetchAllBlogsData();
    }, [updateState, updateLastUpdatedTime, fetchAllBlogsData]),

    handlePostUpdateSuccess: useCallback((message) => {
      updateState({
        notificationMessage: message,
        showNotificationBanner: true,
        isEditPostOpen: false
      });
      updateLastUpdatedTime();
      fetchAllBlogsData();
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
        )
      }));
    }, [updateState]),
  };

  return {
    // State
    ...state,
    user,
    token,
    logout,
    navigate,
    searchInputRef,
    
    // Computed values
    userBlogs,
    stats,
    
    // Functions
    updateState,
    fetchAllBlogsData,
    fetchAllUsers,
    updateLastUpdatedTime,
    setUser,
    
    // Handlers
    ...handlers,
  };
};