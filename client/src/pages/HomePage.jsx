import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserIcon,
  Search,
  BinocularsIcon,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import SearchFunctionality from '../components/SearchFunctionality.jsx';
import UserProfileSection from '../components/UserProfileSection.jsx';
import StatsSection from '../components/StatsSection.jsx';
import ModalManager from '../components/ModalManager.jsx';
import NotificationBannerManager from '../components/NotificationBannerManager.jsx';
import FloatingActionButton from '../components/ui/FloatingActionButton.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu.jsx';
import { useHomePage } from '../hooks/useHomePage.js';
import { useEffectsManager } from '../hooks/useEffectsManager.js';
import '@/css/home-page.css';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimization.js';
import { BlogProvider } from '@/context/BlogContext.jsx';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch.js';
import PostsSection from '@/components/PostsSection.jsx';
import Footer from '@/components/Footer.jsx';

export const HomePage = () => {
  const searchInputRef = useRef(null);

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
    isSearchActive,
    searchQuery,
    searchResults,
    searchLoading,
    handleSearchToggle,
    handleSearchChange,
    handleSearchResultClick,
  } = useDebouncedSearch(allBlogs, allUsers);

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
        <Header
          title="Home"
          icons={[
            { icon: HomeIcon, link: '/home' },
            { icon: Search, onClick: handleSearchToggle },
            { icon: BinocularsIcon, link: '/explore' }
          ]}
          customElements={[
            <DropdownMenu key="user-dropdown">
              <DropdownMenuTrigger asChild>
                <button>
                  <UserIcon className="text-white hover:text-blue-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 mr-6 mt-3">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`/user/${user.id}`)}>
                  Your Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/your-posts')}>
                  Your Posts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account-setting')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  style={{
                    '--hover-bg': '#7f1d1d',
                    '--hover-text': '#ffffff',
                  }}
                  className="hover:bg-[--hover-bg] hover:text-[--hover-text] focus:bg-[--hover-bg] focus:text-[--hover-text]"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>,
          ]}
        />

        {/* Search Functionality */}
        <SearchFunctionality
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          searchResults={searchResults}
          searchLoading={searchLoading}
          searchInputRef={searchInputRef}
          onSearchToggle={handleSearchToggle}
          onSearchChange={handleSearchChange}
          onSearchResultClick={(result) => {
            if (result.type === 'blog') {
              navigate(`/blog/${result._id || result.id}`);
            } else if (result.type === 'user') {
              navigate(`/user/${result._id || result.id}`);
            }
            handleSearchToggle();
          }}
          onPerformSearch={() => { }}
          allBlogs={allBlogs}
        />

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