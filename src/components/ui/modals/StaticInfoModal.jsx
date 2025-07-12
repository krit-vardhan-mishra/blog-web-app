import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CardBox from '../CardBox';

const contentMap = {
  about: {
    title: "About Us",
    content: "BlogSphere is your platform to share, learn, and grow in the world of technology.",
  },
  contact: {
    title: "Contact",
    content: "Reach us at contact@blogsphere.dev or via our socials listed below.",
  },
  privacy: {
    title: "Privacy Policy",
    content: "We respect your privacy and ensure your data is protected and never misused.",
  },
  terms: {
    title: "Terms of Service",
    content: "By using BlogSphere, you agree to our terms outlined here for your safety and ours.",
  },
};

const StaticInfoModal = ({ activeCard, onClose }) => {
  if (!activeCard) return null;

  const { title, content } = contentMap[activeCard];

  return (
    <AnimatePresence>
      {activeCard && (
        <motion.div
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
            className="relative w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button 
                onClick={onClose} 
                className="absolute top-2 right-2 text-red-600 hover:text-red-400 z-10"
              >
                <X className="h-5 w-5 m-2" />
              </button>
              <CardBox title={title} content={content} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StaticInfoModal;