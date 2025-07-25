import React from 'react';
import NotifyBanner from './ui/NotifyBanner.jsx';

const NotificationBannerManager = ({
  showWelcomeBanner,
  showNotificationBanner,
  notificationMessage,
  onCloseWelcome,
  onCloseNotification
}) => {
  return (
    <>
      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <NotifyBanner
          message="Welcome to Your Blog Space"
          subMessage="Ready to share your thoughts with the world? Your creative journey continues here."
          onClose={onCloseWelcome}
        />
      )}

      {/* Notification Banner */}
      {showNotificationBanner && notificationMessage && (
        <NotifyBanner
          message={notificationMessage}
          type="success"
          onClose={onCloseNotification}
        />
      )}
    </>
  );
};

export default NotificationBannerManager;