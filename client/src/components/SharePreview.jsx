import React from 'react';
import { NotebookPen, Eye } from 'lucide-react';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const SharePreview = ({ blog, className = "", size = "default" }) => {
  const { author, content, title, views, createdAt, genre } = blog;
  const authorName = author?.name || 'Deleted User';

  // Size configurations
  const sizeConfig = {
    default: { width: '320px', height: '569px' },
    story: { width: '360px', height: '640px' },
    post: { width: '400px', height: '400px' }
  };

  const currentSize = sizeConfig[size] || sizeConfig.default;

  const themeColors = {
    background: '#1a1a2e',
    cardBg: '#121212',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#e0e0e0',
    secondaryText: '#8899a6',
    accent: '#8b5cf6',
  };

  const truncatedTitle = truncateText(title || '', size === 'post' ? 60 : 80);
  const truncatedContent = size === 'post' 
    ? truncateText(content || '', 150) 
    : (content || 'No content available for this blog post.');

  return (
    <div
      className={`share-preview-container rounded-xl overflow-hidden shadow-xl relative transition-all duration-300 ease-in-out flex flex-col ${className}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        background: themeColors.cardBg,
        border: `1px solid ${themeColors.border}`,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: themeColors.text,
      }}
    >
      {/* Header section with title */}
      <div 
        className="p-5 pb-3 border-b flex-shrink-0" 
        style={{ 
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBg 
        }}
      >
        {genre && (
          <div className="mb-2">
            <span 
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ 
                backgroundColor: themeColors.accent + '20',
                color: themeColors.accent,
                border: `1px solid ${themeColors.accent}40`
              }}
            >
              {genre}
            </span>
          </div>
        )}
        <h3
          className="font-extrabold text-xl mb-2 leading-tight"
          style={{ 
            color: themeColors.text,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontSize: size === 'post' ? '18px' : '20px'
          }}
        >
          {truncatedTitle}
        </h3>
      </div>

      {/* Main content area */}
      <div className="flex-1 px-5 py-3 relative overflow-hidden">
        <div
          className={`text-sm leading-relaxed h-full overflow-hidden ${size === 'post' ? 'whitespace-pre-wrap' : 'whitespace-pre-wrap'}`}
          style={{
            color: themeColors.text,
            fontSize: size === 'post' ? '12px' : '14px',
            lineHeight: '1.5',
            background: 'transparent',
            ...(size !== 'post' && {
              maskImage: `linear-gradient(to bottom, black 0%, black 70%, transparent 100%)`,
              WebkitMaskImage: `linear-gradient(to bottom, black 0%, black 70%, transparent 100%)`,
            })
          }}
        >
          {size === 'post' ? truncatedContent : content || 'No content available for this blog post.'}
        </div>
      </div>

      {/* Footer section */}
      <div 
        className="px-5 py-3 border-t flex-shrink-0" 
        style={{ 
          borderColor: themeColors.border,
          backgroundColor: themeColors.cardBg
        }}
      >
        <div className="flex justify-between items-center">
          {/* Left Section - Author and Date */}
          <div className="flex-1">
            <p 
              className="flex items-center font-semibold text-sm mb-1" 
              style={{ color: themeColors.text }}
            >
              <NotebookPen size={14} className="mr-2" />
              {authorName}
            </p>
            <p 
              className="text-xs" 
              style={{ color: themeColors.secondaryText }}
            >
              {formatDate(createdAt)}
            </p>
          </div>

          {/* Right Section - Views */}
          <div 
            className="flex items-center" 
            style={{ color: themeColors.secondaryText }}
          >
            <Eye size={16} className="mr-1" />
            <span className="text-xs font-medium">{views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePreview;