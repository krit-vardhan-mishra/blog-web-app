import { motion } from 'framer-motion';

const PermanentDeleteDialogSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-[#1C222A] p-6 rounded-lg shadow-lg w-full max-w-sm relative animate-pulse"
      >
        {/* Close button skeleton */}
        <div className="absolute top-2 right-2">
          <div className="h-5 w-5 m-5 bg-gray-600 rounded"></div>
        </div>

        {/* Title skeleton */}
        <div className="mb-4">
          <div className="h-6 bg-gray-600 rounded w-4/5 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>

        {/* Button container skeleton */}
        <div className="flex justify-end space-x-2">
          {/* Cancel button skeleton */}
          <div className="bg-gray-600 h-10 w-20 rounded-lg"></div>
          
          {/* Delete button skeleton */}
          <div className="bg-red-500 h-10 w-20 rounded-lg"></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PermanentDeleteDialogSkeleton;