import { X } from 'lucide-react';
import EditPost from '../../EditPost';
import ModalWrapper from './ModelWrapper';

const EditPostModal = ({ isOpen, onClose, onUpdateSuccess }) => {
  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-red-500 hover:text-white"
      >
        <X className="h-5 w-5 m-5" />
      </button>
      <EditPost onUpdateSuccess={onUpdateSuccess} />
    </ModalWrapper>
  );
};

export default EditPostModal;
