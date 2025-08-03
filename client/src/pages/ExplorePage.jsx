import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import NotifyBanner from '../components/ui/NotifyBanner';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import FloatingIcons from '../components/ui/FloatingIcons';
import SearchSection from '../components/ui/SearchSection';
import CategoryFilter from '../components/ui/CategoryFilter';
import BlogGrid from '../components/ui/BlogGrid';
import LoadingStates from '../components/ui/LoadingStates';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import '@/css/explore-page.css';

const ExplorePage = () => {
  const { blogs: initialBlogs, pagination: initialPagination, error: loaderError } = useLoaderData();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Use custom hook for infinite scroll and pagination
  const {
    blogs,
    pagination,
    loading,
    newBlogsCount,
    handleCategoryChange: handleCategoryChangeHook
  } = useInfiniteScroll(initialBlogs, initialPagination, selectedCategory);

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
      const isHashtagSearch = query.startsWith('#');
      const tagQuery = isHashtagSearch ? query.substring(1) : query;

      filtered = filtered.filter(blog => {
        if (isHashtagSearch) {
          return (blog.tags || []).some(tag => tag.toLowerCase().includes(tagQuery));
        }

        return (
          blog.title.toLowerCase().includes(query) ||
          blog.content.toLowerCase().includes(query) ||
          (blog.author?.name || '').toLowerCase().includes(query) ||
          (blog.tags || []).some(tag => tag.toLowerCase().includes(query)) ||
          (blog.genre || '').toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [blogs, selectedCategory, searchQuery]);

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    try {
      await handleCategoryChangeHook(category);
    } catch (error) {
      setNotification({
        message: 'Failed to filter blogs',
        type: 'error',
      });
    }
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

  return (
    <div className="min-h-screen bg-[#1A1C20] text-gray-100 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      <FloatingIcons />

      {/* Content with higher z-index */}
      <div className="relative z-10">
        <Header
          title="Explore"
          icons={[{ icon: Search, onClick: handleSearchToggle }]}
          customElements={[
            !isAuthenticated && (
              <div className="flex gap-3" key="auth-buttons">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="login"
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="signup"
                    className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                    onClick={() => navigate('/signup')}
                  >
                    Signup
                  </Button>
                </motion.div>
              </div>
            ),
          ]}
        />

        {/* Search Input Section */}
        <SearchSection
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          handleSearchToggle={handleSearchToggle}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />

        <motion.div
          className="flex-1 max-w-7xl mx-auto p-6 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Category Filter Section */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            isCategoryModalOpen={isCategoryModalOpen}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            blogsCount={filteredBlogs.length}
            totalBlogs={blogs.length}
            searchQuery={searchQuery}
          />

          {/* Blog Grid */}
          <BlogGrid
            filteredBlogs={filteredBlogs}
            handleBlogClick={handleBlogClick}
            handleAuthorClick={handleAuthorClick}
            newBlogsCount={newBlogsCount}
          />

          {/* Loading States */}
          <LoadingStates
            loading={loading}
            pagination={pagination}
            blogsLength={blogs.length}
          />
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
    </div>
  );
};

export default ExplorePage;