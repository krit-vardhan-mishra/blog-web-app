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
  // Animation variants for the grid container itself, for a staggered appearance of children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3, // Overall duration for the container's appearance
        staggerChildren: 0.08, // Delay between each child's animation
      },
    },
  };

  // Animation variants for individual blog cards when they initially load
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30, // Start 30px below
      scale: 0.95, // Start slightly smaller
      rotateX: 10 // Start with a slight 3D rotation
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring", // Use spring physics for a more natural bounce
        stiffness: 300, // Stiffer spring for quicker bounce
        damping: 25, // Less damping for more oscillation
        duration: 0.6 // Overall duration for individual card animation
      },
    },
  };

  // Special animation for newly loaded blogs during infinite scrolling pagination
  const newBlogVariants = {
    hidden: {
      opacity: 0,
      y: 50, // Start further below
      scale: 0.8, // Start significantly smaller
      rotateY: 15, // Add a Y-axis rotation for a unique effect
      filter: "blur(4px)" // Start blurred
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)", // End clear
      transition: {
        type: "spring",
        stiffness: 200, // Softer spring for a more floaty feel
        damping: 20,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom bezier curve for a unique easing
      },
    },
  };

  // Enhanced hover animation for blog cards
  const cardHoverVariants = {
    hover: {
      scale: 1.02, // Slightly enlarge on hover
      rotateY: 1, // Subtle Y-axis rotation
      y: -4, // Lift slightly
      rotateX: 1, // Subtle X-axis rotation
      transition: {
        type: "spring",
        stiffness: 400, // Quick response on hover
        damping: 25,
        duration: 0.3
      }
    }
  };

  // State to display when no blogs are found
  if (filteredBlogs.length === 0) {
    return (
      <motion.div
        className="text-center py-8 sm:py-12 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl mx-2 sm:mx-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        whileHover={{ scale: 1.01, y: -2 }} // Gentle hover effect for the no-results box
      >
        <motion.div
          // Continuous animation for the icon inside the no-results box
          animate={{
            rotateY: [0, 360], // Rotate on Y-axis
            scale: [1, 1.1, 1] // Pulsating scale effect
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
        </motion.div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">No Blogs Found</h3>
        <p className="text-gray-400 text-sm sm:text-base px-4">
          Try adjusting your filters or search terms.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6 px-2 sm:px-0"
      variants={containerVariants} // Apply container entrance animation
      initial="hidden"
      animate="visible"
    >
      {filteredBlogs.map((blog, index) => {
        // Determine if the blog is newly loaded for pagination, apply specific variant
        const isNewBlog = index >= filteredBlogs.length - newBlogsCount;
        const blogVariants = isNewBlog ? newBlogVariants : cardVariants;

        return (
          <motion.div
            key={blog._id}
            variants={blogVariants} // Apply hidden/visible variants
            {...cardHoverVariants} // Spread hover variants
            whileHover="hover" // Enable hover state
            className="break-inside-avoid"
            style={{
              perspective: "1000px", // Enable 3D transform for child elements
              transformStyle: "preserve-3d" // Keep children in 3D space
            }}
            // Add a subtle glowing effect specifically for new blogs
            animate={isNewBlog ? {
              boxShadow: [
                "0 0 0px rgba(59, 130, 246, 0)", // Start no glow
                "0 0 15px rgba(59, 130, 246, 0.3)", // Glow intensely
                "0 0 30px rgba(59, 130, 246, 0.15)", // Fade out glow
                "0 0 0px rgba(59, 130, 246, 0)" // End no glow
              ]
            } : {}}
            transition={isNewBlog ? {
              boxShadow: {
                duration: 2, // Glow duration
                repeat: 2, // Repeat twice
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
