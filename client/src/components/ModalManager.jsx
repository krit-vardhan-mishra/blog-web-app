import React from 'react';
import CreatePostModal from './ui/modals/CreatePostModal.jsx';
import EditPostModal from './ui/modals/EditPostModal.jsx';
import QuickStatsModal from './ui/modals/QuickStatsModal.jsx';
import SingleStatModal from './ui/modals/SingleStatModal.jsx';
import PostModal from './ui/modals/PostModal.jsx';
import ConfirmDeleteModal from './ui/ConfirmDeleteModal.jsx';

const ModalManager = ({
  // Create Post Modal
  isCreatePostOpen,
  onCloseCreatePost,
  onPostCreationSuccess,

  // Edit Post Modal  
  isEditPostOpen,
  onCloseEditPost,
  onPostUpdateSuccess,
  blogToEdit,
  user,
  token,

  // Stats Modals
  isAllStatsOpen,
  onCloseAllStats,
  stats,
  onStatClick,
  isStatModalOpen,
  onCloseStatModal,
  selectedStat,

  // Post Modal
  isPostModalOpen,
  onClosePostModal,
  selectedBlogForModal,
  onEdit,
  onDelete,
  onViewIncrement,
  onToggleBookmark,

  // Confirm Delete Modal
  isConfirmOpen,
  onCloseConfirm,
  onCancelConfirm,
  selectedBlogId,
  onConfirmDelete,
}) => {
  return (
    <>
      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={onCloseCreatePost}
        onPostSuccess={onPostCreationSuccess}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditPostOpen}
        onClose={onCloseEditPost}
        onUpdateSuccess={onPostUpdateSuccess}
        title={blogToEdit?.title || ''}
        content={blogToEdit?.content || ''}
        blogId={blogToEdit?.id || blogToEdit?._id}
        userId={user?.id}
        blog={blogToEdit}
        genre={blogToEdit?.genre || 'All'}
        tags={blogToEdit?.tags || []}
        readingDifficulty={blogToEdit?.readingDifficulty || 'intermediate'}
        token={token}
      />

      {/* Stats Modals */}
      <QuickStatsModal
        isOpen={isAllStatsOpen}
        onClose={onCloseAllStats}
        stats={stats}
        onStatClick={onStatClick}
      />

      <SingleStatModal
        isOpen={isStatModalOpen}
        onClose={onCloseStatModal}
        stat={selectedStat}
      />

      {/* Post Modal */}
      {selectedBlogForModal && (
        <PostModal
          isOpen={isPostModalOpen}
          onClose={onClosePostModal}
          blog={selectedBlogForModal}
          userId={user?.id}
          token={token}
          onEdit={() => onEdit(selectedBlogForModal)}
          onDelete={() => {
            const blogId = selectedBlogForModal.id || selectedBlogForModal._id;
            onDelete(blogId);
            onClosePostModal();
          }}
          onViewIncrement={onViewIncrement}
          onToggleBookmark={onToggleBookmark}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={onCloseConfirm}
        onCancel={onCancelConfirm}
        content={'Are you sure you want to delete this post?'}
        onConfirm={async () => {
          try {
            onCloseConfirm();
            await onConfirmDelete(selectedBlogId);
          } catch (error) {
            console.error('Failed to delete blog:', error);
          }
        }}
      />
    </>
  );
};

export default ModalManager;