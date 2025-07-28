import { useEffect } from 'react';
import { getTimeBasedGreeting, getCurrentDateTime } from '../utils/utilityFunctions.js';
import userService from '../api/userService.js';

export const useEffectsManager = ({
  user,
  token,
  setUser,
  updateState,
  fetchAllBlogsData,
  fetchAllUsers,
  isEditPostOpen,
  isCreatePostOpen,
  isPostModalOpen,
  selectedBlogForModal,
  showNotificationBanner,
  setNotificationMessage,
  setShowNotificationBanner
}) => {

  useEffect(() => {
    if (token) {
      fetchAllBlogsData();
      fetchAllUsers();
    }
  }, [token, user, fetchAllBlogsData, fetchAllUsers]);

  useEffect(() => {
    updateState({
      greeting: getTimeBasedGreeting(),
      displayedUserName: user?.name ? user.name.split(' ')[0] + '...' : 'Guest'
    });
    
    const interval = setInterval(() => {
      updateState({ currentTime: getCurrentDateTime() });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user, updateState]);

  useEffect(() => {
    if (isEditPostOpen) {
      document.title = 'Edit Post';
    } else if (isCreatePostOpen) {
      document.title = 'Create Post';
    } else if (isPostModalOpen) {
      document.title = selectedBlogForModal?.title || 'View Post';
    } else {
      document.title = 'Home - Blog Web App';
    }
  }, [isEditPostOpen, isCreatePostOpen, isPostModalOpen, selectedBlogForModal]);

  useEffect(() => {
    if (user?.id) {
      const hasSeenWelcomeBanner = localStorage.getItem(`hasSeenWelcomeBanner_${user.id}`);
      if (!hasSeenWelcomeBanner) {
        updateState({ showWelcomeBanner: true });
        const timer = setTimeout(() => {
          updateState({ showWelcomeBanner: false });
          localStorage.setItem(`hasSeenWelcomeBanner_${user.id}`, 'true');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.id, updateState]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await userService.updateProfile();
        if (data.user) {
          setUser(data.user);
        } else {
          console.warn('Failed to fetch valid user data:', data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err.message);
      }
    };
    
    if (token && (!user?.age || !user?.about)) {
      fetchUserDetails();
    }
  }, [token, user?.age, user?.about, setUser]);

  useEffect(() => {
    if (showNotificationBanner) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(false);
        setNotificationMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationBanner, setShowNotificationBanner, setNotificationMessage]);

  useEffect(() => {
    const savedLastUpdated = localStorage.getItem(`lastUpdated_${user?.id}`);
    if (savedLastUpdated) {
      updateState({ lastUpdated: savedLastUpdated });
    }
  }, [user?.id, updateState]);
};