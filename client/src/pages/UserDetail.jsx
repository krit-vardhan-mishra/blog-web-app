import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Calendar, Mail, Clock,
  BookOpen, Eye, ArrowLeft, UserCheck,
  UserX, Shield, AlertCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import NotifyBanner from '../components/ui/NotifyBanner';
import blogService from '../api/blogService';
import userService from '../api/userService';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showStatusTooltip, setShowStatusTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  useEffect(() => {
    document.title = user ? `${user.name} - User Profile` : 'User Profile';
  }, [user])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userService.fetchById(userId);
        setUser(response.user);
      } catch (err) {
        setError(err.message);
        setNotification({
          message: 'Failed to load user details',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        setBlogsLoading(true);
        const allBlogs = await blogService.fetchAll();
        const filteredBlogs = allBlogs.filter(blog =>
          blog.author &&
          (blog.author._id === userId || blog.author === userId) &&
          !blog.isDeleted
        );
        setUserBlogs(filteredBlogs);
      } catch (err) {
        console.error('Error fetching user blogs:', err);
        setNotification({
          message: 'Failed to load user blogs',
          type: 'error'
        });
      } finally {
        setBlogsLoading(false);
      }
    };

    if (userId) {
      fetchUserBlogs();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalViews = () => {
    return userBlogs.reduce((total, blog) => total + (blog.views || 0), 0);
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white">
        <Header title="User Profile" isLoading={true} />
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0f0f23] text-white">
        <Header
          title="User Profile"
          icons={[
            { icon: ArrowLeft, link: -1 }
          ]}
        />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-gray-400">The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusHoverStart = () => {
    const timeout = setTimeout(() => {
      setShowStatusTooltip(true);
    }, 800);
    setHoverTimeout(timeout);
  };

  const handleStatusHoverEnd = () => {
    clearTimeout(hoverTimeout);
    setShowStatusTooltip(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white">
      <Header
        title="User Profile"
        icons={[
          { icon: ArrowLeft, link: -1 }
        ]}
      />

      <motion.div
        className="max-w-6xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* User Profile Card */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 mb-6 border border-gray-700"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{user.name || 'Unknown User'}</h1>
                <div
                  className="relative"
                  onMouseEnter={handleStatusHoverStart}
                  onMouseLeave={handleStatusHoverEnd}
                >
                  {user.isAccountVerified ? (
                    <UserCheck className="w-6 h-6 text-green-500 cursor-help" />
                  ) : (
                    <UserX className="w-6 h-6 text-red-500 cursor-help" />
                  )}

                  {showStatusTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: -10 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute left-1/2 -translate-x-1/2 mt-1 px-3 py-1 rounded-md text-sm text-white bg-black bg-opacity-75 z-10 whitespace-nowrap"
                    >
                      {user.isAccountVerified
                        ? 'This user is verified and widely appreciated for their blogs by many followers.'
                        : 'This user is not verified but may still have valuable content.'}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email || 'Email not provided'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>

                {user.age && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Age: {user.age}</span>
                  </div>
                )}

                {user.lastLogin && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Last active: {formatDate(user.lastLogin)}</span>
                  </div>
                )}
              </div>

              {user?.about && (
                <div className="flex items-start text-gray-300 bg-[#1A1C20] rounded-lg p-4 mt-4">
                  <div className="mr-2 mt-0.5 text-green-400 flex-shrink-0">
                    <Info size={20} />
                    <p className="text-green-400 font-mono text-sm ms-1 mt-3">&gt;</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400 mb-1">About</p>
                    <div className="text-sm leading-relaxed whitespace-pre-line mt-3">
                      {user.about.split('\n').map((line, index) => (
                        <p key={index} className="about-line mb-2">
                          <span className="text-green-400 font-mono mr-2">&gt;</span>
                          {line
                            .split(/(?<=[\u0900-\u097F])(?=[^\u0900-\u097F])|(?<=[^\u0900-\u097F])(?=[\u0900-\u097F])/g)
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
                                    display: 'inline-block'
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

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
          variants={itemVariants}
        >
          <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userBlogs.length}</p>
                <p className="text-gray-400">Blog Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{getTotalViews()}</p>
                <p className="text-gray-400">Total Views</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{user.isAccountVerified ? 'Verified' : 'Unverified'}</p>
                <p className="text-gray-400">Account Status</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User's Blog Posts */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <span>Blog Posts by {user.name}</span>
          </h2>

          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : userBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 cursor-pointer"
                  variants={cardVariants}
                  whileHover="hover"
                  onClick={() => handleBlogClick(blog._id)}
                >
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-3">{blog.content}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2 text-blue-300">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-300">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-400">This user hasn't published any blog posts.</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Notification */}
      {
        notification && (
          <NotifyBanner
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )
      }
    </div >
  );
};

export default UserDetail;