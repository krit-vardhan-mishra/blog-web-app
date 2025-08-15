import React from 'react';
import { Outlet } from 'react-router-dom';
import { SearchProvider } from '../context/SearchContext';

const RootLayout = () => {
  return (
    <SearchProvider>
      <Outlet />
    </SearchProvider>
  );
};

export default RootLayout;