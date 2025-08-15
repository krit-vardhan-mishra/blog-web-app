import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HomeIcon, Trash2 } from 'lucide-react';
import { MainAppHeader, DetailHeader, MyPostsHeader } from './StandardHeaders';
import GlobalSearchOverlay from './GlobalSearchOverlay';

const PageLayout = () => {
  const location = useLocation();
  const { pathname } = location;

  const renderHeader = () => {
    if (pathname.startsWith('/blog/')) {
      return <DetailHeader title="Blog" />;
    }
    
    if (pathname.startsWith('/user/')) {
      return <DetailHeader title="User Profile" />;
    }

    switch (pathname) {
      case '/home':
        return <MainAppHeader title="Home" currentPage="home" />;
      case '/explore':
        return <MainAppHeader title="Explore" currentPage="explore" />;
      case '/your-posts':
        return <MyPostsHeader />;
      case '/deleted':
        return <DetailHeader 
          title="Your Deleted Posts" 
          titleClassName="text-red-600"
          additionalIcons={[
            { icon: HomeIcon, link: '/home' },
            { icon: Trash2, link: '#' },
          ]}
        />;
      case '/account-setting':
        return <DetailHeader 
          title="Account Settings"
          additionalIcons={[{ icon: HomeIcon, link: '/home' }]}
        />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderHeader()}
      <GlobalSearchOverlay />
      <Outlet />
    </>
  );
};

export default PageLayout;