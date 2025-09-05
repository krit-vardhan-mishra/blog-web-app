import express from 'express';
import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import { generateBlogOGImage } from '../services/ogImageService.js';
import errorHandler from '../middleware/errorHandler.js';

const router = express.Router();

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Route to serve HTML with Open Graph meta tags for blog sharing
router.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send(generateErrorHTML('Invalid blog ID'));
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false })
      .populate('author', 'name email');

    if (!blog) {
      return res.status(404).send(generateErrorHTML('Blog not found'));
    }

    // Generate HTML with Open Graph meta tags
    const html = generateBlogHTML(blog, req);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Error serving blog share page:', error);
    res.status(500).send(generateErrorHTML('Server error'));
  }
});

// Helper function to generate HTML with Open Graph meta tags
function generateBlogHTML(blog, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const blogUrl = `${baseUrl}/blog/${blog._id}`;
  const shareImageUrl = `${baseUrl}/api/share/blog/${blog._id}/image`;
  
  // Truncate content for description
  const description = blog.content.length > 160 
    ? blog.content.substring(0, 157) + '...'
    : blog.content;

  // Clean text for meta tags (remove HTML if any)
  const cleanTitle = blog.title.replace(/[<>]/g, '');
  const cleanDescription = description.replace(/[<>]/g, '');
  const cleanAuthor = (blog.author?.name || 'Anonymous').replace(/[<>]/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${cleanTitle} - Blog by ${cleanAuthor}</title>
    <meta name="description" content="${cleanDescription}">
    <meta name="author" content="${cleanAuthor}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${cleanTitle}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:url" content="${blogUrl}">
    <meta property="og:image" content="${shareImageUrl}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Blog Web App">
    <meta property="article:author" content="${cleanAuthor}">
    <meta property="article:published_time" content="${blog.createdAt}">
    <meta property="article:section" content="${blog.genre || 'General'}">
    ${blog.tags?.map(tag => `<meta property="article:tag" content="${tag.replace(/[<>]/g, '')}">`).join('\n    ') || ''}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${cleanTitle}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${shareImageUrl}">
    <meta name="twitter:creator" content="@${cleanAuthor.replace(/\s/g, '')}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${blogUrl}">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${cleanTitle}",
        "description": "${cleanDescription}",
        "author": {
            "@type": "Person",
            "name": "${cleanAuthor}"
        },
        "datePublished": "${blog.createdAt}",
        "dateModified": "${blog.updatedAt}",
        "url": "${blogUrl}",
        "image": "${shareImageUrl}",
        "publisher": {
            "@type": "Organization",
            "name": "Blog Web App"
        },
        "genre": "${blog.genre || 'General'}",
        "keywords": "${blog.tags?.join(', ') || ''}"
    }
    </script>
    
    <!-- Redirect to main app after a brief delay -->
    <script>
        setTimeout(() => {
            window.location.href = '${blogUrl}';
        }, 1000);
    </script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #e0e0e0;
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 40px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 {
            color: #ffffff;
            margin-bottom: 16px;
            font-size: 24px;
        }
        p {
            color: #8899a6;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        .author {
            color: #1da1f2;
            font-weight: 500;
        }
        .loading {
            margin-top: 20px;
            color: #1da1f2;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${cleanTitle}</h1>
        <p>by <span class="author">${cleanAuthor}</span></p>
        <p>${cleanDescription}</p>
        <p class="loading">Redirecting to full article...</p>
    </div>
</body>
</html>`;
}

// Helper function to generate error HTML
function generateErrorHTML(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Blog Web App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f23;
            color: #e0e0e0;
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 400px;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 40px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 {
            color: #ff6b6b;
            margin-bottom: 16px;
        }
        p {
            color: #8899a6;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Error</h1>
        <p>${message}</p>
    </div>
</body>
</html>`;
}

// Route to generate Open Graph image for a blog post
router.get('/blog/:id/image', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false })
      .populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Generate the Open Graph image
    const imageBuffer = await generateBlogOGImage(blog);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Content-Length', imageBuffer.length);
    
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error generating OG image:', error);
    res.status(500).json({ message: 'Error generating image' });
  }
});

// Apply error handler middleware
router.use(errorHandler);

export default router;
