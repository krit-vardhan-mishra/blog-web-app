import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
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
  Target, 
  Bookmark,
  Clock
} from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import blogCategory from '../utils/blogCategories';
import { formatDate } from '../utils/utilityFunctions';
import NotifyBanner from '../components/ui/NotifyBanner';
import getGenreColor from '@/utils/genreColors';
import '@/css/explore-page.css';

const ExplorePage = () => {
  // Get pre-loaded data from router loader
  const { blogs: initialBlogs, error: loaderError } = useLoaderData();
  
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [blogs] = useState(initialBlogs || []); // No need to fetch again
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Explore More Blogs...";
    
    // Show error notification if loader failed
    if (loaderError) {
      setNotification({
        message: loaderError,
        type: 'error',
      });
    }
  }, [loaderError]);

  // Memoize filtered blogs for optimal performance
  const filteredBlogs = useMemo(() => {
    let filtered = blogs;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog =>
        blog.genre === selectedCategory ||
        (blog.genre === undefined && selectedCategory === 'All')
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        blog.content.toLowerCase().includes(query) ||
        (blog.author?.name || '').toLowerCase().includes(query)
      );
    }

    return filtered;
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

  // Minimal and fast animations since data is pre-loaded
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.15 },
    },
    hover: {
      scale: 1.01,
      y: -2,
      transition: { duration: 0.1 },
    },
  };

  // Memoized blog card component for better performance
  const BlogCard = React.memo(({ blog, index }) => (
    <motion.div
      className="break-inside-avoid mb-6 cursor-pointer"
      variants={cardVariants}
      whileHover="hover"
      onClick={() => handleBlogClick(blog._id)}
      initial="hidden"
      animate="visible"
      style={{ 
        // Add slight delay based on index for staggered effect
        animationDelay: `${index * 0.03}s` 
      }}
    >
      <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              blog.readingDifficulty === 'beginner' ? 'text-green-400 bg-green-900/30' :
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
          <div 
            className="flex items-center space-x-1 hover:text-blue-300 transition-colors duration-200"
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
  ));

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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
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

          <div className="overflow-auto hide-scrollbar p-4 snap-x snap-mandatory">
            <div className="flex flex-nowrap gap-3">
              {Object.values(blogCategory).map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 whitespace-nowrap snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? `${getGenreColor(category)} text-white shadow-lg scale-105`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredBlogs.length} of {blogs.length} blogs
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </motion.div>

        {/* No Results State */}
        {filteredBlogs.length === 0 && (
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

        {/* Optimized Blog Grid with Pre-loaded Data */}
        {filteredBlogs.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredBlogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </div>
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