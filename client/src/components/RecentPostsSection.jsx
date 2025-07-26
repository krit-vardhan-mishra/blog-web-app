import React from 'react';
import { motion } from 'framer-motion';
import { BinocularsIcon } from 'lucide-react';
import { NavLink } from 'react-router';
import OptimizedPostDetails from './OptimizedPostDetails.jsx';
import { useBookmark } from '../hooks/useBookmark.js';

const RecentPostsSection = ({
  latestBlogs,
  allBlogs,
  user,
  token,
  onEdit,
  onDelete,
  onOpenModal,
  itemVariants
}) => {
  const { toggleBookmark } = useBookmark();

  const handleToggleBookmark = async (blogId) => {
    const result = await toggleBookmark(blogId);
    if (result?.success) {
      // You can show a toast notification here if needed
      console.log(result.message);
    } else if (result?.error) {
      console.error('Bookmark error:', result.error);
    }
  };

  return (
    <motion.div 
      variants={itemVariants} 
      className='bg-gray-800/50 p-4 border-2 border-gray-700 rounded-lg'
    >
      <RecentPostsHeader />
      
      {latestBlogs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <PostsGrid
            latestBlogs={latestBlogs}
            user={user}
            token={token}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenModal={onOpenModal}
            onToggleBookmark={handleToggleBookmark}
          />
          
          {allBlogs.length > 6 && <ViewAllButton />}
        </>
      )}
    </motion.div>
  );
};

const RecentPostsHeader = () => (
  <div className='flex flex-row w-full justify-between mb-6'>
    <h2 className="start text-2xl font-bold text-white">Recent Posts</h2>
    <NavLink 
      to={'/explore'} 
      className={'flex font-medium underline text-blue-400 hover:text-blue-500 duration-150'}
    >
      <BinocularsIcon className='mr-2' /> Explore
    </NavLink>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700">
    <div className="text-gray-400 text-lg">
      No blogs available yet.
    </div>
  </div>
);

const PostsGrid = ({ latestBlogs, user, token, onEdit, onDelete, onOpenModal, onToggleBookmark }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {latestBlogs.map((blog) => (
      <OptimizedPostDetails
        key={blog._id || blog.id}
        blog={blog}
        author={blog.author}
        userId={user?.id}
        token={token}
        onEdit={() => onEdit(blog)}
        onDelete={() => onDelete(blog.id || blog._id)}
        onOpenModal={onOpenModal}
        onToggleBookmark={onToggleBookmark}
      />
    ))}
  </div>
);

const ViewAllButton = () => (
  <div className="text-center mt-6">
    <NavLink
      to="/explore"
      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
    >
      <BinocularsIcon className="mr-2 w-5 h-5" />
      View All Posts
    </NavLink>
  </div>
);

export default RecentPostsSection;