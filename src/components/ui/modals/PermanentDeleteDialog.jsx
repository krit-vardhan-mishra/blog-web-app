import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../../ui/Button";
import PermanentDeleteDialogSkeleton from '../../../skeleton/component/ui/PermanentDeleteDialogSkeleton';

const PermanentDeleteDialog = ({ isOpen, isLoading, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {isLoading ? (
            <PermanentDeleteDialogSkeleton />
          ) : (
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
                className="bg-[#1C222A] p-6 rounded-lg shadow-lg w-full max-w-sm relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2"
                >
                  <X className="h-5 w-5 m-5 text-red-700 hover:text-red-500" />
                </button>
                <h2 className="text-white text-lg font-bold mb-4">
                  Do you want to delete this blog permanently?
                </h2>
                <form onSubmit={onConfirm}>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={onClose}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-700 hover:bg-red-500 text-white py-2 px-4 rounded-lg"
                    >
                      Delete
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default PermanentDeleteDialog;
