import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import PostModal from './ui/modals/PostModal';
import PostDeltailsSkeleton from '../skeleton/component/PostDetailsSkeleton';
import EditPostModal from './ui/modals/EditPostModal';

export const PostDetails = ({ title, content, author, onEdit, onDelete, isLoading = false, blogId, userId, token, onUpdateSuccess }) => {
  console.log("PostDetails props - blogId", blogId);
  console.log("PostDetails props - userId from parent", userId);
  console.log("PostDetails props - author", author);
  
  if (isLoading) {
    return <PostDeltailsSkeleton />;
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPostData, setCurrentPostData] = useState({ title, content, author });

  // Fix: Use useEffect instead of useState for updating currentPostData
  useEffect(() => {
    setCurrentPostData({ title, content, author });
  }, [title, content, author]);

  // Check if current user is the author
  const isCurrentUserAuthor = () => {
    if (!userId || !author) return false;
    
    // Handle both cases: author as object with _id or author as string
    const authorId = typeof author === 'object' ? author._id : author;
    
    console.log("Comparing userId:", userId, "with authorId:", authorId);
    return userId.toString() === authorId.toString();
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user can edit before opening modal
    if (!isCurrentUserAuthor()) {
      alert("You can only edit your own blog posts.");
      return;
    }
    
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  }

  const handleUpdateSuccess = (message) => {
    setIsEditModalOpen(false);
    if (onUpdateSuccess) { onUpdateSuccess(message); }
  }

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user can delete before proceeding
    if (!isCurrentUserAuthor()) {
      alert("You can only delete your own blog posts.");
      return;
    }
    
    if (onDelete) onDelete();
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    setTimeout(() => {
      setIsModalLoading(false);
    }, 800);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsModalLoading(false);
  };

  const canUserEdit = isCurrentUserAuthor();

  return (
    <>
      <div className='pt-7 pr-7 pl-7 p-5 bg-[#1a1d23] rounded-lg shadow-lg'>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-[#2A2E36] rounded-lg p-6 hover:border-2 transition-all duration-100"
          onClick={handleCardClick}
        >
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <div className="flex flex-col space-y-2">
              {/* Only show edit button if user is the author */}
              {canUserEdit && (
                <button
                  onClick={handleEditClick}
                  className="p-2 rounded-lg hover:bg-[#3A3E46] transition-all duration-200"
                  aria-label="Edit post"
                  title="Edit post"
                >
                  <Pencil className="h-5 w-5 text-white hover:text-blue-400" />
                </button>
              )}
            </div>
          </div>

          <p className="pt-2 text-gray-300 leading-relaxed whitespace-pre-line line-clamp-3 overflow-hidden text-ellipsis">
            {content}
          </p>

          <div className="flex justify-between items-center mt-2">
            <p className='text-gray-400'>
              Author: {author?.name || 'Unknown'}
            </p>
            {/* Only show delete button if user is the author */}
            {canUserEdit && (
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-lg hover:bg-[#3A3E46] transition-all duration-200"
                aria-label="Delete post"
                title="Delete post"
              >
                <Trash2 className="h-5 w-6 mb-1 text-white hover:text-red-400" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onUpdateSuccess={handleUpdateSuccess}
          title={title}
          content={content}
          blogId={blogId}
          userId={userId}
          token={token}
        />
      )}

      <PostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentPostData.title}
        content={currentPostData.content}
        author={currentPostData.author}
        isLoading={isModalLoading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
};

export default PostDetails;