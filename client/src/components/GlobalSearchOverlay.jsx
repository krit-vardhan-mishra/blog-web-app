import React from 'react';
import EnhancedSearchOverlay from './EnhancedSearchOverlay';
import { useSearch } from '../context/SearchContext';
import SearchService from '../services/searchService';

const GlobalSearchOverlay = ({ allBlogs = [] }) => {
  const {
    isSearchActive,
    handleSearchToggle,
    handleSearchResultClick,
  } = useSearch();

  if (!isSearchActive) {
    return null;
  }

  return (
    <EnhancedSearchOverlay
      isOpen={isSearchActive}
      onClose={handleSearchToggle}
      onSearchResults={() => {}}
      onSearchResultClick={(result) => {
        handleSearchResultClick(result);
        handleSearchToggle(); // Close the search overlay after clicking a result
      }}
      searchService={new SearchService()}
      allBlogs={allBlogs}
    />
  );
};

export default GlobalSearchOverlay;