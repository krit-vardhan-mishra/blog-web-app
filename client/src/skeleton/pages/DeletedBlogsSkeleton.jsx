import React from 'react';
import DeletedPostSkeleton from '../component/DeletedPostSkeleton';
import HeaderSkeleton from '../component/HeaderSkeleton';
import FooterSkeleton from '../component/FooterSkeleton';

const DeletedBlogsSkeleton = () => {
  return (
    <div className="bg-[#1C222A] min-h-screen">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Total Deleted Posts Counter Skeleton */}
      <div className="bg-[#2A2E36] rounded-lg p-4 m-10">
        <div className="flex justify-between items-center">
          <div className="h-6 w-1/4 bg-gray-700 rounded-lg"></div>
          <div className="h-6 w-12 bg-red-700 rounded-lg"></div>
        </div>
      </div>

      {/* List of Deleted Post Skeletons */}
      <div className="space-y-6 px-6 pb-10">
        {[...Array(3)].map((_, index) => (
          <DeletedPostSkeleton key={index} />
        ))}
      </div>

      <FooterSkeleton />
    </div>
  );
};

export default DeletedBlogsSkeleton;
