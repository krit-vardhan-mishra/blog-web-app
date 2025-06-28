import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Eye } from 'lucide-react';

const PostDetails = ({
  blogId, title, content, author, userId, token, onEdit, onDelete, onOpenModal, initialViews = 0 }) => {
  const isAuthor = author?._id === userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => onOpenModal({ id: blogId, title, content, author, initialViews })
      } className="bg-[#2A2E36] rounded-lg p-6 shadow-md border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-300 relative cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        {/* Truncate title to fit in the preview if it's too long */}
        <h3 className="text-3xl font-bold text-white leading-tight pr-10 overflow-hidden text-ellipsis whitespace-nowrap max-w-[80%]">
          {title}
        </h3>
        {isAuthor && (
          <div className="flex space-x-2">
            {/* These buttons stop propagation to prevent opening the modal when clicked */}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
              aria-label="Edit Post"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
              aria-label="Delete Post"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Display a truncated version of content for preview */}
      <p className="text-gray-300 text-lg mb-4 leading-relaxed whitespace-pre-line overflow-hidden max-h-24 text-ellipsis">
        {content}
      </p>

      <div className="flex items-center justify-between text-gray-400 text-sm mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">Author:</span>
          <span>{author ? author.name : 'Unknown'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4 mr-1 text-blue-300" />
          {/* Display initial views here, as the actual increment happens in the modal */}
          <span className="text-white font-medium">{initialViews} Views</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PostDetails;
