import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import BlogCard from './BlogCard';

const BlogGrid = ({ 
  filteredBlogs, 
  handleBlogClick, 
  handleAuthorClick,
  newBlogsCount = 0 
}) => {
  // Animation variants for the grid container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.08,
      },
    },
  };

  // Animation variants for individual blog cards
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95,
      rotateX: 10
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.6
      },
    },
  };

  // Special animation for newly loaded blogs during pagination
  const newBlogVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8,
      rotateY: 15,
      filter: "blur(4px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      },
    },
  };

  // Enhanced hover animation for blog cards
  const cardHoverVariants = {
    hover: {
      scale: 1.03,
      rotateY: 2,
      y: -8,
      rotateX: 2,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        duration: 0.3
      }
    }
  };

  // No results state
  if (filteredBlogs.length === 0) {
    return (
      <motion.div
        className="text-center py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileHover={{ scale: 1.01, y: -2 }}
      >
        <motion.div
          animate={{
            rotateY: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">No Blogs Found</h3>
        <p className="text-gray-400">
          Try adjusting your filters or search terms.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="columns-1 md:columns-2 lg:columns-3 xl:columns-3 gap-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredBlogs.map((blog, index) => {
        const isNewBlog = index >= filteredBlogs.length - newBlogsCount;
        const blogVariants = isNewBlog ? newBlogVariants : cardVariants;
        
        return (
          <motion.div
            key={blog._id}
            variants={blogVariants}
            {...cardHoverVariants}
            whileHover="hover"
            className="break-inside-avoid"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
            // Add a glowing effect for new blogs
            animate={isNewBlog ? {
              boxShadow: [
                "0 0 0px rgba(59, 130, 246, 0)",
                "0 0 20px rgba(59, 130, 246, 0.4)",
                "0 0 40px rgba(59, 130, 246, 0.2)",
                "0 0 0px rgba(59, 130, 246, 0)"
              ]
            } : {}}
            transition={isNewBlog ? {
              boxShadow: {
                duration: 2,
                repeat: 2,
                ease: "easeInOut"
              }
            } : {}}
          >
            <BlogCard
              blog={blog}
              index={index}
              handleBlogClick={handleBlogClick}
              handleAuthorClick={handleAuthorClick}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default BlogGrid;
