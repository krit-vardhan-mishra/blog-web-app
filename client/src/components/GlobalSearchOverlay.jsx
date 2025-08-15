import React, { useRef } from 'react';
import SearchFunctionality from './SearchFunctionality';
import { useSearch } from '../context/SearchContext';

const GlobalSearchOverlay = ({ allBlogs = [] }) => {
  const searchInputRef = useRef(null);
  const {
    isSearchActive,
    searchQuery,
    searchResults,
    searchLoading,
    handleSearchToggle,
    handleSearchChange,
    handleSearchResultClick,
  } = useSearch();

  if (!isSearchActive) {
    return null;
  }

  return (
    <SearchFunctionality
      isSearchActive={isSearchActive}
      searchQuery={searchQuery}
      searchResults={searchResults}
      searchLoading={searchLoading}
      searchInputRef={searchInputRef}
      onSearchToggle={handleSearchToggle}
      onSearchChange={handleSearchChange}
      onSearchResultClick={handleSearchResultClick}
      onPerformSearch={() => { }}
      allBlogs={allBlogs}
    />
  );
};

export default GlobalSearchOverlay;
