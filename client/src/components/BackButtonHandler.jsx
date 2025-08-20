import React from 'react';
import useBackButton from '../hooks/useBackButton';

const BackButtonHandler = ({ children }) => {
  // Handle hardware back button for mobile apps
  useBackButton();

  return children;
};

export default BackButtonHandler;
