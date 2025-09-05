import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

export const useDebouncedSearch = (allBlogs, allUsers, debounceMs = 300) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceTimerRef = useRef(null);
  
  const navigate = useNavigate();

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
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debounceMs, allBlogs, allUsers]);

  const performSearch = useCallback((query) => {
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

    // Search users
    const matchingUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm) ||
      (user.about || '').toLowerCase().includes(searchTerm)
    );

    // Sort results by relevance
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

  const handleSearchResultClick = useCallback((result, onOpenModal) => {
    if (result.type === 'blog') {
      onOpenModal(result);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isSearchActive,
    searchQuery,
    searchResults,
    searchLoading,
    handleSearchToggle,
    handleSearchChange,
    handleSearchResultClick,
    resetSearch,
  };
};