import React, { memo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const LazyPostDetails = lazy(() => import('./PostDetails.jsx'));

const PostDetailsSkeleton = () => (
  <div className="bg-gray-800/50 rounded-lg p-6 shadow-md border-t-[4px] border-blue-500 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="h-6 bg-gray-700 rounded mb-2 w-3/4"></div>
      </div>
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
        <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
      </div>
    </div>
    
    <div className="flex gap-2 mb-3">
      <div className="h-6 bg-gray-700 rounded w-16"></div>
      <div className="h-6 bg-gray-700 rounded w-20"></div>
    </div>
    
    <div className="mb-4">
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
      <div className="h-4 bg-gray-700 rounded w-4/6"></div>
    </div>
    
    <div className="flex justify-between">
      <div className="h-3 bg-gray-700 rounded w-24"></div>
      <div className="h-3 bg-gray-700 rounded w-16"></div>
    </div>
  </div>
);

const OptimizedPostDetails = memo(({ 
  blog, 
  author, 
  userId, 
  token, 
  onEdit, 
  onDelete, 
  onOpenModal,
  onToggleBookmark
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.3 
      }}
    >
      <Suspense fallback={<PostDetailsSkeleton />}>
        <LazyPostDetails
          blog={blog}
          author={author}
          userId={userId}
          token={token}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenModal={onOpenModal}
          onToggleBookmark={onToggleBookmark}
        />
      </Suspense>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  const prevBlog = prevProps.blog;
  const nextBlog = nextProps.blog;
  
  return (
    prevBlog._id === nextBlog._id &&
    prevBlog.title === nextBlog.title &&
    prevBlog.views === nextBlog.views &&
    prevBlog.content === nextBlog.content &&
    prevBlog.genre === nextBlog.genre &&
    prevBlog.readingDifficulty === nextBlog.readingDifficulty &&
    prevBlog.averageReadTime === nextBlog.averageReadTime &&
    prevBlog.engagementScore === nextBlog.engagementScore &&
    prevProps.userId === nextProps.userId &&
    prevProps.author?.name === nextProps.author?.name &&
    JSON.stringify(prevBlog.tags) === JSON.stringify(nextBlog.tags) &&
    JSON.stringify(prevBlog.interactionMetrics?.bookmarks) === JSON.stringify(nextBlog.interactionMetrics?.bookmarks) &&
    prevProps.onToggleBookmark === nextProps.onToggleBookmark &&
    prevProps.onOpenModal === nextProps.onOpenModal &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});

OptimizedPostDetails.displayName = 'OptimizedPostDetails';

export default OptimizedPostDetails;