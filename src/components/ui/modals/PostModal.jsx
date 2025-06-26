import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostModalSkeleton from '../../../skeleton/component/ui/PostModalSkeleton';

const PostModal = ({ isOpen, onClose, title, content, author, isLoading = false }) => {
    if (!isOpen) return null;
    
    if (isLoading) {
        return <PostModalSkeleton isOpen={isOpen} onClose={onClose} />;
    }

    return (
        <AnimatePresence>
            {isOpen && (
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
                        className="relative w-full max-w-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-[#1C222A] rounded-lg shadow-2xl">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:scale-110 z-10 rounded-full p-2 shadow-md transition-colors duration-200"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="p-8">
                                {/* Title with horizontal line */}
                                <div className="mb-6">
                                    <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
                                    <div className="w-full h-px bg-gray-600"></div>
                                </div>

                                {/* Content with horizontal line */}
                                <div className="mb-6">
                                    <p className="text-gray-300 leading-relaxed text-lg mb-4">{content}</p>
                                    <div className="w-full h-px bg-gray-600"></div>
                                </div>

                                {/* Author */}
                                <div>
                                    <p className="text-gray-400 text-lg">
                                        <span className="font-medium">Author:</span> {author}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PostModal;