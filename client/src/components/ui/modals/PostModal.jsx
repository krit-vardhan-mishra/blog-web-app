import React, { useState, useEffect, useRef, useId } from 'react';
import { X, Eye, UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button';
import EditPostModal from './EditPostModal';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import blogService from '../../../api/blogService';
import { NavLink } from 'react-router';
import { formatDate } from '../../../utils/utilityFunctions';

const PostModal = ({
  isOpen,
  onClose,
  blog,
  token,
  userId,
  onEdit,
  onDelete,
  onViewIncrement
}) => {
  const { title, content, author, views, _id, id, createdAt } = blog || {};
  const blogId = id || _id;

  const name = author?.name || ' Unknown';
  const email = author?.email || '';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentViews, setCurrentViews] = useState(views);
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    if (isOpen && blogId && token && !hasIncrementedRef.current) {
      if (!blogService.incrementView) return;

      hasIncrementedRef.current = true;

      const incrementView = async () => {
        try {
          const updatedBlogResponse = await blogService.incrementView(blogId);
          const newViews = updatedBlogResponse.views;
          setCurrentViews(newViews);

          if (onViewIncrement) {
            onViewIncrement(blogId, newViews);
          }
        } catch (error) {
          console.error('Failed to increment blog view:', error);
        }
      };

      incrementView();
    }

    if (!isOpen) {
      hasIncrementedRef.current = false;
    }
  }, [isOpen, blogId, token]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleEdit = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleUpdateSuccess = (message) => {
    console.log(message);
    setIsEditModalOpen(false);
  };

  const isAuthor = userId && author?._id === userId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1A1C20] rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white pr-10">{title}</h2>
                <span className="text-sm text-blue-300 mt-1">{formatDate(createdAt)}</span>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-700 hover:bg-red-600 hover:scale-110 text-white transition-colors duration-200"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6 min-h-[600px]">
              <SimpleBar style={{ maxHeight: 'calc(100vh - 300px)', flexGrow: 1, overflowY: 'auto' }} className="px-4 py-3">
                <div className="text-gray-300 whitespace-pre-line">
                  {content}
                </div>
              </SimpleBar>
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-between items-center text-base text-gray-400 min-h-[80px]">
              <div className="flex flex-col">
                <NavLink to={`/user/${author?._id || author?.id}`} className="flex flex-row pb-2 items-center hover:text-blue-400 transition-colors duration-200">
                  <UserIcon className="mr-2" />
                  Author: {name || 'Unknown'}
                </NavLink>
                {author?.email && (
                  <span className="text-sm text-gray-500">{email}</span>
                )}
              </div>

              <div className="flex items-center text-blue-400">
                <Eye size={16} className="mr-1" />
                <span>{currentViews} Views</span>
              </div>

              {isAuthor && (
                <div className="flex space-x-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition duration-200"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {isEditModalOpen && (
        <EditPostModal
          key={`edit-${blogId}`}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onUpdateSuccess={handleUpdateSuccess}
          blogId={blogId}
          title={title}
          content={content}
          token={token}
          userId={userId}
        />
      )}
    </AnimatePresence>
  );
};

export default PostModal;