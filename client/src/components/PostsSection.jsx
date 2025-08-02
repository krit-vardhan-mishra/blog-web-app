import React from 'react';
import { motion } from 'framer-motion';
import { BinocularsIcon, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import OptimizedPostDetails from './OptimizedPostDetails.jsx';

const PostsSection = ({
  // Common props
  posts = [],
  user,
  token,
  onEdit,
  onDelete,
  onOpenModal,
  itemVariants,
  isRefreshing = false,

  mode = 'recent',
  postsCount,
  showViewAll = false,
  showExploreLink = false,
  showBookmarks = false,
  onToggleBookmark,
}) => {

  return (
    <motion.div
      variants={itemVariants}
      className='bg-gray-800/50 p-4 border-2 border-gray-700 rounded-lg'
    >
      <SectionHeader
        mode={mode}
        postsCount={postsCount}
        showExploreLink={showExploreLink}
      />

      {posts.length === 0 ? (
        <EmptyState mode={mode} />
      ) : (
        <>
          <PostsGrid
            posts={posts}
            user={user}
            token={token}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenModal={onOpenModal}
            onToggleBookmark={showBookmarks ? onToggleBookmark : null}
            mode={mode}
          />

          {showViewAll && <ViewAllButton />}
        </>
      )}
    </motion.div>
  );
};

const SectionHeader = ({ mode, postsCount, showExploreLink }) => (
  <div className='flex flex-row w-full justify-between mb-6'>
    <h2 className="text-2xl font-bold text-white">
      {mode === 'recent' ? 'Recent Posts' : 'Your Blog Posts'}
      {mode === 'my-posts' && <span className="text-blue-400 ml-2">({postsCount})</span>}
    </h2>
    {showExploreLink && (
      <NavLink
        to={'/explore'}
        className={'flex font-medium underline text-blue-400 hover:text-blue-500 duration-150'}
      >
        <BinocularsIcon className='mr-2' /> Explore
      </NavLink>
    )}
  </div>
);

const EmptyState = ({ mode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700"
  >
    <div className="text-gray-400 text-lg">
      {mode === 'recent' ? (
        'No blogs available yet.'
      ) : (
        <>
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No blogs available yet</h3>
          <p className="text-gray-500">Click the + button to create your first blog post</p>
        </>
      )}
    </div>
  </motion.div>
);

const PostsGrid = ({
  posts,
  user,
  token,
  onEdit,
  onDelete,
  onOpenModal,
  onToggleBookmark,
  mode
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {posts.map((blog) => (
      <OptimizedPostDetails
        key={blog._id || blog.id}
        blog={blog}
        author={blog.author}
        userId={user?.id}
        token={token}
        onEdit={() => onEdit(blog)}
        onDelete={() => onDelete(blog.id || blog._id)}
        onOpenModal={onOpenModal}
        onToggleBookmark={mode === 'recent' || onToggleBookmark ? onToggleBookmark : null}
      />
    ))}
  </div>
);

const ViewAllButton = () => (
  <div className="text-center mt-6">
    <NavLink
      to={'/explore'}
      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
    >
      <BinocularsIcon className="mr-2 w-5 h-5" />
      View All Posts
    </NavLink>
  </div>
);

export default PostsSection;