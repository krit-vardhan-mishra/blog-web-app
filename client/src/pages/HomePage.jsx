import React, { useEffect, useState, useRef } from 'react';
import Header from '../components/Header.jsx';
import {
  HomeIcon,
  UserIcon,
  SettingsIcon,
  Plus,
  Info,
  BinocularsIcon,
  Search,
  X,
  Calendar,
  Eye
} from 'lucide-react';
import NotifyBanner from '../components/ui/NotifyBanner.jsx';
import { getTimeBasedGreeting, getCurrentDateTime, formatDate } from '../utils/utilityFunctions.js';
import { motion, AnimatePresence } from 'framer-motion';
import PostDetails from '../components/PostDetails.jsx';
import PostModal from '../components/ui/modals/PostModal.jsx';
import HomePageSkeleton from '../skeleton/pages/HomePageSkeleton.jsx';
import CreatePostModal from '../components/ui/modals/CreatePostModal.jsx';
import EditPostModal from '../components/ui/modals/EditPostModal.jsx';
import QuickStatsModal from '../components/ui/modals/QuickStatsModal.jsx';
import SingleStatModal from '../components/ui/modals/SingleStatModal.jsx';
import useAuth from '../hooks/useAuth';
import blogService from '../api/blogService';
import userService from '../api/userService';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu.jsx';
import { NavLink, useNavigate } from 'react-router';
import SimpleBar from 'simplebar-react';

