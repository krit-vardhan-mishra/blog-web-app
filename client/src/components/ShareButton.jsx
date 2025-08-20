import React, { useRef, useState } from 'react';
import { Share2, Instagram, Camera, Loader2 } from 'lucide-react';
import { useShareBlog } from '../hooks/useShareBlog';
import SharePreview from './SharePreview';

const ShareButton = ({ blog, size = 'default', variant = 'default', showPlatformOptions = true }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const sharePreviewRef = useRef(null);
  const { shareBlog, shareToInstagram, shareToSnapchat, isSharing } = useShareBlog();

  const handleShare = async (platform = null) => {
    if (!sharePreviewRef.current) {
      // Show preview first if not visible
      setShowPreview(true);
      setTimeout(() => {
        handleShare(platform);
      }, 100);
      return;
    }

    await shareBlog(sharePreviewRef.current, blog, platform);
    setShowShareOptions(false);
    setShowPreview(false);
  };

  const handleInstagramShare = async () => {
    if (!sharePreviewRef.current) {
      setShowPreview(true);
      setTimeout(() => {
        handleInstagramShare();
      }, 100);
      return;
    }

    await shareToInstagram(sharePreviewRef.current, blog);
    setShowShareOptions(false);
    setShowPreview(false);
  };

  const handleSnapchatShare = async () => {
    if (!sharePreviewRef.current) {
      setShowPreview(true);
      setTimeout(() => {
        handleSnapchatShare();
      }, 100);
      return;
    }

    await shareToSnapchat(sharePreviewRef.current, blog);
    setShowShareOptions(false);
    setShowPreview(false);
  };

  const buttonSizes = {
    small: 'p-1.5',
    default: 'p-2',
    large: 'p-3'
  };

  const iconSizes = {
    small: 14,
    default: 16,
    large: 20
  };

  const variants = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    ghost: 'hover:bg-gray-100 text-gray-600'
  };

  return (
    <>
      <div className="relative">
        {/* Main Share Button */}
        <button
          onClick={() => showPlatformOptions ? setShowShareOptions(!showShareOptions) : handleShare()}
          disabled={isSharing}
          className={`
            ${buttonSizes[size]} ${variants[variant]}
            rounded-full transition-all duration-200 
            flex items-center justify-center
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
          `}
          title="Share this blog post"
        >
          {isSharing ? (
            <Loader2 size={iconSizes[size]} className="animate-spin" />
          ) : (
            <Share2 size={iconSizes[size]} />
          )}
        </button>

        {/* Platform Options Dropdown */}
        {showShareOptions && showPlatformOptions && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[160px]">
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
            >
              <Share2 size={16} className="mr-3" />
              General Share
            </button>
            
            <button
              onClick={handleInstagramShare}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
            >
              <Instagram size={16} className="mr-3 text-pink-500" />
              Instagram Stories
            </button>
            
            <button
              onClick={handleSnapchatShare}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
            >
              <Camera size={16} className="mr-3 text-yellow-500" />
              Snapchat
            </button>
          </div>
        )}
      </div>

      {/* Hidden SharePreview for image generation */}
      {showPreview && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '-9999px', 
            left: '-9999px',
            zIndex: -1,
            visibility: 'hidden'
          }}
        >
          <div ref={sharePreviewRef}>
            <SharePreview blog={blog} size="story" />
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showShareOptions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowShareOptions(false)}
        />
      )}
    </>
  );
};

export default ShareButton;
