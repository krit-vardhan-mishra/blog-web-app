import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Eye, UserIcon } from 'lucide-react';

const PostDetails = ({
  blogId, title, content, author, userId, token, onEdit, onDelete, onOpenModal, initialViews = 0
}) => {
  const isAuthor = author?._id === userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)"
      }}
      onClick={() =>
        onOpenModal({ blogId: blogId, id: blogId, title, content, author, initialViews, views: initialViews })
      }
      className="bg-[#2A2E36] rounded-lg p-6 shadow-md 
                  border-t-[4px] hover:border-t-[8px] border-blue-500
                  hover:scale-110 hover:bg-[#2F333C]
                  transition-all duration-150 ease-in-out
                  relative cursor-pointer"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-150 pointer-events-none" />
      
      <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 hover:text-blue-300 transition-colors duration-150">
        {/* Truncate title to fit in the preview if it's too long */}
        {title}
      </h3>

      {isAuthor && (
        <div className="absolute top-4 right-4 flex space-x-2 opacity-100 hover:opacity-100 transition-opacity duration-150">
          {/* These buttons stop propagation to prevent opening the modal when clicked */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white transition-all duration-150"
            aria-label="Edit Post"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-full bg-red-700 hover:bg-red-600 hover:scale-110 text-white transition-all duration-150"
            aria-label="Delete Post"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <p className="text-gray-300 text-sm mb-4 line-clamp-3 hover:text-gray-200 transition-colors duration-150">
        {/* Display a truncated version of content for preview */}
        {content}
      </p>

      <div className="flex items-center justify-between text-gray-400 text-xs hover:text-gray-300 transition-colors duration-150">
        <div className="flex items-center">
          <UserIcon size={14} className="mr-2 text-blue-400" />
          Author: {author ? author.name : 'Unknown'}
        </div>
        <div className="flex items-center">
          <Eye size={14} className="mr-1" />
          {/* Display initial views here, as the actual increment happens in the modal */}
          {initialViews} Views
        </div>
      </div>

      {/* Animated border glow effect */}
      <div className="absolute inset-0 rounded-lg border border-blue-400/0 hover:border-blue-400/20 transition-all duration-150 pointer-events-none" />
    </motion.div>
  );
};

export default PostDetails;