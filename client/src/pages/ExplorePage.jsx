import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Eye,
  UserIcon,
  Filter,
  Sparkles,
  AlertCircle,
  X,
  Tag,
  Target, Bookmark,
  Clock
} from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import blogService from '../api/blogService';
import blogCategory from '../utils/blogCategories';
import { formatDate } from '../utils/utilityFunctions';
import NotifyBanner from '../components/ui/NotifyBanner';

const ExplorePage = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Explore More Blogs...";
  }, []);

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, selectedCategory, searchQuery]);

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

  const fetchAllBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBlogs = await blogService.fetchAll();
      const activeBlogs = allBlogs.filter(blog => !blog.isDeleted);
      setBlogs(activeBlogs);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Failed to fetch blogs');
      setNotification({
        message: 'Failed to load blogs',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog =>
        blog.genre === selectedCategory ||
        (blog.genre === undefined && selectedCategory === 'All')
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBlogs(filtered);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleAuthorClick = (e, authorId) => {
    e.stopPropagation();
    if (authorId) {
      navigate(`/user/${authorId}`);
    }
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Lifestyle': 'bg-pink-500',
      'Business': 'bg-blue-500',
      'Entertainment': 'bg-purple-500',
      'Science': 'bg-green-500',
      'Art': 'bg-orange-500',
      'Sports': 'bg-red-500',
      'Technology': 'bg-cyan-500',
      'Health': 'bg-emerald-500',
      'Travel': 'bg-indigo-500',
      'Food': 'bg-yellow-500',
      'Education': 'bg-teal-500',
      'All': 'bg-gray-500'
    };
    return colors[genre] || 'bg-gray-500';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1C20] text-white">
        <Header
          title="Explore"
          isLoading={true}
          icons={[{ icon: Search, onClick: handleSearchToggle }]}
        />
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800/50 rounded-lg p-6 animate-pulse"
                style={{ height: `${200 + (i % 3) * 100}px` }}
              >
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1C20] text-gray-100 flex flex-col">
      <Header
        title="Explore"
        icons={[{ icon: Search, onClick: handleSearchToggle }]}
        customElements={[
          !isAuthenticated && (
            <div className="flex gap-3" key="auth-buttons">
              <Button
                type="login"
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                type="signup"
                className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
                onClick={() => navigate('/signup')}
              >
                Signup
              </Button>
            </div>
          ),
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
                  placeholder="Search blogs, authors, or content..."
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex-1 max-w-7xl mx-auto p-6 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Category Filter Section */}
        <motion.div
          className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Browse by Category</h2>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>

          <div className="flex flex-wrap gap-3">
            {Object.values(blogCategory).map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                  ? `${getGenreColor(category)} text-white shadow-lg scale-105`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredBlogs.length} of {blogs.length} blogs
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-red-500/20"
            variants={itemVariants}
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-red-400">
              Failed to Load Blogs
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button
              onClick={fetchAllBlogs}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </Button>
          </motion.div>
        )}

        {/* No Results State */}
        {!loading && !error && filteredBlogs.length === 0 && (
          <motion.div
            className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700"
            variants={itemVariants}
          >
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Blogs Found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try adjusting your filters or search terms.'
                : 'No blogs have been published yet.'}
            </p>
          </motion.div>
        )}

        {/* Masonry Blog Grid */}
        {!loading && !error && filteredBlogs.length > 0 && (
          <motion.div
            className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
            variants={itemVariants}
          >
            <AnimatePresence>
              {filteredBlogs.map((blog) => (
                <motion.div
                  key={blog._id}
                  className="break-inside-avoid mb-6 cursor-pointer"
                  variants={cardVariants}
                  whileHover="hover"
                  layout
                  onClick={() => handleBlogClick(blog._id)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">

                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-3 text-white hover:text-blue-300 transition-colors duration-200 line-clamp-2">
                      {blog.title}
                    </h3>

                    {/* Genre, Difficulty, Read Time, Engagement */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getGenreColor(blog.genre || 'All')}`}>
                        {blog.genre || 'Uncategorized'}
                      </span>

                      {blog.readingDifficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.readingDifficulty === 'beginner' ? 'text-green-400 bg-green-900/30' :
                          blog.readingDifficulty === 'intermediate' ? 'text-yellow-400 bg-yellow-900/30' :
                            blog.readingDifficulty === 'advanced' ? 'text-red-400 bg-red-900/30' :
                              'text-gray-400 bg-gray-900/30'
                            }`}>
                          {blog.readingDifficulty === 'beginner' ? '🟢' :
                            blog.readingDifficulty === 'intermediate' ? '🟡' :
                              blog.readingDifficulty === 'advanced' ? '🔴' : '⚪'} {blog.readingDifficulty}
                        </span>
                      )}

                      {blog.averageReadTime > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/30 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {Math.round(blog.averageReadTime / 60)}m read
                        </span>
                      )}

                      {blog.engagementScore > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-900/30 flex items-center">
                          <Target size={12} className="mr-1" />
                          {Math.round(blog.engagementScore)} score
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {blog.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200">
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-4 leading-relaxed">
                      {blog.content}
                    </p>

                    {/* Footer: Author, Date, Views, Bookmarks */}
                    <div className="flex items-center justify-between text-xs text-gray-400 space-x-4">
                      <div className="flex items-center space-x-1 hover:text-blue-300 transition-colors duration-200"
                        onClick={(e) => handleAuthorClick(e, blog.author?._id || blog.author?.id)}
                      >
                        <UserIcon className="w-3 h-3 text-blue-400" />
                        <span>{blog.author?.name || 'Anonymous'}</span>
                        <div className="flex items-center text-gray-500">
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {blog.interactionMetrics?.bookmarks?.length > 0 && (
                          <div className="flex items-center text-yellow-400">
                            <Bookmark size={12} className="mr-1" />
                            <span>{blog.interactionMetrics.bookmarks.length}</span>
                          </div>
                        )}

                        <div className="flex items-center text-gray-400 hover:text-blue-300 transition-colors duration-200">
                          <Eye size={12} className="mr-1" />
                          <span>{blog.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Notification */}
      {notification && (
        <NotifyBanner
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default ExplorePage;