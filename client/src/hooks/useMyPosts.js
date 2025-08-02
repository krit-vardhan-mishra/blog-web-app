import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import blogService from '../api/blogService';

export const useMyPosts = (initialData = null) => {
    const { user, token } = useAuth();
    const isMountedRef = useRef(true);
    const initializationRef = useRef(false);

    const [state, setState] = useState({
        showNotificationBanner: false,
        notificationMessage: '',
        isEditPostOpen: false,
        isCreatePostOpen: false,
        isLoading: initialData ? false : true, 
        isStatModalOpen: false,
        isAllStatsOpen: false,
        selectedStat: null,
        isPostModalOpen: false,
        selectedBlogForModal: null,
        userBlogs: initialData?.blogs || [],
        pagination: initialData?.pagination || null,
        totalBlogs: initialData?.totalBlogs || 0,
        totalViews: initialData?.totalViews || 0,
        lastUpdated: null,
        isConfirmOpen: false,
        selectedBlogId: null,
        blogToEdit: null,
        isLoadingMore: false,
        hasNextPage: initialData?.pagination?.hasNextPage || false,
    });

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const updateState = useCallback((updates) => {
        if (isMountedRef.current) {
            setState(prev => ({ ...prev, ...updates }));
        }
    }, []);

    const fetchUserBlogs = useCallback(async (page = 1, append = false) => {
        if (!user?.id || !isMountedRef.current) return;
        
        const startTime = Date.now();
        if (!append) {
            updateState({ isLoading: true });
        } else {
            updateState({ isLoadingMore: true });
        }

        try {
            const response = await blogService.fetchByUserId(
                user.id,
                {},
                { page, limit: 6 }
            );

            if (!isMountedRef.current) return;

            const newBlogs = response.blogs || [];
            const newPagination = response.pagination;

            const elapsed = Date.now() - startTime;
            const minLoadTime = process.env.NODE_ENV === 'development' ? 300 : 0;
            const remainingTime = minLoadTime - elapsed;

            if (remainingTime > 0 && !append) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            if (isMountedRef.current) {
                updateState({
                    userBlogs: append ? [...state.userBlogs, ...newBlogs] : newBlogs,
                    pagination: newPagination,
                    hasNextPage: newPagination?.hasNextPage || false,
                    isLoading: false,
                    isLoadingMore: false,
                });
            }

        } catch (error) {
            console.error('Failed to fetch user blogs:', error);

            if (!isMountedRef.current) return;

            const elapsed = Date.now() - startTime;
            const minLoadTime = process.env.NODE_ENV === 'development' ? 300 : 0;
            const remainingTime = minLoadTime - elapsed;

            if (remainingTime > 0 && !append) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            updateState({
                userBlogs: append ? state.userBlogs : [],
                isLoading: false,
                isLoadingMore: false
            });
        }
    }, [user?.id, updateState, state.userBlogs]);

    useEffect(() => {
        if (initializationRef.current) return;
        
        const initializeComponent = async () => {
            initializationRef.current = true;
            
            if (initialData) {
                if (isMountedRef.current) {
                    updateState({ 
                        isLoading: false,
                        userBlogs: initialData.blogs || [],
                        pagination: initialData.pagination || null,
                        totalBlogs: initialData.totalBlogs || 0,
                        totalViews: initialData.totalViews || 0,
                        hasNextPage: initialData.pagination?.hasNextPage || false
                    });
                }
            } else if (user?.id && token) {
                // Only fetch if we don't have initial data and have user info
                await fetchUserBlogs(1, false);
            } else {
                // No user or token, set loading to false
                updateState({ isLoading: false });
            }
        };

        // Add a small delay to ensure DOM is ready, but shorter in production
        const initDelay = process.env.NODE_ENV === 'development' ? 100 : 0;
        const timeoutId = setTimeout(initializeComponent, initDelay);
        
        return () => clearTimeout(timeoutId);
    }, [user?.id, token, initialData, fetchUserBlogs, updateState]);

    const userBlogs = useMemo(() => {
        return state.userBlogs.filter(blog => !blog.isDeleted);
    }, [state.userBlogs]);

    const stats = useMemo(() => {
        return [
            { title: 'Your Blogs', count: state.totalBlogs, subtitle: 'Published posts' },
            { title: 'Total Views', count: state.totalViews, subtitle: 'Page views' },
            {
                title: 'Last Updated',
                count: state.lastUpdated || 'Never',
                subtitle: 'Recent activity',
            },
        ];
    }, [state.totalBlogs, state.totalViews, state.lastUpdated]);

    const loadMoreBlogs = useCallback(async () => {
        if (state.hasNextPage && !state.isLoadingMore && state.pagination?.currentPage) {
            await fetchUserBlogs(state.pagination.currentPage + 1, true);
        }
    }, [state.hasNextPage, state.isLoadingMore, state.pagination?.currentPage, fetchUserBlogs]);

    const fetchAllBlogsData = useCallback(async () => {
        if (!user?.id || !isMountedRef.current) return;
        
        try {
            try {
                const statsResponse = await blogService.getUserBlogsStats(user.id);
                if (statsResponse.success && isMountedRef.current) {
                    updateState({
                        totalBlogs: statsResponse.totalBlogs || 0,
                        totalViews: statsResponse.totalViews || 0,
                    });
                }
            } catch (statsError) {
                console.warn('Failed to fetch stats:', statsError);
            }

            await fetchUserBlogs(1, false);
        } catch (error) {
            console.error('Failed to refresh data:', error);
            // Ensure loading state is cleared even on error
            updateState({ isLoading: false });
        }
    }, [user?.id, fetchUserBlogs, updateState]);

    // Update last updated time
    const updateLastUpdatedTime = useCallback(() => {
        if (!isMountedRef.current) return;
        
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
        handleEditPost: useCallback((blog) => {
            updateState({ blogToEdit: blog, isEditPostOpen: true });
        }, [updateState]),

        handleDeleteClick: useCallback((blogId) => {
            updateState({ selectedBlogId: blogId, isConfirmOpen: true });
        }, [updateState]),

        handleOpenPostModal: useCallback((blogData) => {
            updateState({ selectedBlogForModal: blogData, isPostModalOpen: true });
        }, [updateState]),

        handleClosePostModal: useCallback(() => {
            updateState({ isPostModalOpen: false, selectedBlogForModal: null });
        }, [updateState]),

        handleViewIncrement: useCallback((blogId, newViews) => {
            updateState(prev => ({
                userBlogs: prev.userBlogs.map((blog) =>
                    blog._id === blogId || blog.id === blogId
                        ? { ...blog, views: newViews }
                        : blog
                )
            }));
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

        handleStatClick: useCallback((stat) => {
            updateState({ isAllStatsOpen: false });
            setTimeout(() => {
                updateState({ selectedStat: stat, isStatModalOpen: true });
            }, 300);
        }, [updateState]),

        handlePostDeleteSuccess: useCallback(async (blogId) => {
            if (!isMountedRef.current) return;
            
            try {
                await blogService.delete(blogId, token);
                if (isMountedRef.current) {
                    updateState(prev => ({
                        userBlogs: prev.userBlogs.filter((b) => b._id !== blogId),
                        notificationMessage: 'Post moved to trash successfully!',
                        showNotificationBanner: true
                    }));
                    updateLastUpdatedTime();
                }
            } catch (error) {
                console.error('Failed to move blog to trash:', error);
                if (isMountedRef.current) {
                    updateState({
                        notificationMessage: 'Failed to move the post to trash.',
                        showNotificationBanner: true
                    });
                }
            }
        }, [token, updateState, updateLastUpdatedTime]),
    };

    return {
        ...state,
        user,
        token,
        userBlogs,
        stats,
        updateState,
        fetchAllBlogsData,
        fetchUserBlogs,
        loadMoreBlogs,
        updateLastUpdatedTime,
        ...handlers,
    };
};