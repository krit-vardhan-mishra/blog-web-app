import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PublicRoute = ({ redirectPath = '/home' }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  
  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to={redirectPath} replace />;
};

export default PublicRoute;