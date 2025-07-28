import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './RoutesConfig';

const router = createBrowserRouter(routes);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}