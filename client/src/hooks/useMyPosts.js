import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import blogService from '../api/blogService';

export const useMyPosts = () => {
    const { user, token } = useAuth();

    // State management
    const [state, setState] = useState({
        showNotificationBanner: false,
        notificationMessage: '',
        isEditPostOpen: false,
        isCreatePostOpen: false,
        isLoading: true,
        isStatModalOpen: false,
        isAllStatsOpen: false,
        selectedStat: null,
        isPostModalOpen: false,
        selectedBlogForModal: null,
        allBlogs: [],
        lastUpdated: null,
        isConfirmOpen: false,
        selectedBlogId: null,
        blogToEdit: null,
    });

    // Helper function to update state
    const updateState = useCallback((updates) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    // Memoized calculations - filter user's non-deleted blogs
    const userBlogs = useMemo(() =>
        state.allBlogs.filter(
            (blog) => blog.author?._id === user?.id && !blog.isDeleted
        ),
        [state.allBlogs, user?.id]
    );

    const stats = useMemo(() => {
        const userBlogsCount = userBlogs.length;
        const totalViews = userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

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

    // Fetch all blogs data
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

            updateState({ allBlogs: blogsData, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch blogs', error);
            updateState({ allBlogs: [], isLoading: false });
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
                allBlogs: prev.allBlogs.map((blog) =>
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
            try {
                await blogService.delete(blogId, token);
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
        updateLastUpdatedTime,
        ...handlers,
    };
};