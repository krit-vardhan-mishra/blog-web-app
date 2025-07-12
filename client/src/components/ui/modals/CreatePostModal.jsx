import { X } from 'lucide-react';
import CreatePost from '../../CreatePost';
import ModalWrapper from './ModalWrapper';

const CreatePostModal = ({ isOpen, onClose, onPostSuccess }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X className="h-5 w-5 m-5 text-red-700 hover:text-red-500" />
      </button>
      <CreatePost onPostSuccess={onPostSuccess} />
    </ModalWrapper>
  );
};

export default CreatePostModal;
