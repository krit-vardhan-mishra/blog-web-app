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

const SharePreview = ({ blog, size = "default" }) => {
  const { author, content, title, views, createdAt, genre } = blog;
  const authorName = author?.name || 'Deleted User';

  const sizeConfig = {
    default: { width: '320px', height: '569px' },
    story: { width: '360px', height: '640px' },
    post: { width: '400px', height: '400px' }
  };

  const currentSize = sizeConfig[size] || sizeConfig.default;
  const truncatedTitle = truncateText(title || '', size === 'post' ? 60 : 80);
  const truncatedContent = size === 'post' 
    ? truncateText(content || '', 150) 
    : (content || 'No content available for this blog post.');

  return (
    <div
      className="share-preview-container"
      style={{
        width: currentSize.width,
        height: currentSize.height,
        backgroundColor: '#121212',
        border: '2px solid rgba(139, 92, 246, 0.5)',
        borderRadius: '16px',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
      }}
    >
      {/* Header */}
      <div 
        style={{ 
          padding: '20px 20px 12px 20px',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          backgroundColor: '#121212',
          color: '#e0e0e0',
          flexShrink: 0,
        }}
      >
        {genre && (
          <div style={{ marginBottom: '8px' }}>
            <span 
              style={{ 
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '20px',
                fontWeight: '500',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#8b5cf6',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'inline-block',
              }}
            >
              {genre}
            </span>
          </div>
        )}
        <h3
          style={{ 
            color: '#e0e0e0',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: size === 'post' ? '18px' : '20px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            lineHeight: '1.3',
          }}
        >
          {truncatedTitle}
        </h3>
      </div>

      {/* Content */}
      <div 
        style={{
          flex: 1,
          padding: '12px 20px',
          backgroundColor: '#121212',
          color: '#e0e0e0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            color: '#e0e0e0',
            fontSize: size === 'post' ? '12px' : '14px',
            lineHeight: '1.5',
            backgroundColor: 'transparent',
            height: '100%',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            ...(size !== 'post' && {
              maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
            })
          }}
        >
          {size === 'post' ? truncatedContent : content || 'No content available for this blog post.'}
        </div>
      </div>

      {/* Footer */}
      <div 
        style={{ 
          padding: '12px 20px',
          borderTop: '1px solid rgba(139, 92, 246, 0.3)',
          backgroundColor: '#121212',
          color: '#e0e0e0',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontWeight: '600', 
                fontSize: '14px', 
                margin: '0 0 4px 0',
                color: '#e0e0e0',
              }}
            >
              <NotebookPen size={14} style={{ marginRight: '8px' }} />
              {authorName}
            </p>
            <p 
              style={{ 
                fontSize: '12px',
                color: '#8899a6',
                margin: 0,
              }}
            >
              {formatDate(createdAt)}
            </p>
          </div>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#8899a6',
            }}
          >
            <Eye size={16} style={{ marginRight: '4px' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>{views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePreview;
