import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const LazyPostDetails = lazy(() => import('./PostDetails.jsx'));

const PostDetailsSkeleton = () => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 animate-pulse">
    <div className="h-4 bg-gray-700 rounded mb-2"></div>
    <div className="h-3 bg-gray-700 rounded mb-4"></div>
    <div className="h-20 bg-gray-700 rounded mb-4"></div>
    <div className="flex justify-between">
      <div className="h-3 bg-gray-700 rounded w-20"></div>
      <div className="h-3 bg-gray-700 rounded w-16"></div>
    </div>
  </div>
);