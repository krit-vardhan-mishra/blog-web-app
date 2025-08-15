import { useEffect, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

import DeletedPost from '../components/DeletedPost';
import NotifyBanner from '../components/ui/NotifyBanner';
import DeletedBlogsSkeleton from '../skeleton/pages/DeletedBlogsSkeleton';
import PermanentDeleteDialog from '../components/ui/modals/PermanentDeleteDialog';
import blogService from '../api/blogService';
import { useAuth } from '@/context/AuthContext';

export const DeletedBlogs = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [confirmationDeleteId, setConfirmationDeleteId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [deletedPosts, setDeletedPosts] = useState([]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  useEffect(() => {
    document.title = 'Deleted Blogs';
    if (token) {
      fetchDeletedBlogsData();
    }
  }, [token]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const fetchDeletedBlogsData = async () => {
    const delay = new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(true);
    try {
      const [blogsData] = await Promise.all([
        blogService.fetchDeleted(),
        delay,
      ]);
      const userDeletedBlogs = blogsData.filter(
        (blog) => blog.author?._id === user?.id && blog.isDeleted
      );
      setDeletedPosts(userDeletedBlogs);
    } catch (error) {
      console.error('Failed to fetch deleted blogs', error);
      setDeletedPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await blogService.restore(id, token);
      setNotificationMessage('Post restored successfully.');
      setShowNotification(true);
      fetchDeletedBlogsData();
    } catch (error) {
      console.error('Failed to restore blog:', error);
      setNotificationMessage('Failed to restore the post.');
      setShowNotification(true);
    }
  };

  const handleDelete = (id) => {
    setConfirmationDeleteId(id);
    setIsDialogOpen(true);
    setIsDialogLoading(true);

    setTimeout(() => {
      setIsDialogLoading(false);
    }, 800);
  };

  const handleDeletionConfirm = async (e) => {
    e.preventDefault();

    if (confirmationDeleteId !== null) {
      try {
        await blogService.permanentlyDelete(confirmationDeleteId, token);
        setNotificationMessage('Blog deleted permanently.');
        setShowNotification(true);
        fetchDeletedBlogsData();
      } catch (error) {
        console.error('Failed to permanently delete blog:', error);
        setNotificationMessage('Failed to permanently delete the post.');
        setShowNotification(true);
      } finally {
        setConfirmationDeleteId(null);
        setIsDialogOpen(false);
        setIsDialogLoading(false);
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setConfirmationDeleteId(null);
    setIsDialogLoading(false);
  };

  if (isLoading) {
    return <DeletedBlogsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#1A1C20] text-white flex flex-col">


      {/* Main content area */}
      <div className="flex-1">
        <motion.div
          className="max-w-6xl mx-auto p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Container - Updated to match UserDetail/MyPosts style */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trash</h2>
                  <p className="text-gray-400">Your deleted blog posts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-400">
                  {deletedPosts.length}
                </p>
                <p className="text-gray-400 text-sm">
                  {deletedPosts.length === 1 ? 'Deleted Post' : 'Deleted Posts'}
                </p>
              </div>
            </div>

            {/* Warning message - ADDED for better UX */}
            {deletedPosts.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 text-sm font-medium">
                    Posts in trash will be permanently deleted after 30 days
                  </p>
                  <p className="text-yellow-300/70 text-xs mt-1">
                    You can restore them anytime before permanent deletion
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Deleted Posts Section */}
          <motion.div variants={itemVariants}>
            {deletedPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700"
              >
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
                  className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Trash2 className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-gray-300">Trash is Empty</h3>
                <p className="text-gray-500">
                  No deleted blog posts found. Deleted posts will appear here.
                </p>
              </motion.div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                  <span>Deleted Posts</span>
                  <span className="text-red-400">({deletedPosts.length})</span>
                </h2>
                <div className="space-y-6">
                  {deletedPosts.map((post) => (
                    <DeletedPost
                      key={post.id || post._id}
                      title={post.title}
                      content={post.content}
                      author={post.author?.name || 'Unknown'}
                      onRestore={() => handleRestore(post.id || post._id)}
                      onDelete={() => handleDelete(post.id || post._id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Confirm Delete Dialog */}
      <PermanentDeleteDialog
        isOpen={isDialogOpen}
        isLoading={isDialogLoading}
        onClose={closeDialog}
        onConfirm={handleDeletionConfirm}
      />

      {/* Deletion Notification */}
      {showNotification && (
        <NotifyBanner
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default DeletedBlogs;