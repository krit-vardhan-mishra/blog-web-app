import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { HomeIcon, Trash2, SettingsIcon, LogOut, Plus, X } from 'lucide-react'; 
import { motion } from 'framer-motion';
import PostDetails from '../components/PostDetails';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import MyPostsSkeleton from '../skeleton/pages/MyPostsSkeleton';
import CreatePostModal from '../components/ui/modals/CreatePostModal';
import EditPostModal from '../components/ui/modals/EditPostModal';

export const MyPosts = () => {
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    if (isEditPostOpen) {
      document.title = "Edit Post";
    } else if (isCreatePostOpen) {
      document.title = "Create Post";
    } else {
      document.title = "Your Blogs";
    }

    return () => clearTimeout(timer);
  }, [isEditPostOpen, isCreatePostOpen]);

  useEffect(() => {
    if (showNotificationBanner) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(false);
        setNotificationMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationBanner]);

  const handleEditPost = () => {
    console.log('Edit post clicked');
    setIsEditPostOpen(true);
  };

  const handlePostCreationSuccess = (message) => {
    setNotificationMessage(message);
    setShowNotificationBanner(true);
    setIsCreatePostOpen(false);
  };

  const handlePostUpdateSuccess = (message) => {
    setNotificationMessage(message);
    setShowNotificationBanner(true);
    setIsEditPostOpen(false);
  };

  if (isLoading) {
    return <MyPostsSkeleton />
  }

  return (
    <div className="bg-[#1C222A] min-h-screen">
      <Header
        title="Your Posts"
        icons={[
          { icon: HomeIcon, link: '/home' },
          { icon: Trash2, link: '/deleted' },
          { icon: SettingsIcon, link: '/account-setting' },
          { icon: LogOut, link: '/login' }
        ]}
      />

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-[#2A2E36] rounded-lg p-4 text-center hover:border-2 transition-all duration-100">
            <h3 className="text-white font-semibold mb-2">Your Blogs</h3>
            <p className="text-2xl font-bold text-blue-400">0</p>
            <p className="text-gray-400 text-sm">Published posts</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-[#2A2E36] rounded-lg p-4 text-center hover:border-2 transition-all duration-100">
            <h3 className="text-white font-semibold mb-2">Total Views</h3>
            <p className="text-2xl font-bold text-green-400">0</p>
            <p className="text-gray-400 text-sm">Page views</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-[#2A2E36] rounded-lg p-4 text-center hover:border-2 transition-all duration-100">
            <h3 className="text-white font-semibold mb-2">Last Updated</h3>
            <p className="text-2xl font-bold text-purple-400">-</p>
            <p className="text-gray-400 text-sm">Recent activity</p>
          </motion.div>
        </div>

        <PostDetails title={'Hantarr'} content={'jaflkj af sauidfhisafkjdkj usahfiahfjopajfdsnxzia klaf dfhuehsidfnkajs asfjklf'} author={'Hunter L'} onEdit={handleEditPost} />
        <PostDetails title={'Hunter'} content={'sahfhuhafh sauidfhisafkjdkj usahfiahfjopajfdsnxzia fusdhifcaiushfiuhsa dfhuehsidfnkajs f9heudshfuasmf'} author={'Hunter K'} onEdit={handleEditPost} />
        <PostDetails title={'Shikari'} content={'kafl j[aflds] sauidfhisafkjdkj usahfiahfjopajfdsnxzia dsfalkj sadjfk f9heudshfuasmf'} author={'Hunter J'} onEdit={handleEditPost} />
      </div>

      {/* Floating Action Button */}
      <div
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300">
        <Plus className="w-6 h-6" />
      </div>

      <CreatePostModal isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostSuccess={handlePostCreationSuccess} />

      <EditPostModal
        isOpen={isEditPostOpen}
        onClose={() => setIsEditPostOpen(false)}
        onUpdateSuccess={handlePostUpdateSuccess} />

      <Footer />

      {showNotificationBanner && notificationMessage && (
        <NotifyBanner
          message={notificationMessage}
          onClose={() => setShowNotificationBanner(false)}
        />
      )}
    </div>
  );
};

export default MyPosts;