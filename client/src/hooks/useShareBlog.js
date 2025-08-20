import { useState } from 'react';
import { shareService } from '../services/shareService';
import { toast } from 'react-toastify';

export const useShareBlog = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(null);

  /**
   * Share blog post as image
   * @param {HTMLElement} previewElement - SharePreview component element
   * @param {Object} blogData - Blog data
   * @param {string} platform - Specific platform (optional)
   */
  const shareBlog = async (previewElement, blogData, platform = null) => {
    if (!previewElement) {
      const error = 'Preview element not found';
      setShareError(error);
      toast.error(error);
      return;
    }

    setIsSharing(true);
    setShareError(null);

    try {
      switch (platform) {
        case 'instagram':
          await shareService.shareToInstagramStories(previewElement, blogData);
          toast.success('Shared to Instagram Stories!');
          break;
        case 'snapchat':
          await shareService.shareToSnapchat(previewElement, blogData);
          toast.success('Shared to Snapchat!');
          break;
        default:
          await shareService.shareBlogAsImage(previewElement, blogData);
          toast.success('Blog shared successfully!');
          break;
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to share blog';
      setShareError(errorMessage);
      toast.error(errorMessage);
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Share to Instagram Stories specifically
   */
  const shareToInstagram = async (previewElement, blogData) => {
    await shareBlog(previewElement, blogData, 'instagram');
  };

  /**
   * Share to Snapchat specifically
   */
  const shareToSnapchat = async (previewElement, blogData) => {
    await shareBlog(previewElement, blogData, 'snapchat');
  };

  /**
   * Check if sharing is available
   */
  const checkShareAvailability = async () => {
    try {
      return await shareService.canShare();
    } catch (error) {
      return false;
    }
  };

  return {
    shareBlog,
    shareToInstagram,
    shareToSnapchat,
    isSharing,
    shareError,
    checkShareAvailability
  };
};
