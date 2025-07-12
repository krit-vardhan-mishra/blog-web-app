import { useEffect, useState } from 'react';
import { Trash2, HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import DeletedPost from '../components/DeletedPost';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import DeletedBlogsSkeleton from '../skeleton/pages/DeletedBlogsSkeleton';
import PermanentDeleteDialog from '../components/ui/modals/PermanentDeleteDialog';
import useAuth from '../hooks/useAuth';
import blogService from '../api/blogService';

export const DeletedBlogs = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [confirmationDeleteId, setConfirmationDeleteId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [deletedPosts, setDeletedPosts] = useState([]);

  useEffect(() => {
    document.title = "Deleted Blogs";
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
        delay
      ]);
      const userDeletedBlogs = blogsData.filter(blog => blog.author?._id === user?.id && blog.isDeleted);
      setDeletedPosts(userDeletedBlogs);
    } catch (error) {
      console.error("Failed to fetch deleted blogs", error);
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
      console.error("Failed to restore blog:", error);
      setNotificationMessage("Failed to restore the post.");
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
        console.error("Failed to permanently delete blog:", error);
        setNotificationMessage("Failed to permanently delete the post.");
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
    return <DeletedBlogsSkeleton />
  }

  return (
    <div className="bg-[#1C222A] min-h-screen">
      <Header
        title="Your Deleted Posts"
        className="text-red-600"
        icons={[{ icon: HomeIcon, link: '/home' }, { icon: Trash2, link: '#' }]}
      />

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-[#2A2E36] rounded-lg p-4 hover:border-2 transition-all duration-100 m-10"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold">Total Deleted Posts:</h3>
          <p className="text-xl font-bold text-red-400">{deletedPosts.length} Posts</p>
        </div>
      </motion.div>

      <div className="space-y-6 px-6 pb-10">
        {deletedPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400 text-lg mt-10"
          >
            No deleted blogs available.
          </motion.div>
        ) : (
          deletedPosts.map((post) => (
            <DeletedPost
              key={post.id || post._id}
              title={post.title}
              content={post.content}
              author={post.author?.name || 'Unknown'} 
              onRestore={() => handleRestore(post.id || post._id)}
              onDelete={() => handleDelete(post.id || post._id)}
            />
          ))
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <PermanentDeleteDialog
        isOpen={isDialogOpen}
        isLoading={isDialogLoading}
        onClose={closeDialog}
        onConfirm={handleDeletionConfirm}
      />

      <Footer />

      {/* Deletion Notification */}
      {showNotification && (
        <NotifyBanner
          message={notificationMessage}
          duration={3000}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default DeletedBlogs;