import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';

export const useSearch = (allBlogs, allUsers) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSearchToggle = useCallback(() => {
    setIsSearchActive(prev => !prev);
    if (isSearchActive) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isSearchActive]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const performSearch = useCallback(() => {
    setSearchLoading(true);
    
    // Clear results if query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    
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
  }, [searchQuery, allBlogs, allUsers]);

  const handleSearchResultClick = useCallback((result, onOpenModal) => {
    if (result.type === 'blog') {
      onOpenModal(result);
    } else if (result.type === 'user') {
      navigate(`/user/${result._id || result.id}`);
    }
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [navigate]);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
  }, []);

  return {
    isSearchActive,
    searchQuery,
    searchResults,
    searchLoading,
    handleSearchToggle,
    handleSearchChange,
    performSearch,
    handleSearchResultClick,
    resetSearch,
  };
};