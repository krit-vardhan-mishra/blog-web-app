import React from 'react';

const DeletedPostSkeleton = () => {
  return (
    <div className="pt-7 pr-7 pl-7 p-5 bg-[#1a1d23] rounded-lg shadow-lg">
      <div className="bg-[#2A2E36] rounded-lg p-6">
        {/* Title & Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-1/3 bg-gray-700 rounded-lg" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-700 rounded-lg" />
            <div className="h-8 w-8 bg-gray-700 rounded-lg" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-700 rounded w-2/3" />
        </div>

        {/* Author */}
        <div className="h-4 bg-gray-700 rounded w-1/4 mt-4" />
      </div>
    </div>
  );
};

export default DeletedPostSkeleton;
