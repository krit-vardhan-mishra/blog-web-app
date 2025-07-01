import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PrivateRoute = ({ redirectPath = '/login' }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || !token) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;