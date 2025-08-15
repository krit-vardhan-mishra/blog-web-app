import React from 'react';
import { motion } from 'framer-motion';
import UserProfileSection from '../components/UserProfileSection.jsx';
import StatsSection from '../components/StatsSection.jsx';
import ModalManager from '../components/ModalManager.jsx';
import NotificationBannerManager from '../components/NotificationBannerManager.jsx';
import FloatingActionButton from '../components/ui/FloatingActionButton.jsx';
import { useHomePage } from '../hooks/useHomePage.js';
import { useEffectsManager } from '../hooks/useEffectsManager.js';
import '@/css/home-page.css';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimization.js';
import { BlogProvider } from '@/context/BlogContext.jsx';
import { useSearch } from '@/context/SearchContext.jsx';
import PostsSection from '@/components/PostsSection.jsx';
import Footer from '@/components/Footer.jsx';

export const HomePage = () => {

  const {
    isLoading,
    greeting,
    displayedUserName: originalDisplayedUserName,
    currentTime,
    user,
    token,
    logout,
    navigate,
    stats: originalStats,
    latestBlogs,
    isBlogListRefreshing,
    allBlogs,
    allUsers,
    showWelcomeBanner,
    showNotificationBanner,
    notificationMessage,
    lastUpdated,
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
    fetchAllUsers,
    handleStatClick,
    handleEditPost,
    handleDeleteClick,
    handlePostCreationSuccess,
    handlePostUpdateSuccess,
    handlePostDeleteSuccess,
    handleOpenPostModal,
    handleClosePostModal,
    handleViewIncrement,
    handleToggleBookmark,
  } = useHomePage();

  const {
    userBlogs,
    stats,
    performSearch: optimizedPerformSearch,
    displayedUserName,
  } = usePerformanceOptimizations({
    allBlogs,
    user,
    lastUpdated,
    allUsers
  });

  const {
    updateSearchData,
  } = useSearch();

  // Update search data when blogs/users change
  React.useEffect(() => {
    updateSearchData(allBlogs, allUsers);
  }, [allBlogs, allUsers, updateSearchData]);

  useEffectsManager({
    user,
    token,
    setUser: (userData) => updateState({ user: userData }),
    updateState,
    fetchAllBlogsData,
    fetchAllUsers,
    isEditPostOpen,
    isCreatePostOpen,
    isPostModalOpen,
    selectedBlogForModal,
    showNotificationBanner,
    setNotificationMessage: (msg) => updateState({ notificationMessage: msg }),
    setShowNotificationBanner: (show) => updateState({ showNotificationBanner: show }),
  });

  const blogContextValue = {
    allBlogs,
    latestBlogs,
    userBlogs,
    user,
    token,
    stats,
    refreshBlogs: fetchAllBlogsData,
    isLoading,
  };

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

  return (
    <BlogProvider value={blogContextValue}>
      <div className="min-h-screen bg-[#1A1C20] text-gray-100 flex flex-col">

        {/* Header */}
        

        {/* Main Content */}
        <motion.main
          className="flex-grow max-w-6xl mx-auto px-6 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* User Profile Section */}
          <UserProfileSection
            greeting={greeting}
            displayedUserName={displayedUserName}
            currentTime={currentTime}
            user={user}
            itemVariants={itemVariants}
          />

          {/* Stats Section */}
          <StatsSection
            stats={stats}
            onViewAllStats={() => updateState({ isAllStatsOpen: true })}
            onStatClick={handleStatClick}
            itemVariants={itemVariants}
          />

          {/* Recent Posts Section */}
          <PostsSection
            posts={latestBlogs}
            user={user}
            token={token}
            onEdit={handleEditPost}
            onDelete={handleDeleteClick}
            onOpenModal={handleOpenPostModal}
            itemVariants={itemVariants}
            isRefreshing={isBlogListRefreshing}
            mode="recent"
            showViewAll={allBlogs.length > 6}
            showExploreLink={true}
            showBookmarks={true}
            onToggleBookmark={handleToggleBookmark}
          />
        </motion.main>

        {/* Floating Action Button */}
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
          onToggleBookmark={handleToggleBookmark}

          // Confirm Delete Modal
          isConfirmOpen={isConfirmOpen}
          onCloseConfirm={() => updateState({ isConfirmOpen: false, selectedBlogId: null })}
          onCancelConfirm={() => updateState({ isConfirmOpen: false, selectedBlogId: null })}
          selectedBlogId={selectedBlogId}
          onConfirmDelete={handlePostDeleteSuccess}
        />

        {/* Notification Banners */}
        <NotificationBannerManager
          showWelcomeBanner={showWelcomeBanner}
          showNotificationBanner={showNotificationBanner}
          notificationMessage={notificationMessage}
          onCloseWelcome={() => updateState({ showWelcomeBanner: false })}
          onCloseNotification={() => updateState({ showNotificationBanner: false })}
        />
      </div>

      <Footer />
    </BlogProvider>
  );
};

export default HomePage;