import { useState, useCallback, useEffect } from 'react';
import blogService from '@/api/blogService';

const useInfiniteScroll = (initialBlogs, initialPagination, selectedCategory) => {
  const [blogs, setBlogs] = useState(initialBlogs || []);
  const [pagination, setPagination] = useState(initialPagination || {});
  const [loading, setLoading] = useState(false);
  const [newBlogsCount, setNewBlogsCount] = useState(0);

  const loadMoreBlogs = useCallback(async () => {
    if (loading || !pagination.hasNextPage) return;

    setLoading(true);
    try {
      // Add a minimum loading time for better UX
      const loadingPromise = new Promise(resolve => setTimeout(resolve, 1500));

      const filters = {
        ...(selectedCategory !== 'All' && { genre: selectedCategory })
      };

      const dataPromise = blogService.fetchForExplore(filters, pagination.currentPage + 1);

      const [, data] = await Promise.all([loadingPromise, dataPromise]);

      if (data.blogs) {
        setBlogs(prevBlogs => {
          const existingIds = new Set(prevBlogs.map(blog => blog._id));
          const newBlogs = data.blogs.filter(blog => !existingIds.has(blog._id));
          setNewBlogsCount(newBlogs.length);
          return [...prevBlogs, ...newBlogs];
        });
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading more blogs:', error);
      throw error;
    } finally {
      setLoading(false);
      // Reset new blogs count after animation completes
      setTimeout(() => setNewBlogsCount(0), 2000);
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

  const handleCategoryChange = useCallback(async (category) => {
    setLoading(true);
    setNewBlogsCount(0);

    try {
      const filters = {
        ...(category !== 'All' && { genre: category })
      };

      const data = await blogService.fetchForExplore(filters, 1);

      if (data.blogs) {
        setBlogs(data.blogs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching filtered blogs:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    blogs,
    setBlogs,
    pagination,
    loading,
    newBlogsCount,
    loadMoreBlogs,
    handleCategoryChange
  };
};

export default useInfiniteScroll;
