import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Hash } from 'lucide-react';

const TagSuggestions = ({ 
  searchQuery, 
  allBlogs, 
  onTagSelect, 
  isVisible 
}) => {
  const suggestions = useMemo(() => {
    if (!searchQuery.startsWith('#') || searchQuery.length < 2) return [];
    
    const tagQuery = searchQuery.substring(1).toLowerCase();
    const allTags = new Set();
    
    allBlogs.forEach(blog => {
      if (blog.tags) {
        blog.tags.forEach(tag => {
          if (tag.toLowerCase().includes(tagQuery)) {
            allTags.add(tag);
          }
        });
      }
    });
    
    return Array.from(allTags).slice(0, 5);
  }, [searchQuery, allBlogs]);

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg mt-1 z-50 shadow-lg"
        >
          <div className="p-2">
            <div className="text-xs text-gray-400 px-2 py-1 flex items-center">
              <Hash size={12} className="mr-1" />
              Tag suggestions:
            </div>
            {suggestions.map((tag, index) => (
              <motion.button
                key={tag}
                onClick={() => onTagSelect(`#${tag}`)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-center"
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Tag size={14} className="mr-2 text-blue-400" />
                <span className="text-white">#{tag}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TagSuggestions;