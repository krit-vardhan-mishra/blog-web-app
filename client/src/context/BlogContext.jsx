import React, { createContext, useContext } from 'react';

const BlogContext = createContext();

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children, value }) => {
  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

export default BlogContext;