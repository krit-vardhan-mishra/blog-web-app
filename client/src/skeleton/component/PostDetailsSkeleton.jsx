import React from 'react'

export const PostDetailsSkeleton = () => {
  return (
    <div className='pt-7 pr-7 pl-7 p-5 bg-[#1a1d23] rounded-lg shadow-lg'>
      <div className="bg-[#2A2E36] rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-7 bg-gray-700 rounded-lg w-1/3"></div>
          <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
        </div>
        <div className="pt-2 space-y-2">
          <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-700 rounded-lg w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded-lg w-4/6"></div>
        </div>
        <div className="h-4 bg-gray-700 rounded-lg w-1/4 mt-2"></div>
      </div>
    </div>
  );
};

export default PostDetailsSkeleton;