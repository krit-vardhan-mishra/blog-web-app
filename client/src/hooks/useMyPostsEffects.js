import { useEffect, useRef } from 'react';

export const useMyPostsEffects = ({
  user,
  token,
  updateState,
  fetchAllBlogsData,
  isEditPostOpen,
  isCreatePostOpen,
  isPostModalOpen,
  selectedBlogForModal,
  showNotificationBanner,
  setNotificationMessage,
  setShowNotificationBanner
}) => {
  const hasLoadedInitialData = useRef(false);

  // Load last updated time from localStorage
  useEffect(() => {
    const savedLastUpdated = localStorage.getItem(`lastUpdated_${user?.id}`);
    if (savedLastUpdated) {
      updateState({ lastUpdated: savedLastUpdated });
    }
  }, [user?.id, updateState]);

  // Fetch data when token is available (only once)
  useEffect(() => {
    if (token && !hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      fetchAllBlogsData();
    }
  }, [token, fetchAllBlogsData]);

  // Update document title based on modal state
  useEffect(() => {
    if (isEditPostOpen) {
      document.title = 'Edit Post';
    } else if (isCreatePostOpen) {
      document.title = 'Create Post';
    } else if (isPostModalOpen) {
      document.title = selectedBlogForModal?.title || 'View Post';
    } else {
      document.title = 'Your Blogs';
    }
  }, [isEditPostOpen, isCreatePostOpen, isPostModalOpen, selectedBlogForModal]);

  // Notification banner auto-hide
  useEffect(() => {
    if (showNotificationBanner) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(false);
        setNotificationMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationBanner, setShowNotificationBanner, setNotificationMessage]);
};