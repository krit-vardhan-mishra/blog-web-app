import React, { useRef, useEffect } from 'react';
import { X, Instagram, Camera, Share2, Download } from 'lucide-react';
import { useShareBlog } from '../hooks/useShareBlog';
import SharePreview from './SharePreview';

const ShareModal = ({ blog, isOpen, onClose }) => {
  const sharePreviewRef = useRef(null);
  const modalRef = useRef(null);
  const { shareBlog, shareToInstagram, shareToSnapchat, isSharing } = useShareBlog();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleShare = async (platform = null) => {
    if (sharePreviewRef.current) {
      await shareBlog(sharePreviewRef.current, blog, platform);
      onClose();
    }
  };

  const handleInstagramShare = async () => {
    if (sharePreviewRef.current) {
      await shareToInstagram(sharePreviewRef.current, blog);
      onClose();
    }
  };

  const handleSnapchatShare = async () => {
    if (sharePreviewRef.current) {
      await shareToSnapchat(sharePreviewRef.current, blog);
      onClose();
    }
  };

  const handleDownloadImage = async () => {
    if (sharePreviewRef.current) {
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(sharePreviewRef.current, {
          backgroundColor: '#1a1a2e',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 320,
          height: 569,
        });
        
        const link = document.createElement('a');
        link.download = `${blog.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'blog_post'}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Share Blog Post</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 flex justify-center bg-gray-50">
          <div ref={sharePreviewRef} className="transform scale-75 origin-center">
            <SharePreview blog={blog} />
          </div>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            Choose how you'd like to share this blog post:
          </div>

          {/* Instagram Stories */}
          <button
            onClick={handleInstagramShare}
            disabled={isSharing}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center">
              <Instagram size={20} className="mr-3" />
              <span className="font-medium">Instagram Stories</span>
            </div>
            <span className="text-xs opacity-80">Story</span>
          </button>

          {/* Snapchat */}
          <button
            onClick={handleSnapchatShare}
            disabled={isSharing}
            className="w-full flex items-center justify-between p-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center">
              <Camera size={20} className="mr-3" />
              <span className="font-medium">Snapchat</span>
            </div>
            <span className="text-xs opacity-70">Snap</span>
          </button>

          {/* General Share */}
          <button
            onClick={() => handleShare()}
            disabled={isSharing}
            className="w-full flex items-center justify-between p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center">
              <Share2 size={20} className="mr-3" />
              <span className="font-medium">More Options</span>
            </div>
            <span className="text-xs opacity-80">Share</span>
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownloadImage}
            disabled={isSharing}
            className="w-full flex items-center justify-between p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
          >
            <div className="flex items-center">
              <Download size={20} className="mr-3" />
              <span className="font-medium">Download Image</span>
            </div>
            <span className="text-xs opacity-80">Save</span>
          </button>
        </div>

        {/* Loading State */}
        {isSharing && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Preparing to share...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
