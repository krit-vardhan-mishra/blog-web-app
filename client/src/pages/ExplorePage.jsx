import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSearch } from '@/context/SearchContext';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import FloatingIcons from '@/components/ui/FloatingIcons';
import SearchSection from '@/components/ui/SearchSection';
import CategoryFilter from '@/components/ui/CategoryFilter';
import BlogGrid from '@/components/ui/BlogGrid';
import LoadingStates from '@/components/ui/LoadingStates';
import NotifyBanner from '@/components/ui/NotifyBanner';
import '@/css/explore-page.css';

const ExplorePage = () => {
  const { blogs: initialBlogs, pagination: initialPagination, error: loaderError } = useLoaderData();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { updateSearchData } = useSearch();
  const navigate = useNavigate();

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

  useEffect(() => {
    updateSearchData(blogs, []);
  }, [blogs, updateSearchData]);

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
      const isTagSearch = query.startsWith('#');
      const tagQuery = isTagSearch ? query.substring(1) : query;

      filtered = filtered.filter(blog => {
        if (isTagSearch) {
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

  // Variants for the main content container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1, // Stagger children animations
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#1A1C20] text-gray-100 flex flex-col relative overflow-hidden">
      {/* Animated Background for subtle visual interest */}
      <AnimatedBackground />
      {/* Floating Icons for decorative elements */}
      <FloatingIcons />

      {/* Main content wrapper with increased z-index to appear above background elements */}
      <div className="relative z-10">
        {/* Search Input Section with motion for active/inactive states */}
        <SearchSection
          isSearchActive={isSearchActive}
          searchQuery={searchQuery}
          handleSearchToggle={handleSearchToggle}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />

        {/* Main content area with entrance animation */}
        <motion.div
          className="flex-1 max-w-7xl mx-auto p-6 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Category Filter Section with its own entrance animation and interactivity */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            isCategoryModalOpen={isCategoryModalOpen}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            blogsCount={filteredBlogs.length}
            totalBlogs={blogs.length}
            searchQuery={searchQuery}
          />

          {/* Blog Grid, with staggered children animations for individual cards */}
          <BlogGrid
            filteredBlogs={filteredBlogs}
            handleBlogClick={handleBlogClick}
            handleAuthorClick={handleAuthorClick}
            newBlogsCount={newBlogsCount}
          />

          {/* Loading and End-of-Content States with subtle animations */}
          <LoadingStates
            loading={loading}
            pagination={pagination}
            blogsLength={filteredBlogs.length} // Use filteredBlogs.length for accurate count
          />
        </motion.div>

        {/* Notification Banner with entry and exit animations */}
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
