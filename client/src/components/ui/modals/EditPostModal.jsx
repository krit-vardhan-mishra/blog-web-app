import { X } from 'lucide-react';
import EditPost from '../../EditPost';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const EditPostModal = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  blog,
  blogId,
  userId,
  token,
}) => {
  const {title, content, genre, tags, readingDifficulty} = blog || {};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-7xl max-h-[95vh] mx-4 my-4 bg-[#1A1C20] rounded-lg shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-full p-2 transition-all duration-200"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable content */}
        <SimpleBar style={{ maxHeight: '95vh' }} className="flex-1">
          <EditPost
            onUpdateSuccess={onUpdateSuccess}
            title={title}
            content={content}
            genre={genre}
            tags={tags}
            readingDifficulty={readingDifficulty}
            blogId={blogId}
            userId={userId}
            token={token}
          />
      </SimpleBar>
    </div>

    </div >
  );
};

export default EditPostModal;