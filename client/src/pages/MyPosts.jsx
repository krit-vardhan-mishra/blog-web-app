import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { HomeIcon, Trash2, SettingsIcon, LogOut, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PostDetails from '../components/PostDetails';
import PostModal from '../components/ui/modals/PostModal.jsx';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal.jsx';
import NotifyBanner from '../components/ui/NotifyBanner';
import Footer from '../components/Footer';
import MyPostsSkeleton from '../skeleton/pages/MyPostsSkeleton';
import CreatePostModal from '../components/ui/modals/CreatePostModal';
import EditPostModal from '../components/ui/modals/EditPostModal';
import QuickStatsModal from '../components/ui/modals/QuickStatsModal';
import SingleStatModal from '../components/ui/modals/SingleStatModal';
import useAuth from '../hooks/useAuth';
import blogService from '../api/blogService';

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
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedBlogForModal, setSelectedBlogForModal] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [blogToEdit, setBlogToEdit] = useState(null);

  const userBlogs = allBlogs.filter(blog => blog.author?._id === user?.id && !blog.isDeleted);
  const userBlogsCount = userBlogs.length;
  const totalViews = userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);

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
    if (isEditPostOpen) {
      document.title = "Edit Post";
    } else if (isCreatePostOpen) {
      document.title = "Create Post";
    } else if (isPostModalOpen) {
      document.title = selectedBlogForModal?.title || "View Post";
    } else {
      document.title = "Your Blogs";
    }
  }, [isEditPostOpen, isCreatePostOpen, isPostModalOpen, selectedBlogForModal]);

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
    const delay = new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(true);
    try {
      const [blogsData] = await Promise.all([
        blogService.fetchAll(token),
        delay
      ]);
      const userNonDeletedBlogs = blogsData.filter(blog => blog.author?._id === user?.id && !blog.isDeleted);
      setAllBlogs(userNonDeletedBlogs);
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
    setBlogToEdit(blog);
    setIsEditPostOpen(true);
  };

  const handleDeleteClick = (blogId) => {
    setSelectedBlogId(blogId);
    setIsConfirmOpen(true);
  };

  const handleOpenPostModal = (blogData) => {
    setSelectedBlogForModal(blogData);
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedBlogForModal(null);
  };

  const handleViewIncrement = (blogId, newViews) => {
    setAllBlogs(prevBlogs =>
      prevBlogs.map(blog =>
        (blog._id === blogId || blog.id === blogId)
          ? { ...blog, views: newViews }
          : blog
      )
    );
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
    setIsAllStatsOpen(false);
    setTimeout(() => {
      setSelectedStat(stat);
      setIsStatModalOpen(true);
    }, 300);
  };

  const handlePostDeleteSuccess = async (blogId) => {
    try {
      await blogService.delete(blogId, token);
      setAllBlogs((prev) => prev.filter((b) => b._id !== blogId));
      setNotificationMessage("Post moved to trash successfully!");
      setShowNotificationBanner(true);
      updateLastUpdatedTime();
    } catch (error) {
      console.error("Failed to move blog to trash:", error);
      setNotificationMessage("Failed to move the post to trash.");
      setShowNotificationBanner(true);
    }
  };

  if (isLoading) {
    return <MyPostsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#1A1C20] text-gray-100 flex flex-col">
      <Header
        title="Your Posts"
        icons={[
          { icon: HomeIcon, link: '/home' },
          { icon: Trash2, link: '/deleted' },
          { icon: SettingsIcon, link: '/account-setting' },
          { icon: LogOut, link: '/login' }
        ]}
      />

      {/* Main content area - this will grow to push footer down */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* Quick Stats Container */}
          <div className="bg-[#323943] rounded-lg p-6 mb-6">
            {/* Header row with title and button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Your Stats</h2>
              <button
                onClick={() => setIsAllStatsOpen(true)}
                className="text-blue-400 hover:text-blue-500 font-medium underline"
              >
                View All Stats
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {userBlogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 text-lg mt-10"
            >
              No blogs available yet.
            </motion.div>

          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <PostDetails
                  key={blog.id || blog._id}
                  title={blog.title}
                  content={blog.content}
                  author={blog.author}
                  blogId={blog.id || blog._id}
                  userId={user?.id}
                  token={token}
                  onDelete={() => handleDeleteClick(blog.id || blog._id)}
                  onEdit={() => handleEditPost(blog)}
                  onOpenModal={handleOpenPostModal}
                  initialViews={blog.views}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Floating Action Button */}
      <div
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300"
      >
        <Plus className="w-6 h-6" />
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostSuccess={handlePostCreationSuccess}
      />

      <EditPostModal
        isOpen={isEditPostOpen}
        onClose={() => setIsEditPostOpen(false)}
        onUpdateSuccess={handlePostUpdateSuccess}
        title={blogToEdit?.title || ''}
        content={blogToEdit?.content || ''}
        blogId={blogToEdit?.id || blogToEdit?._id}
        userId={user?.id}
        token={token}
      />

      <QuickStatsModal
        isOpen={isAllStatsOpen}
        onClose={() => setIsAllStatsOpen(false)}
        stats={stats}
        onStatClick={handleStatClick}
      />

      <SingleStatModal
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        stat={selectedStat}
      />

      {/* The PostModal to show full blog content */}
      {selectedBlogForModal && (
        <PostModal
          isOpen={isPostModalOpen}
          onClose={handleClosePostModal}
          title={selectedBlogForModal.title}
          content={selectedBlogForModal.content}
          author={selectedBlogForModal.author}
          blogId={selectedBlogForModal.id || selectedBlogForModal._id}
          userId={user?.id}
          token={token}
          onViewIncrement={handleViewIncrement}
          onEdit={() => handleEditPost(selectedBlogForModal)}
          onDelete={() => {
            handleDeleteClick(selectedBlogForModal.id || selectedBlogForModal._id)
            handleClosePostModal();
          }}
          initialViews={selectedBlogForModal.views}
        />
      )}

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedBlogId(null);
        }}
        content={"Are you sure you want to delete this post?"}
        onConfirm={async () => {
          try {
            setIsConfirmOpen(false);
            await handlePostDeleteSuccess(selectedBlogId);
          } catch (error) {
            console.error("Failed to delete blog:", error);
          } finally {
            setSelectedBlogId(null);
          }
        }}
      />

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