import React, { useRef, useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import SharePreview from './SharePreview';

const ShareButton = ({ blog, size = 'default', variant = 'default' }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const sharePreviewRef = useRef(null);

  const handleShare = async () => {
    if (!blog) return;

    setIsSharing(true);
    
    try {
      const webAppUrl = `${window.location.origin}/blog/${blog._id}`;

      if (Capacitor.isNativePlatform()) {
        // Show preview temporarily for image generation
        setShowPreview(true);
        
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (sharePreviewRef.current) {
          // Generate image for mobile sharing
          const canvas = await html2canvas(sharePreviewRef.current, {
            backgroundColor: '#121212',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 320,
            height: 569,
            foreignObjectRendering: false,
            onclone: (clonedDoc) => {
              const clonedContainer = clonedDoc.querySelector('.share-preview-container');
              if (clonedContainer) {
                clonedContainer.style.backgroundColor = '#121212';
                clonedContainer.style.color = '#e0e0e0';
                clonedContainer.style.fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
                
                const allElements = clonedContainer.querySelectorAll('*');
                allElements.forEach(el => {
                  el.style.color = '#e0e0e0';
                  el.style.fontFamily = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
                });
              }
            }
          });

          // Convert to base64 and save
          const base64Data = canvas.toDataURL('image/png', 1.0);
          const base64Image = base64Data.split(',')[1];
          
          const fileName = `blog_share_${Date.now()}.png`;
          const result = await Filesystem.writeFile({
            path: fileName,
            data: base64Image,
            directory: Directory.Cache,
            encoding: Encoding.Base64
          });

          // Share with image and regular URL
          await Share.share({
            title: blog.title || 'Check out this blog post!',
            text: `"${blog.title}" by ${blog.author?.name || 'Anonymous'}`,
            url: webAppUrl,
            files: [result.uri],
            dialogTitle: 'Share Blog Post'
          });

          // Clean up file after a delay
          setTimeout(async () => {
            try {
              await Filesystem.deleteFile({
                path: fileName,
                directory: Directory.Cache
              });
            } catch (error) {
              console.warn('Failed to cleanup temp file:', error);
            }
          }, 5000);
        }
      } else {
        // Web fallback
        if (navigator.share) {
          await navigator.share({
            title: blog.title,
            text: `"${blog.title}" by ${blog.author?.name || 'Anonymous'}`,
            url: webAppUrl
          });
        } else {
          // Copy to clipboard fallback with regular URL
          const shareText = `Check out this blog post: "${blog.title}" by ${blog.author?.name || 'Anonymous'} - ${webAppUrl}`;
          await navigator.clipboard.writeText(shareText);
          alert('Link copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      if (error.message && !error.message.includes('canceled')) {
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
      setShowPreview(false);
    }
  };

  const buttonSizes = {
    small: 'p-1.5',
    default: 'p-2',
    large: 'p-3',
    fixed: 'h-10 w-10 p-2'
  };

  const iconSizes = {
    small: 14,
    default: 16,
    large: 20,
    fixed: 18
  };

  const variants = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    ghost: 'bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white',
    dark: 'bg-gray-700 hover:bg-gray-600 text-white'
  };

  return (
    <>
      {/* Hidden SharePreview for image generation */}
      {showPreview && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '-9999px', 
            left: '-9999px',
            zIndex: -1
          }}
        >
          <div ref={sharePreviewRef}>
            <SharePreview blog={blog} />
          </div>
        </div>
      )}

      {/* Simple Share Button */}
      <button
        onClick={handleShare}
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
    </>
  );
};

export default ShareButton;
