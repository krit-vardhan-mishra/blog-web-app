import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../api/userService';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allBlogs, setAllBlogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();

  // Update data sources
  const updateSearchData = useCallback((blogs = [], users = []) => {
    setAllBlogs(blogs);
    setAllUsers(users);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setIsSearchActive(prev => {
      if (prev) {
        setSearchQuery('');
        setSearchResults([]);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      }
      return !prev;
    });
  }, []);

  const handleSearchChange = useCallback((e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    debounceTimerRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, allBlogs, allUsers]);

  const performSearch = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const isTagSearch = searchTerm.startsWith('#');
    const tagQuery = isTagSearch ? searchTerm.substring(1) : searchTerm;

    const matchingBlogs = allBlogs.filter(blog => {
      if (isTagSearch) {
        return (blog.tags || []).some(tag => tag.toLowerCase().includes(tagQuery));
      }

      return (
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        (blog.author?.name || '').toLowerCase().includes(searchTerm) ||
        (blog.tags || []).some(tag => tag.toLowerCase().includes(searchTerm)) ||
        (blog.genre || '').toLowerCase().includes(searchTerm)
      );
    });

    // Enhanced user search with email API
    let matchingUsers = [];

    // Check if query looks like an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(searchTerm);

    if (isEmail) {
      try {
        const emailResponse = await userService.fetchByEmail(searchTerm);
        if (emailResponse.data?.success && emailResponse.data.user) {
          matchingUsers = [emailResponse.data.user];
        }
      } catch (emailError) {
        console.log('Email search failed, falling back to general search');
      }
    }

    if (username) {
      try {
        const usernameResponse = await userService.fetchByUsername(username);
        if (usernameResponse.data?.success && usernameResponse.data.user) {
          matchingUsers = [usernameResponse.data.user];
        }
      } catch (error) {
        console.log('Username search failed:', error.message);
      }
    }

    // If no email results or not an email query, search local users
    if (matchingUsers.length === 0) {
      matchingUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        (user.email || '').toLowerCase().includes(searchTerm) ||
        (user.about || '').toLowerCase().includes(searchTerm)
      );
    }

    // Calculate relevance and sort
    const sortedBlogs = matchingBlogs
      .map(blog => ({
        ...blog,
        type: 'blog',
        relevance: calculateRelevance(blog, searchTerm)
      }))
      .sort((a, b) => b.relevance - a.relevance);

    const sortedUsers = matchingUsers
      .map(user => ({
        ...user,
        type: 'user',
        relevance: calculateUserRelevance(user, searchTerm)
      }))
      .sort((a, b) => b.relevance - a.relevance);

    setSearchResults([...sortedBlogs, ...sortedUsers]);
    setSearchLoading(false);
  }, [allBlogs, allUsers]);

  const calculateRelevance = useCallback((blog, searchTerm) => {
    let score = 0;
    const title = blog.title.toLowerCase();
    const content = blog.content.toLowerCase();
    const author = (blog.author?.name || '').toLowerCase();
    const tags = (blog.tags || []).join(' ').toLowerCase();
    const genre = (blog.genre || '').toLowerCase();

    // Title matches get highest score
    if (title.includes(searchTerm)) score += 10;
    if (title.startsWith(searchTerm)) score += 5;

    // Content matches
    if (content.includes(searchTerm)) score += 3;

    // Author matches
    if (author.includes(searchTerm)) score += 5;

    if (tags.includes(searchTerm)) score += 8;
    if ((blog.tags || []).some(tag => tag.toLowerCase() === searchTerm)) score += 15;

    if (genre.includes(searchTerm)) score += 4;

    // Special handling for tag searches
    if (searchTerm.startsWith('#')) {
      const tagQuery = searchTerm.substring(1);
      if ((blog.tags || []).some(tag => tag.toLowerCase().includes(tagQuery))) score += 20;
    }

    // Boost for exact matches
    if (title === searchTerm) score += 20;

    // Boost for recent posts
    const daysSinceCreation = (Date.now() - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) score += 2;

    // Boost for popular posts
    if (blog.views > 100) score += 1;

    return score;
  }, []);

  const calculateUserRelevance = useCallback((user, searchTerm) => {
    let score = 0;
    const name = user.name.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const about = (user.about || '').toLowerCase();

    if (name.includes(searchTerm)) score += 10;
    if (name.startsWith(searchTerm)) score += 5;
    if (email.includes(searchTerm)) score += 7;
    if (about.includes(searchTerm)) score += 3;
    if (name === searchTerm) score += 20;

    return score;
  }, []);

  const handleSearchResultClick = useCallback((result) => {
    if (result.type === 'blog') {
      navigate(`/blog/${result._id || result.id}`);
    } else if (result.type === 'user') {
      navigate(`/user/${result._id || result.id}`);
    }

    // Close search and clear everything
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, [navigate]);

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
    setSearchLoading(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const value = {
    isSearchActive,
    searchQuery,
    searchResults,
    searchLoading,
    handleSearchToggle,
    handleSearchChange,
    handleSearchResultClick,
    resetSearch,
    updateSearchData
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
