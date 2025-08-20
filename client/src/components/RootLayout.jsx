import React from 'react';
import { Outlet } from 'react-router-dom';
import { SearchProvider } from '../context/SearchContext';
import BackButtonHandler from './BackButtonHandler';

const RootLayout = () => {
  return (
    <SearchProvider>
      <BackButtonHandler>
        <Outlet />
      </BackButtonHandler>
    </SearchProvider>
  );
};

export default RootLayout;