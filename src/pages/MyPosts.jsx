import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { HomeIcon, Trash2, SettingsIcon, LogOut, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PostDetails from '../components/PostDetails';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import MyPostsSkeleton from '../skeleton/pages/MyPostsSkeleton';
import CreatePostModal from '../components/ui/modals/CreatePostModal';
import EditPostModal from '../components/ui/modals/EditPostModal';
import QuickStatsModal from '../components/ui/modals/QuickStatsModal';
import SingleStatModal from '../components/ui/modals/SingleStatModal';
import useAuth from '../hooks/useAuth';
import * as blogService from '../api/blogService';

export const MyPosts = () => {
  const { user, token } = useAuth();
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isAllStatsOpen, setIsAllStatsOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const userBlogsCount = allBlogs.filter(blog => blog.author?._id === user?.id).length;
  const totalViews = allBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

  const stats = [
    { title: 'Your Blogs', count: userBlogsCount, subtitle: 'Published posts' },
    { title: 'Total Views', count: totalViews, subtitle: 'Page views' },
    { title: 'Last Updated', count: lastUpdated || 'Never', subtitle: 'Recent activity' }
  ];

  const colorMap = {
    'Your Blogs': 'text-blue-400',
    'Total Views': 'text-green-400',
    'Last Updated': 'text-purple-400'
  };

  useEffect(() => {
    const savedLastUpdated = localStorage.getItem(`lastUpdated_${user?.id}`);
    if (savedLastUpdated) {
      setLastUpdated(savedLastUpdated);
    }
  }, [user?.id]);

  useEffect(() => {
    if (token) {
      fetchAllBlogsData();
    }
  }, [token]);

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

  const fetchAllBlogsData = async () => {
    setIsLoading(true);
    try {
      const blogsData = await blogService.fetchAllBlogs(token);
      const userBlogs = blogsData.filter(blog => blog.author?._id === user?.id);
      setAllBlogs(userBlogs);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
      setAllBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLastUpdatedTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    const lastUpdatedString = `${timeString}\n${dateString}`;

    setLastUpdated(lastUpdatedString);

    if (user?.id) {
      localStorage.setItem(`lastUpdated_${user.id}`, lastUpdatedString);
    }
  };

  const handleEditPost = (blog) => {
    console.log('Edit post clicked', blog);
    setIsEditPostOpen(true);
  };

  const handlePostCreationSuccess = (message) => {
    setNotificationMessage(message);
    setShowNotificationBanner(true);
    setIsCreatePostOpen(false);
    updateLastUpdatedTime();
    fetchAllBlogsData();
  };

  const handlePostUpdateSuccess = (message) => {
    setNotificationMessage(message);
    setShowNotificationBanner(true);
    setIsEditPostOpen(false);
    updateLastUpdatedTime();
    fetchAllBlogsData();
  };

  const handleStatClick = (stat) => {
    setSelectedStat(stat);
    setIsStatModalOpen(true);
  };

  if (isLoading) {
    return <MyPostsSkeleton />;
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
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsAllStatsOpen(true)}
            className="text-blue-400 hover:text-blue-500 font-medium underline"
          >
            View All Stats
          </button>
        </div>

        <div className="grid grid- cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleStatClick(stat)}
              className="bg-[#2A2E36] rounded-lg p-4 text-center hover:border-2 transition-all duration-100 cursor-pointer"
            >
              <h3 className="text-white font-semibold mb-2">{stat.title}</h3>
              <p className={`text-2xl font-bold ${colorMap[stat.title] || 'text-gray-300'} whitespace-pre-line`}>
                {stat.count || stat.count === 0 ? stat.count : '-'}
              </p>
              <p className="text-gray-400 text-sm">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {allBlogs.length === 0 ? (
          <p className="text-center text-lg text-gray-300 p-8 bg-[#2A2E36] rounded-lg shadow-sm">
            No blogs available yet.
          </p>
        ) : (
          <div className="space-y-6">
            {allBlogs.map((blog) => (
              <PostDetails
                key={blog.id || blog._id}
                title={blog.title}
                content={blog.content}
                author={blog.author}
                blogId={blog.id || blog._id}
                userId={user?.id}
                token={token}
                onEdit={() => handleEditPost(blog)}
                initialViews={blog.views}
              />
            ))}
          </div>
        )}
      </div>

      <div
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </div>

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostSuccess={handlePostCreationSuccess}
      />

      <EditPostModal
        isOpen={isEditPostOpen}
        onClose={() => setIsEditPostOpen(false)}
        onUpdateSuccess={handlePostUpdateSuccess}
      />

      <QuickStatsModal
        isOpen={isAllStatsOpen}
        onClose={() => setIsAllStatsOpen(false)}
        stats={stats}
      />

      <SingleStatModal
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        stat={selectedStat}
      />

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