import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';

class ShareService {
  /**
   * Convert a DOM element to canvas and return as base64 image
   * @param {HTMLElement} element - The DOM element to capture
   * @param {Object} options - html2canvas options
   * @returns {Promise<string>} - Base64 image data
   */
  async elementToImage(element, options = {}) {
    const defaultOptions = {
      backgroundColor: '#121212',
      scale: 3, // Higher quality for better sharing
      useCORS: true,
      allowTaint: true,
      width: 360,
      height: 640,
      foreignObjectRendering: true,
      removeContainer: true,
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        // Ensure all fonts and styles are properly loaded in the cloned document
        const clonedElement = clonedDoc.querySelector('.share-preview-container');
        if (clonedElement) {
          // Force specific styling to ensure proper rendering
          clonedElement.style.fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
          clonedElement.style.backgroundColor = '#121212';
          clonedElement.style.color = '#e0e0e0';
          
          // Ensure all text elements have proper color
          const textElements = clonedElement.querySelectorAll('*');
          textElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.color === 'rgb(0, 0, 0)' || computedStyle.color === 'black') {
              el.style.color = '#e0e0e0';
            }
          });
        }
      },
      ...options
    };

    try {
      // Wait for fonts to load
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Small delay to ensure element is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, defaultOptions);
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error converting element to image:', error);
      throw new Error('Failed to generate image for sharing');
    }
  }

  /**
   * Save base64 image to device filesystem
   * @param {string} base64Data - Base64 image data
   * @param {string} fileName - File name without extension
   * @returns {Promise<string>} - File URI
   */
  async saveImageToFile(base64Data, fileName = 'blog_share') {
    try {
      // Remove data URL prefix
      const base64Image = base64Data.split(',')[1];
      
      const result = await Filesystem.writeFile({
        path: `${fileName}_${Date.now()}.png`,
        data: base64Image,
        directory: Directory.Cache,
        encoding: Encoding.Base64
      });

      return result.uri;
    } catch (error) {
      console.error('Error saving image to file:', error);
      throw new Error('Failed to save image for sharing');
    }
  }

  /**
   * Share blog post as image to social media apps
   * @param {HTMLElement} previewElement - The SharePreview component element
   * @param {Object} blogData - Blog data for sharing
   * @param {Object} options - Sharing options
   */
  async shareBlogAsImage(previewElement, blogData, options = {}) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web platform
      return this.shareOnWeb(blogData);
    }

    try {
      // Convert SharePreview component to image
      const base64Image = await this.elementToImage(previewElement);
      
      // Save image to temporary file
      const fileUri = await this.saveImageToFile(base64Image, 'blog_share');
      
      // Prepare share data
      const shareData = {
        title: blogData.title || 'Check out this blog post!',
        text: `"${blogData.title}" by ${blogData.author?.name || 'Anonymous'}`,
        files: [fileUri],
        dialogTitle: 'Share Blog Post'
      };

      // Share using Capacitor Share plugin
      await Share.share(shareData);
      
      // Clean up temporary file after sharing
      setTimeout(async () => {
        try {
          await this.cleanupTempFile(fileUri);
        } catch (error) {
          console.warn('Failed to cleanup temp file:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('Error sharing blog as image:', error);
      throw error;
    }
  }

  /**
   * Share specifically to Instagram Stories
   * @param {HTMLElement} previewElement - The SharePreview component element
   * @param {Object} blogData - Blog data for sharing
   */
  async shareToInstagramStories(previewElement, blogData) {
    try {
      // Use story dimensions for Instagram
      const base64Image = await this.elementToImage(previewElement, {
        width: 360,
        height: 640,
        backgroundColor: '#121212'
      });
      
      const fileUri = await this.saveImageToFile(base64Image, 'instagram_story');

      // Instagram Stories specific sharing
      if (Capacitor.getPlatform() === 'android') {
        // Use Android Intent to share directly to Instagram Stories
        await this.shareToInstagramStoriesAndroid(fileUri, blogData);
      } else {
        // Fallback to general sharing
        await this.shareBlogAsImage(previewElement, blogData);
      }
    } catch (error) {
      console.error('Error sharing to Instagram Stories:', error);
      throw error;
    }
  }

  /**
   * Share specifically to Snapchat
   * @param {HTMLElement} previewElement - The SharePreview component element
   * @param {Object} blogData - Blog data for sharing
   */
  async shareToSnapchat(previewElement, blogData) {
    try {
      const base64Image = await this.elementToImage(previewElement);
      const fileUri = await this.saveImageToFile(base64Image, 'snapchat_share');

      // Snapchat specific sharing
      if (Capacitor.getPlatform() === 'android') {
        await this.shareToSnapchatAndroid(fileUri, blogData);
      } else {
        // Fallback to general sharing
        await this.shareBlogAsImage(previewElement, blogData);
      }
    } catch (error) {
      console.error('Error sharing to Snapchat:', error);
      throw error;
    }
  }

  /**
   * Android-specific Instagram Stories sharing
   * @param {string} fileUri - Image file URI
   * @param {Object} blogData - Blog data
   */
  async shareToInstagramStoriesAndroid(fileUri, blogData) {
    // This would require a custom Capacitor plugin for Instagram Stories
    // For now, use general sharing
    const shareData = {
      title: 'Share to Instagram Stories',
      text: `"${blogData.title}" - Check out this blog post!`,
      files: [fileUri],
      dialogTitle: 'Share to Instagram Stories'
    };

    await Share.share(shareData);
  }

  /**
   * Android-specific Snapchat sharing
   * @param {string} fileUri - Image file URI
   * @param {Object} blogData - Blog data
   */
  async shareToSnapchatAndroid(fileUri, blogData) {
    // This would require a custom Capacitor plugin for Snapchat
    // For now, use general sharing
    const shareData = {
      title: 'Share to Snapchat',
      text: `"${blogData.title}" - Check out this blog post!`,
      files: [fileUri],
      dialogTitle: 'Share to Snapchat'
    };

    await Share.share(shareData);
  }

  /**
   * Web platform fallback sharing
   * @param {Object} blogData - Blog data for sharing
   */
  async shareOnWeb(blogData) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blogData.title,
          text: `"${blogData.title}" by ${blogData.author?.name || 'Anonymous'}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Web sharing canceled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard or show share dialog
      this.fallbackShare(blogData);
    }
  }

  /**
   * Fallback sharing method
   * @param {Object} blogData - Blog data
   */
  fallbackShare(blogData) {
    const shareText = `Check out this blog post: "${blogData.title}" by ${blogData.author?.name || 'Anonymous'}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    } else {
      // Create a temporary textarea for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share text copied to clipboard!');
    }
  }

  /**
   * Clean up temporary files
   * @param {string} fileUri - File URI to delete
   */
  async cleanupTempFile(fileUri) {
    try {
      const fileName = fileUri.split('/').pop();
      await Filesystem.deleteFile({
        path: fileName,
        directory: Directory.Cache
      });
    } catch (error) {
      console.warn('Failed to cleanup temp file:', error);
    }
  }

  /**
   * Check if sharing is available
   * @returns {Promise<boolean>}
   */
  async canShare() {
    try {
      return await Share.canShare();
    } catch (error) {
      return false;
    }
  }
}

export const shareService = new ShareService();
export default shareService;
