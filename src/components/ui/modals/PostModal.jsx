import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostModalSkeleton from '../../../skeleton/component/ui/PostModalSkeleton';
import { Button } from '../Button';
import EditPostModal from './EditPostModal';

const PostModal = ({ isOpen, onClose, title, content, author, isLoading = false, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen) return null;

  if (isLoading) {
    return <PostModalSkeleton isOpen={isOpen} onClose={onClose} />;
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateSuccess = (message) => {
    console.log(message);
    setIsEditModalOpen(false);
    // Optionally call onEdit or another callback if needed
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="post-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-[#1C222A] rounded-lg shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:scale-110 z-10 rounded-full p商家-2 shadow-md transition duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
                  <div className="w-full h-px bg-gray-600"></div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-300 leading-relaxed text-lg mb-4">{content}</p>
                  <div className="w-full h-px bg-gray-600"></div>
                </div>

                <div className="flex justify-between items-end flex-wrap gap-4">
                  <div>
                    <p className="text-gray-400 text-lg">
                      <span className="font-medium">Author:</span> {author?.name || 'Unknown'}
                    </p>
                    {author?.email && (
                      <p className="text-gray-500 text-sm mt-1">{author.email}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {isEditModalOpen && (
        <EditPostModal
          key="edit-post-modal"
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateSuccess={handleUpdateSuccess}
          title={title}
          content={content}
        />
      )}
    </AnimatePresence>
  );
};

export default PostModal;