import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Filter,
  Sparkles,
  X,
} from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import blogCategory from '../utils/blogCategories';
import NotifyBanner from '../components/ui/NotifyBanner';
import getGenreColor from '@/utils/genreColors';
import '@/css/explore-page.css';
import BlogCard from '@/components/ui/BlogCard';
import blogService from '@/api/blogService';

const ExplorePage = () => {
  const { blogs: initialBlogs, pagination: initialPagination, error: loaderError } = useLoaderData();
  const [blogs, setBlogs] = useState(initialBlogs || []);
  const [pagination, setPagination] = useState(initialPagination || {});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loadMoreBlogs = useCallback(async () => {
    if (loading || !pagination.hasNextPage) return;

    setLoading(true);
    try {
      const filters = {
        page: pagination.currentPage + 1,
        limit: 12,
        ...(selectedCategory !== 'All' && { genre: selectedCategory })
      };

      const data = await blogService.fetchAll(filters);

      if (data.blogs) {
        setBlogs(prevBlogs => [...prevBlogs, ...data.blogs]);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading more blogs:', error);
      setNotification({
        message: 'Failed to load more blogs',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [loading, pagination.hasNextPage, pagination.currentPage, selectedCategory]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreBlogs();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreBlogs]);

  useEffect(() => {
    document.title = "Explore More Blogs...";

    if (loaderError) {
      setNotification({
        message: loaderError,
        type: 'error',
      });
    }
  }, [loaderError]);

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

  const handleCategoryChange = useCallback(async (category) => {
    setSelectedCategory(category);
    setLoading(true);

    try {
      const filters = {
        page: 1,
        limit: 12,
        ...(category !== 'All' && { genre: category })
      };

      const data = await blogService.fetchAll(filters);

      if (data.blogs) {
        setBlogs(data.blogs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching filtered blogs:', error);
      setNotification({
        message: 'Failed to filter blogs',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
                  onClick={() => handleCategoryChange(category)}
                  className={`flex-shrink-0 whitespace-nowrap snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                    ? `bg-${getGenreColor(category)} text-white shadow-lg scale-105`
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

        {/* Blog Grid remains the same */}
        {filteredBlogs.length > 0 && (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {filteredBlogs.map((blog, index) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  index={index}
                  handleBlogClick={handleBlogClick}
                  handleAuthorClick={handleAuthorClick}
                />
              ))}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-gray-300">Loading more blogs...</span>
                </div>
              </div>
            )}

            {/* End of content indicator */}
            {!pagination.hasNextPage && blogs.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">🎉 You've reached the end! No more blogs to load.</span>
                </div>
              </div>
            )}
          </>
        )}
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

export default ExplorePage;