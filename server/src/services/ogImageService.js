import { createCanvas } from 'canvas';

// Canvas dimensions for Open Graph images (1200x630 is the standard)
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// Helper function to wrap text
function wrapText(ctx, text, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine.trim() !== '') {
    lines.push(currentLine.trim());
  }

  return lines;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Generate Open Graph image for a blog post
export async function generateBlogOGImage(blog) {
  try {
    // Create canvas
    const canvas = createCanvas(OG_WIDTH, OG_HEIGHT);
    const ctx = canvas.getContext('2d');

    // Add roundRect method if needed
    addRoundRectIfNeeded(ctx);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, OG_HEIGHT);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.5, '#1a1a3a');
    gradient.addColorStop(1, '#0f0f23');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT);

    // Add subtle pattern/texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * OG_WIDTH;
      const y = Math.random() * OG_HEIGHT;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }

    // Genre badge
    if (blog.genre && blog.genre !== 'All') {
      const badgeX = 60;
      const badgeY = 60;
      const badgeWidth = 120;
      const badgeHeight = 36;
      
      // Badge background
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 18);
      ctx.fill();
      
      // Badge border
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Badge text
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(blog.genre, badgeX + badgeWidth / 2, badgeY + 24);
    }

    // Title
    const title = truncateText(blog.title, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'left';
    
    const titleLines = wrapText(ctx, title, OG_WIDTH - 120, 60);
    const maxTitleLines = 2;
    const displayedTitleLines = titleLines.slice(0, maxTitleLines);
    
    let titleY = 160;
    displayedTitleLines.forEach((line, index) => {
      if (index === maxTitleLines - 1 && titleLines.length > maxTitleLines) {
        // Add ellipsis to last line if truncated
        line = line.replace(/\s+\S*$/, '...');
      }
      ctx.fillText(line, 60, titleY + (index * 60));
    });

    // Content preview
    const content = truncateText(blog.content, 200);
    ctx.fillStyle = '#b0b0b0';
    ctx.font = '24px Arial, sans-serif';
    
    const contentY = titleY + (displayedTitleLines.length * 60) + 40;
    const contentLines = wrapText(ctx, content, OG_WIDTH - 120, 32);
    const maxContentLines = 4;
    const displayedContentLines = contentLines.slice(0, maxContentLines);
    
    displayedContentLines.forEach((line, index) => {
      if (index === maxContentLines - 1 && contentLines.length > maxContentLines) {
        line = line.replace(/\s+\S*$/, '...');
      }
      ctx.fillText(line, 60, contentY + (index * 36));
    });

    // Bottom section with author and metadata
    const bottomY = OG_HEIGHT - 100;
    
    // Author info
    const authorName = blog.author?.name || 'Anonymous';
    ctx.fillStyle = '#1da1f2';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText(`by ${authorName}`, 60, bottomY);

    // Views and date
    ctx.fillStyle = '#8899a6';
    ctx.font = '18px Arial, sans-serif';
    
    const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const views = blog.views || 0;
    const metadata = `${date} • ${views} views`;
    ctx.fillText(metadata, 60, bottomY + 30);

    // Reading difficulty indicator
    if (blog.readingDifficulty) {
      const difficultyColors = {
        'beginner': '#10b981',
        'intermediate': '#f59e0b',
        'advanced': '#ef4444'
      };
      
      const difficultyIcons = {
        'beginner': '📚',
        'intermediate': '🧠',
        'advanced': '🧪'
      };
      
      const difficultyColor = difficultyColors[blog.readingDifficulty] || '#6b7280';
      const difficultyIcon = difficultyIcons[blog.readingDifficulty] || '✨';
      
      ctx.fillStyle = difficultyColor;
      ctx.font = 'bold 18px Arial, sans-serif';
      const difficultyText = `${difficultyIcon} ${blog.readingDifficulty}`;
      ctx.fillText(difficultyText, OG_WIDTH - 200, bottomY);
    }

    // Logo/Branding
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Blog Web App', OG_WIDTH - 60, bottomY + 30);

    // Decorative elements
    // Add some subtle geometric shapes
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.lineWidth = 2;
    
    // Corner decoration
    ctx.beginPath();
    ctx.moveTo(OG_WIDTH - 100, 40);
    ctx.lineTo(OG_WIDTH - 40, 40);
    ctx.lineTo(OG_WIDTH - 40, 100);
    ctx.stroke();

    // Side decoration
    ctx.beginPath();
    ctx.moveTo(30, 200);
    ctx.lineTo(30, 400);
    ctx.stroke();

    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating OG image:', error);
    throw error;
  }
}

// Helper function to add roundRect method if not available
function addRoundRectIfNeeded(ctx) {
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };
  }
}
