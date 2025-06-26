import { useEffect, useState } from 'react';
import { Trash2, HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import DeletedPost from '../components/DeletedPost';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import DeletedBlogsSkeleton from '../skeleton/pages/DeletedBlogsSkeleton';
import PermanentDeleteDialog from '../components/ui/modals/PermanentDeleteDialog';

export const DeletedBlogs = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogLoading, setIsDialogLoading] = useState(false);
  const [confirmationDeleteId, setConfirmationDeleteId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setIsLoading(false);
    }, 1500);
    document.title = "Deleted Blogs";
    return () => setTimeout(timer);
  }, []);

  const [deletedPosts, setDeletedPosts] = useState([
    { id: 1, title: 'Hello', content: 'This is a deleted blog post.', author: 'Yash' },
    { id: 2, title: 'Namaste', content: 'Namaste from the other side.', author: 'Amit' },
    { id: 3, title: 'Namoskar', content: 'A greeting post.', author: 'Priya' },
    { id: 4, title: 'Pranaam', content: 'Respectfully deleted.', author: 'Ravi' }
  ]);

  const handleRestore = (id) => {
    setDeletedPosts(prev => prev.filter(post => post.id !== id));
    setNotificationMessage('Post restored successfully.');
    setShowNotification(true);
  };

  // Trigger dialog
  const handleDelete = (id) => {
    setConfirmationDeleteId(id);
    setIsDialogOpen(true);
    setIsDialogLoading(true);

    setTimeout(() => {
      setIsDialogLoading(false);
    }, 800);
  };

  // Confirm deletion
  const handleDeletionConfirm = (e) => {
    e.preventDefault();

    if (confirmationDeleteId !== null) {
      setDeletedPosts(prev =>
        prev.filter(post => post.id !== confirmationDeleteId)
      );
      setNotificationMessage('Blog deleted permanently.');
      setShowNotification(true);
      setConfirmationDeleteId(null);
      setIsDialogOpen(false);
      setIsDialogLoading(false);
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
        {deletedPosts.map((post) => (
          <DeletedPost
            key={post.id}
            title={post.title}
            content={post.content}
            author={post.author}
            onRestore={() => handleRestore(post.id)}
            onDelete={() => handleDelete(post.id)}
          />
        ))}
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
