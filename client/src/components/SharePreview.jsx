import React from 'react';
import { NotebookPen } from 'lucide-react';
import { getColorValue, getContrastColors, truncateText } from '../utils/genreColors';
import '../css/share-preview.css';

const SharePreview = ({ 
  blog, 
  author, 
  genre,
  className = "",
  size = "default" // default, story, post
}) => {
  const backgroundColor = getColorValue(genre);
  const colors = getContrastColors(backgroundColor);
  const isDarkBackground = colors.text === '#ffffff';
  
  // Responsive sizing for different social media formats
  const sizeClasses = {
    default: "w-[350px] h-[180px]",
    story: "w-[180px] h-[320px]", // 9:16 ratio for stories
    post: "w-[320px] h-[320px]"   // 1:1 ratio for posts
  };
  
  const maxTitleLength = size === 'story' ? 35 : 55;
  const maxContentLength = size === 'story' ? 80 : 130;
  const maxAuthorLength = 28;
  
  const truncatedTitle = truncateText(blog?.title || '', maxTitleLength);
  const truncatedContent = truncateText(blog?.content || '', maxContentLength);
  const truncatedAuthor = truncateText(author?.name || 'Unknown Author', maxAuthorLength);

  return (
    <div 
      className={`share-preview-container ${isDarkBackground ? 'dark-bg' : 'light-bg'} border-2 rounded-xl ${sizeClasses[size]} p-4 relative ${className}`}
      style={{ 
        backgroundColor,
        borderColor: colors.border,
        color: colors.text,
        // Add text shadow for better readability
        textShadow: isDarkBackground 
          ? '0 1px 3px rgba(0, 0, 0, 0.8)' 
          : '0 1px 3px rgba(255, 255, 255, 0.8)'
      }}
    >
      {/* Background overlay for better text readability */}
      <div 
        className="absolute inset-0 rounded-xl"
        style={{
          background: isDarkBackground 
            ? 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)'
        }}
      />
      
      <div className="relative z-10">
        <div className="share-preview-icon">
          <NotebookPen 
            size={20} 
            style={{ 
              color: colors.accent,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
            }}
          />
        </div>
        
        {/* Content container */}
        <div className={`share-preview-content ${size === 'story' ? 'pr-2' : 'pr-8'}`}>
          {/* Title */}
          <h4 
            className={`share-preview-title font-bold ${size === 'story' ? 'text-base' : 'text-lg'}`}
            style={{ 
              color: colors.text,
              textShadow: isDarkBackground 
                ? '0 2px 4px rgba(0, 0, 0, 0.8)' 
                : '0 2px 4px rgba(255, 255, 255, 0.8)'
            }}
          >
            {truncatedTitle}
          </h4>
          
          {/* Content */}
          <p 
            className={`share-preview-text ${size === 'story' ? 'text-xs' : 'text-sm'} mt-2`}
            style={{ 
              color: colors.secondaryText,
              textShadow: isDarkBackground 
                ? '0 1px 3px rgba(0, 0, 0, 0.7)' 
                : '0 1px 3px rgba(255, 255, 255, 0.7)'
            }}
          >
            {truncatedContent}
          </p>
          
          {/* Author at bottom */}
          <div 
            className={`share-preview-author ${size === 'story' ? 'text-xs' : 'text-xs'} absolute bottom-4 left-4 right-4`}
            style={{ 
              color: colors.accent,
              borderColor: colors.border,
              textShadow: isDarkBackground 
                ? '0 1px 2px rgba(0, 0, 0, 0.8)' 
                : '0 1px 2px rgba(255, 255, 255, 0.8)',
              background: isDarkBackground 
                ? 'rgba(0, 0, 0, 0.2)' 
                : 'rgba(255, 255, 255, 0.2)',
              padding: '4px 8px',
              borderRadius: '6px',
              backdropFilter: 'blur(4px)'
            }}
          >
            by {truncatedAuthor}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePreview;