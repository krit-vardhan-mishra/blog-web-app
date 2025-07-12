import React, { useEffect, useState } from 'react';
import { Undo2, Trash2 } from 'lucide-react';
import NotifyBanner from './ui/NotifyBanner';
import { motion } from 'framer-motion';
import DeletedPostSkeleton from '../skeleton/component/DeletedPostSkeleton';

export const DeletedPost = ({ title, content, author, onRestore, onDelete, isLoading = false }) => {
  if (isLoading) {
    return <DeletedPostSkeleton />
  }
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleRestore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Restore clicked for:', title);

    if (onRestore) {
      onRestore();
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete clicked for:', title);

    if (onDelete) {
      onDelete();
    }
  };
  
  return (
    <div className="pt-7 pr-7 pl-7 p-5 bg-[#1a1d23] rounded-lg shadow-lg">
      {showNotificationBanner && (
        <NotifyBanner message={notificationMessage} />
      )}

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-[#2A2E36] rounded-lg p-6 hover:border-2 transition-all duration-100"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleRestore}
              className="p-2 rounded-lg hover:bg-[#3A3E46] transition-all duration-200"
              aria-label="Restore post"
            >
              <Undo2 className="h-5 w-5 text-yellow-600 cursor-pointer hover:text-yellow-300" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-[#3A3E46] transition-all duration-200"
              aria-label="Delete post"
            >
              <Trash2 className="h-5 w-5 text-red-700 cursor-pointer hover:text-red-500" />
            </button>
          </div>
        </div>
        <p className="pt-2 text-gray-300 leading-relaxed">{content}</p>
        <p className="text-gray-400 mt-2">Author: {author}</p>
      </motion.div>
    </div>
  );
};

export default DeletedPost;