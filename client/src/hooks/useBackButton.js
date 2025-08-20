import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return; // Only handle back button on native platforms
    }

    const handleBackButton = () => {
      // Define routes where back button should exit the app
      const exitRoutes = ['/home', '/explore', '/'];
      
      if (exitRoutes.includes(location.pathname)) {
        // Exit the app if on main routes
        App.exitApp();
      } else {
        // Navigate back for other routes
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/home', { replace: true });
        }
      }
    };

    // Listen for the back button
    const listener = App.addListener('backButton', handleBackButton);

    // Cleanup
    return () => {
      listener?.remove();
    };
  }, [navigate, location.pathname]);
};

export default useBackButton;
