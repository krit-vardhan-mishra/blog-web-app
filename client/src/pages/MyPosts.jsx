import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, Trash2, SettingsIcon, LogOut } from 'lucide-react';

import StatsSection from '../components/StatsSection.jsx';
import NotificationBannerManager from '../components/NotificationBannerManager.jsx';
import MyPostsSkeleton from '../skeleton/pages/MyPostsSkeleton';
import { useMyPosts } from '../hooks/useMyPosts.js';
import { useMyPostsEffects } from '../hooks/useMyPostsEffects.js';
import ModalManager from '@/components/ModalManager';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import PostsSection from '@/components/PostsSection';
import { useSearch } from '@/context/SearchContext';
import { useLoaderData } from 'react-router';

const InfiniteScrollHandler = ({ hasNextPage, isLoadingMore, onLoadMore }) => {
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  const handleIntersect = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasNextPage && !isLoadingMore) {
      onLoadMore();
    }
  }, [hasNextPage, isLoadingMore, onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect]);

  return (
    <div ref={targetRef} className="h-10 flex items-center justify-center">
      {isLoadingMore && (
        <div className="text-gray-400">Loading more posts...</div>
      )}
    </div>
  );
};

export const MyPosts = () => {
  const loaderData = useLoaderData();
  const { updateSearchData } = useSearch();

  const {
    isLoading,
    user,
    token,
    stats,
    userBlogs,
    hasNextPage,
    isLoadingMore,
    showNotificationBanner,
    notificationMessage,
    selectedStat,
    isStatModalOpen,
    isAllStatsOpen,
    isCreatePostOpen,
    isEditPostOpen,
    blogToEdit,
    isConfirmOpen,
    selectedBlogId,
    isPostModalOpen,
    selectedBlogForModal,
    updateState,
    fetchAllBlogsData,
    loadMoreBlogs,
    handleStatClick,
    handleEditPost,
    handleDeleteClick,
    handlePostCreationSuccess,
    handlePostUpdateSuccess,
    handlePostDeleteSuccess,
    handleOpenPostModal,
    handleClosePostModal,
    handleViewIncrement,
  } = useMyPosts(loaderData);

  useMyPostsEffects({
    user,
    token,
    updateState,
    fetchAllBlogsData,
    isEditPostOpen,
    isCreatePostOpen,
    isPostModalOpen,
    selectedBlogForModal,
    showNotificationBanner,
    setNotificationMessage: (msg) => updateState({ notificationMessage: msg }),
    setShowNotificationBanner: (show) => updateState({ showNotificationBanner: show }),
  });

  // Update search data when user blogs change
  React.useEffect(() => {
    updateSearchData(userBlogs, []);
  }, [userBlogs, updateSearchData]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return <MyPostsSkeleton />;
  }

  return (
    <div className="bg-[#1A1C20] text-white min-h-screen flex flex-col flex-1">
        {/* Header */}
        

        {/* Main content area */}
        <div className="flex-1">
          <motion.div
            className="max-w-6xl mx-auto p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Section */}
            <StatsSection
              stats={stats}
              onViewAllStats={() => updateState({ isAllStatsOpen: true })}
              onStatClick={handleStatClick}
              itemVariants={itemVariants}
            />

            {/* My Posts Section */}
            <PostsSection
              posts={userBlogs}
              user={user}
              token={token}
              onEdit={handleEditPost}
              onDelete={handleDeleteClick}
              onOpenModal={handleOpenPostModal}
              itemVariants={itemVariants}
              mode="my-posts"
              postsCount={userBlogs.length}
            />

            {/* Infinite Scroll Handler */}
            {userBlogs.length > 0 && (
              <InfiniteScrollHandler
                hasNextPage={hasNextPage}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMoreBlogs}
              />
            )}
          </motion.div>
        </div>

        {/* Enhanced Floating Action Button */}
        <FloatingActionButton
          onClick={() => updateState({ isCreatePostOpen: true })}
        />

        {/* Modal Manager */}
        <ModalManager
          // Create Post Modal
          isCreatePostOpen={isCreatePostOpen}
          onCloseCreatePost={() => updateState({ isCreatePostOpen: false })}
          onPostCreationSuccess={handlePostCreationSuccess}

          // Edit Post Modal  
          isEditPostOpen={isEditPostOpen}
          onCloseEditPost={() => updateState({ isEditPostOpen: false })}
          onPostUpdateSuccess={handlePostUpdateSuccess}
          blogToEdit={blogToEdit}
          user={user}
          token={token}

          // Stats Modals
          isAllStatsOpen={isAllStatsOpen}
          onCloseAllStats={() => updateState({ isAllStatsOpen: false })}
          stats={stats}
          onStatClick={handleStatClick}
          isStatModalOpen={isStatModalOpen}
          onCloseStatModal={() => updateState({ isStatModalOpen: false })}
          selectedStat={selectedStat}

          // Post Modal
          isPostModalOpen={isPostModalOpen}
          onClosePostModal={handleClosePostModal}
          selectedBlogForModal={selectedBlogForModal}
          onEdit={handleEditPost}
          onDelete={handleDeleteClick}
          onViewIncrement={handleViewIncrement}
          onToggleBookmark={null}

          // Confirm Delete Modal
          isConfirmOpen={isConfirmOpen}
          onCloseConfirm={() => updateState({ isConfirmOpen: false, selectedBlogId: null })}
          onCancelConfirm={() => updateState({ isConfirmOpen: false, selectedBlogId: null })}
          selectedBlogId={selectedBlogId}
          onConfirmDelete={handlePostDeleteSuccess}
        />

        {/* Notification Banners */}
        <NotificationBannerManager
          showWelcomeBanner={false}
          showNotificationBanner={showNotificationBanner}
          notificationMessage={notificationMessage}
          onCloseWelcome={() => { }}
          onCloseNotification={() => updateState({ showNotificationBanner: false })}
        />
      </div>
  );
};

export default MyPosts;