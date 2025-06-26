import React from 'react';
import HeaderSkeleton from '../component/HeaderSkeleton';
import PostDetailsSkeleton from '../component/PostDetailsSkeleton';
import FooterSkeleton from '../component/FooterSkeleton';

const MyPostsSkeleton = () => {
  return (
    <div className="bg-[#1C222A] min-h-screen">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      <div className="max-w-4xl mx-auto p-6">
        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-[#2A2E36] rounded-lg p-4 text-center animate-pulse"
            >
              <div className="h-5 bg-gray-700 rounded-lg mb-2 w-2/3 mx-auto" />
              <div className="h-8 bg-gray-700 rounded-lg mb-2 w-1/3 mx-auto" />
              <div className="h-4 bg-gray-700 rounded-lg w-1/2 mx-auto" />
            </div>
          ))}
        </div>

        {/* Post Skeletons */}
        <PostDetailsSkeleton />
        <PostDetailsSkeleton />
        <PostDetailsSkeleton />
      </div>

      {/* Floating Action Button Skeleton */}
      <div className="fixed bottom-6 right-6 z-50 bg-gray-700 p-4 rounded-full shadow-lg">
        <div className="w-6 h-6 bg-gray-600 rounded"></div>
      </div>

      {/* Footer Skeleton */}
      <FooterSkeleton />
    </div>
  );
};

export default MyPostsSkeleton;
