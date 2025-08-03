import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Sparkles, X } from 'lucide-react';
import blogCategory from '@/utils/blogCategories';
import getGenreColor from '@/utils/genreColors';

const CategoryFilter = ({
  selectedCategory,
  handleCategoryChange,
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  blogsCount,
  totalBlogs,
  searchQuery
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25 },
    },
  };

  return (
    <>
      <motion.div
        className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 shadow-xl"
        variants={itemVariants}
        whileHover={{
          scale: 1.005,
          y: -2,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 truncate w-full overflow-hidden">
            <Filter className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <h2 className="text-base font-medium truncate whitespace-nowrap">Browse by Category</h2>
            <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          </div>

          {/* Mobile Category Button */}
          <motion.button
            onClick={() => setIsCategoryModalOpen(true)}
            className="md:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{selectedCategory}</span>
          </motion.button>
        </div>

        {/* Desktop Category Pills */}
        <div className="hidden md:block overflow-auto hide-scrollbar p-4 snap-x snap-mandatory">
          <div className="flex flex-nowrap gap-3">
            {Object.values(blogCategory).map((category, index) => (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`flex-shrink-0 whitespace-nowrap snap-start px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-md ${selectedCategory === category
                  ? `bg-${getGenreColor(category)} text-white shadow-lg scale-105`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                whileHover={{
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mobile Category Grid */}
        <div className="md:hidden grid grid-cols-2 gap-3 mb-4">
          {Object.values(blogCategory).slice(0, 4).map((category, index) => (
            <motion.button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-md ${selectedCategory === category
                ? `bg-${getGenreColor(category)} text-white shadow-lg`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Mobile "More Categories" button */}
        {Object.values(blogCategory).length > 4 && (
          <motion.button
            onClick={() => setIsCategoryModalOpen(true)}
            className="md:hidden w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all duration-200 border-2 border-dashed border-gray-600 hover:border-gray-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>More Categories</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.button>
        )}

        <motion.div
          className="mt-4 text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Showing {blogsCount} of {totalBlogs} blogs
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </motion.div>
      </motion.div>

      {/* Mobile Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCategoryModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[80vh] overflow-hidden"
              initial={{ y: "100%", scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Filter className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold">Select Category</h3>
                </div>
                <motion.button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.values(blogCategory).map((category, index) => (
                    <motion.button
                      key={category}
                      onClick={() => {
                        handleCategoryChange(category);
                        setIsCategoryModalOpen(false);
                      }}
                      className={`px-4 py-4 rounded-xl text-sm font-medium transition-all duration-200 shadow-md border-2 ${selectedCategory === category
                        ? `bg-${getGenreColor(category)} text-white shadow-lg border-${getGenreColor(category)}`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border-gray-600 hover:border-gray-500'
                        }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span>{category}</span>
                        {selectedCategory === category && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-800/50">
                <motion.button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CategoryFilter;