export const HomePage = () => {
  const { user, token, setUser, logout } = useAuth();
  const [selectedStat, setSelectedStat] = useState(null);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [isAllStatsOpen, setIsAllStatsOpen] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [greeting, setGreeting] = useState('');
  const [displayedUserName, setDisplayedUserName] = useState('Guest');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allBlogs, setAllBlogs] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedBlogForModal, setSelectedBlogForModal] = useState(null);

  // Search functionality states
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);

  const navigate = useNavigate();

  const userBlogs = allBlogs.filter((blog) => blog.author?._id === user?.id);
  const userBlogsCount = userBlogs.length;
  const totalViews = userBlogs.reduce(
    (sum, blog) => sum + (Number(blog.views) || 0),
    0
  );

  // Get latest 6 blogs for recent posts section
  const latestBlogs = allBlogs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const stats = [
    { title: 'Your Blogs', count: userBlogsCount, subtitle: 'Published posts' },
    { title: 'Total Views', count: totalViews, subtitle: 'Page views' },
    {
      title: 'Last Updated',
      count: lastUpdated || 'Never',
      subtitle: 'Recent activity',
    },
  ];

  const colorMap = {
    'Your Blogs': 'text-blue-400',
    'Total Views': 'text-green-400',
    'Last Updated': 'text-purple-400',
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
      fetchAllUsers();
    }
  }, [token]);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setDisplayedUserName(
      user?.name ? user.name.split(' ')[0] + '...' : 'Guest'
    );
    const interval = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isEditPostOpen) {
      document.title = 'Edit Post';
    } else if (isCreatePostOpen) {
      document.title = 'Create Post';
    } else if (isPostModalOpen) {
      document.title = selectedBlogForModal?.title || 'View Post';
    } else {
      document.title = 'Home - Blog Web App';
    }
  }, [isEditPostOpen, isCreatePostOpen, isPostModalOpen, selectedBlogForModal]);

  useEffect(() => {
    if (user?.id) {
      const hasSeenWelcomeBanner = localStorage.getItem(`hasSeenWelcomeBanner_${user.id}`);
      if (!hasSeenWelcomeBanner) {
        setShowWelcomeBanner(true);
        const timer = setTimeout(() => {
          setShowWelcomeBanner(false);
          localStorage.setItem(`hasSeenWelcomeBanner_${user.id}`, 'true');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.id]);

  // Search functionality effects
  useEffect(() => {
    if (isSearchActive) {
      searchInputRef.current?.focus();

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          handleSearchToggle();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSearchActive]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allBlogs, allUsers]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await userService.updateProfile();
        if (data.user) {
          setUser(data.user);
        } else {
          console.warn('Failed to fetch valid user data:', data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err.message);
      }
    };
    if (token && (!user?.age || !user?.about)) {
      fetchUserDetails();
    }
  }, [token, user?.age, user?.about, setUser]);

  useEffect(() => {
    if (showNotificationBanner) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(false);
        setNotificationMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotificationBanner]);

  // Search functionality methods
  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const performSearch = () => {
    setSearchLoading(true);
    const query = searchQuery.toLowerCase().trim();

    // Search blogs
    const matchingBlogs = allBlogs.filter(blog =>
      blog.title.toLowerCase().includes(query) ||
      blog.content.toLowerCase().includes(query) ||
      (blog.author?.name || '').toLowerCase().includes(query)
    );

    // Search users
    const matchingUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query)
    );

    setSearchResults([
      ...matchingBlogs.map(blog => ({ ...blog, type: 'blog' })),
      ...matchingUsers.map(user => ({ ...user, type: 'user' }))
    ]);

    setSearchLoading(false);
  };

  const handleSearchResultClick = (result) => {
    if (result.type === 'blog') {
      setSelectedBlogForModal(result);
      setIsPostModalOpen(true);
    } else if (result.type === 'user') {
      navigate(`/user/${result._id || result.id}`);
    }
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const fetchAllUsers = async () => {
    try {
      const response = await userService.fetchAll();
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAllUsers([]);
    }
  };

  const handleStatClick = (stat) => {
    setIsAllStatsOpen(false);
    setTimeout(() => {
      setSelectedStat(stat);
      setIsStatModalOpen(true);
    }, 300);
  };

  const handleEditPost = (blog) => {
    setBlogToEdit(blog);
    setIsEditPostOpen(true);
  };

  const handleDeleteClick = (blogId) => {
    setSelectedBlogId(blogId);
    setIsConfirmOpen(true);
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

  const handlePostDeleteSuccess = async (blogId) => {
    try {
      await blogService.delete(blogId);
      setAllBlogs((prev) => prev.filter((b) => b._id !== blogId));
      setNotificationMessage('Post moved to trash successfully!');
      setShowNotificationBanner(true);
      updateLastUpdatedTime();
    } catch (error) {
      console.error('Failed to move blog to trash:', error);
      setNotificationMessage('Failed to move the post to trash.');
      setShowNotificationBanner(true);
    }
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
    setAllBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === blogId || blog.id === blogId
          ? { ...blog, views: newViews }
          : blog
      )
    );
  };

  const updateLastUpdatedTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateString = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const lastUpdatedString = `${timeString}\n${dateString}`;
    setLastUpdated(lastUpdatedString);
    if (user?.id) {
      localStorage.setItem(`lastUpdated_${user.id}`, lastUpdatedString);
    }
  };

  const fetchAllBlogsData = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const blogsData = await blogService.fetchAll();
      const duration = Date.now() - start;
      const minDelay = 500;

      if (duration < minDelay) {
        await new Promise((res) => setTimeout(res, minDelay - duration));
      }

      setAllBlogs(blogsData);
    } catch (error) {
      console.error('Failed to fetch blogs', error);
      setAllBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#1A1C20] text-gray-100 flex flex-col">
      <Header
        title="Home"
        icons={[
          { icon: HomeIcon, link: '/home' },
          { icon: Search, onClick: handleSearchToggle }
        ]}
        customElements={[
          <DropdownMenu key="user-dropdown">
            <DropdownMenuTrigger asChild>
              <button>
                <UserIcon className="text-white hover:text-blue-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 mr-6 mt-3">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/your-posts')}>
                Your Posts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/account-setting')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
                style={{
                  '--hover-bg': '#7f1d1d',
                  '--hover-text': '#ffffff',
                }}
                className="hover:bg-[--hover-bg] hover:text-[--hover-text] focus:bg-[--hover-bg] focus:text-[--hover-text]"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ]}
      />

      {/* Search Input Section */}
      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="inset-0 flex justify-center items-start pt-4 z-10 px-4"
          >
            <div className="max-w-6xl w-full px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 shadow-lg rounded-lg">
              <form onSubmit={handleSearchSubmit} className="flex items-center max-w-7xl mx-auto">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search blogs, users, or content..."
                  className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                />
                <button
                  type="button"
                  onClick={handleSearchToggle}
                  className="ml-3 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                >
                  <X className="text-white w-6 h-6" />
                </button>
              </form>

              {/* Search Results */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 max-h-96 overflow-hidden" 
                >
                  <SimpleBar
                    style={{
                      maxHeight: '384px',
                      width: '100%',
                    }}
                    className="pr-2 p-4"
                  >
                    {searchLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2 p-2">
                        {searchResults.map((result, index) => (
                          <motion.div
                            key={`${result.type}-${result._id || result.id}-${index}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleSearchResultClick(result)}
                            className="p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 border border-gray-600"
                          >
                            {result.type === 'blog' ? (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                    Blog
                                  </span>
                                  <div className="flex items-center space-x-1 text-gray-400 text-xs">
                                    <Eye className="w-3 h-3" />
                                    <span>{result.views || 0}</span>
                                  </div>
                                </div>
                                <h4 className="text-white font-medium mb-1 line-clamp-1">
                                  {result.title}
                                </h4>
                                <p className="text-gray-300 text-sm line-clamp-2 mb-2">
                                  {result.content}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <UserIcon className="w-3 h-3" />
                                    <span>{result.author?.name || 'Anonymous'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(result.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                    User
                                  </span>
                                </div>
                                <h4 className="text-white font-medium mb-1">
                                  {result.name}
                                </h4>
                                {result.email && (
                                  <p className="text-gray-300 text-sm">
                                    {result.email}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </SimpleBar>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        className="flex-grow max-w-6xl mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Greeting */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 shadow-lg mb-8 border border-gray-700"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {greeting},{' '}
                <span className="text-blue-400">{displayedUserName}</span>!
              </h1>

              <p className="text-gray-400 mb-4">{currentTime}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <UserIcon size={16} className="text-blue-400" />
                  <p>
                    {user?.name || 'Loading Name...'}
                    {user?.age && (
                      <span className="ml-2">( Age: {user?.age || 'N/A'} )</span>
                    )}
                  </p>
                </div>
              </div>

              {/* About Section */}
              {user?.about && (
                <div className="flex items-start text-gray-300 bg-[#1A1C20] rounded-lg p-4 mt-4">
                  <div className="mr-2 mt-0.5 text-green-400 flex-shrink-0">
                    <Info size={20} />
                    <p className="text-green-400 font-mono text-sm ms-1 mt-3">
                      &gt;
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400 mb-1">About</p>
                    <div className="text-sm leading-relaxed whitespace-pre-line mt-3">
                      {user.about.split('\n').map((line, index) => (
                        <p key={index} className="about-line mb-2">
                          <span className="text-green-400 font-mono mr-2">
                            &gt;
                          </span>
                          {line
                            .split(
                              /(?<=[\u0900-\u097F])(?=[^\u0900-\u097F])|(?<=[^\u0900-\u097F])(?=[\u0900-\u097F])/g
                            )
                            .map((part, idx) => {
                              const isDevanagari = /[\u0900-\u097F]/.test(part);
                              const isEmpty = part.trim() === '';

                              if (isEmpty) return <span key={idx}>{part}</span>;

                              return (
                                <span
                                  key={idx}
                                  className={`hover-word ${isDevanagari ? 'devanagari-text' : 'english-text'}`}
                                  style={{
                                    marginRight: '0.2em',
                                    display: 'inline-block',
                                  }}
                                >
                                  {part}
                                </span>
                              );
                            })}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Container */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
        >
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
                className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-center hover:border-2 hover:border-gray-600 transition-all duration-100 cursor-pointer border border-gray-700"
              >
                <h3 className="text-white font-semibold mb-2">{stat.title}</h3>
                <p
                  className={`text-2xl font-bold ${colorMap[stat.title] || 'text-gray-300'} whitespace-pre-line`}
                >
                  {stat.count || stat.count === 0 ? stat.count : '-'}
                </p>
                <p className="text-gray-400 text-sm">{stat.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Posts Section - Show only latest 6 */}
        <motion.div variants={itemVariants} className='bg-gray-800/50 p-4 border-2 border-gray-700 rounded-lg'>
          <div className='flex flex-row w-full justify-between mb-6'>
            <h2 className="start text-2xl font-bold text-white">Recent Posts</h2>
            <NavLink to={'/explore'} className={'flex font-medium underline text-blue-400 hover:text-blue-500 duration-150'}>
              <BinocularsIcon className='mr-2' /> Explore
            </NavLink>
          </div>
          {latestBlogs.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700">
              <div className="text-gray-400 text-lg">
                No blogs available yet.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <PostDetails
                  key={blog._id || blog.id}
                  blog={blog}
                  author={blog.author}
                  userId={user?.id}
                  token={token}
                  onEdit={() => handleEditPost(blog)}
                  onDelete={() => handleDeleteClick(blog.id || blog._id)}
                  onOpenModal={handleOpenPostModal}
                  onViewIncrement={handleViewIncrement}
                />
              ))}
            </div>
          )}

          {/* Show more button if there are more than 6 blogs */}
          {allBlogs.length > 6 && (
            <div className="text-center mt-6">
              <NavLink
                to="/explore"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <BinocularsIcon className="mr-2 w-5 h-5" />
                View All {allBlogs.length} Posts
              </NavLink>
            </div>
          )}
        </motion.div>
      </motion.main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreatePostOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg cursor-pointer transition-all duration-300"
        aria-label="Create New Post"
      >
        <Plus size={28} />
      </button>

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
          blog={selectedBlogForModal}
          userId={user?.id}
          token={token}
          onEdit={() => handleEditPost(selectedBlogForModal)}
          onDelete={() => {
            const blogId = selectedBlogForModal.id || selectedBlogForModal._id;
            handleDeleteClick(blogId);
            handleClosePostModal();
          }}
          onViewIncrement={handleViewIncrement}
        />
      )}

      {/* Notification Banners */}
      {showWelcomeBanner && (
        <NotifyBanner
          message="Welcome to Your Blog Space"
          subMessage="Ready to share your thoughts with the world? Your creative journey continues here."
          onClose={() => setShowWelcomeBanner(false)}
        />
      )}

      {showNotificationBanner && notificationMessage && (
        <NotifyBanner
          message={notificationMessage}
          type="success"
          onClose={() => setShowNotificationBanner(false)}
        />
      )}
      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedBlogId(null);
        }}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedBlogId(null);
        }}
        content={'Are you sure you want to delete this post?'}
        onConfirm={async () => {
          try {
            setIsConfirmOpen(false);
            await handlePostDeleteSuccess(selectedBlogId);
          } catch (error) {
            console.error('Failed to delete blog:', error);
          } finally {
            setSelectedBlogId(null);
          }
        }}
      />
    </div>
  );
};

export default HomePage;