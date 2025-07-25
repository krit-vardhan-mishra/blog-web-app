export const calculateEngagementScore = (blog) => {
  if (!blog) return 0;

  const {
    views = 0,
    readCount = 0,
    averageReadTime = 0,
    interactionMetrics = { timeSpent: [], bookmarks: [] },
    createdAt
  } = blog;

  const weights = {
    views: 0.2,         
    readCount: 0.25,  
    readTime: 0.20,     
    bookmarks: 0.15,  
    recency: 0.10,     
    retention: 0.10      
  };

  const normalizedViews = Math.min(views / 1000, 1) * 100;

  const readCompletionRate = views > 0 ? (readCount / views) * 100 : 0;

  const normalizedReadTime = Math.min(averageReadTime / 300, 1) * 100;

  const bookmarkCount = interactionMetrics.bookmarks?.length || 0;
  const bookmarkRate = views > 0 ? (bookmarkCount / views) * 100 : 0;
  const normalizedBookmarks = Math.min(bookmarkRate * 10, 100);

  const daysSinceCreation = createdAt 
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 365;
  const recencyScore = Math.max(100 - (daysSinceCreation * 2), 0); 

  const timeSpentArray = interactionMetrics.timeSpent || [];
  const significantReads = timeSpentArray.filter(metric => metric.duration > 60).length;
  const retentionRate = views > 0 ? (significantReads / views) * 100 : 0;
  const normalizedRetention = Math.min(retentionRate * 5, 100); 

  const engagementScore = 
    (normalizedViews * weights.views) +
    (readCompletionRate * weights.readCount) +
    (normalizedReadTime * weights.readTime) +
    (normalizedBookmarks * weights.bookmarks) +
    (recencyScore * weights.recency) +
    (normalizedRetention * weights.retention);

  return Math.round(Math.min(engagementScore, 100));
};

export const getEngagementLevel = (score) => {
  if (score >= 80) {
    return {
      level: 'Excellent',
      color: 'text-green-400 bg-green-900/30',
      icon: '🔥',
      description: 'Highly engaging content with great reader interaction'
    };
  } else if (score >= 60) {
    return {
      level: 'Good',
      color: 'text-blue-400 bg-blue-900/30',
      icon: '👍',
      description: 'Well-performing content with solid engagement'
    };
  } else if (score >= 40) {
    return {
      level: 'Average',
      color: 'text-yellow-400 bg-yellow-900/30',
      icon: '📈',
      description: 'Moderate engagement with room for improvement'
    };
  } else if (score >= 20) {
    return {
      level: 'Below Average',
      color: 'text-orange-400 bg-orange-900/30',
      icon: '📉',
      description: 'Low engagement, consider improving content strategy'
    };
  } else {
    return {
      level: 'Poor',
      color: 'text-red-400 bg-red-900/30',
      icon: '❌',
      description: 'Very low engagement, needs significant improvement'
    };
  }
};

export const calculateReadingProgress = (scrollTop, scrollHeight, clientHeight) => {
  if (scrollHeight <= clientHeight) return 100;
  const maxScroll = scrollHeight - clientHeight;
  return Math.round((scrollTop / maxScroll) * 100);
};

export const estimateReadingTime = (content, wordsPerMinute = 200) => {
  if (!content) return 0;
  
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.trim().split(/\s+/).length;
  
  const readingTimeMinutes = wordCount / wordsPerMinute;
  return Math.max(Math.round(readingTimeMinutes * 60), 30);
};

export const getTrendingBlogs = (blogs, limit = 5) => {
  if (!Array.isArray(blogs)) return [];

  return blogs
    .map(blog => ({
      ...blog,
      engagementScore: calculateEngagementScore(blog)
    }))
    .sort((a, b) => {
      if (b.engagementScore !== a.engagementScore) {
        return b.engagementScore - a.engagementScore;
      }
      return (b.views || 0) - (a.views || 0);
    })
    .slice(0, limit);
};

export const calculateBlogStats = (blogs) => {
  if (!Array.isArray(blogs) || blogs.length === 0) {
    return {
      totalBlogs: 0,
      totalViews: 0,
      totalReads: 0,
      averageEngagement: 0,
      totalBookmarks: 0,
      averageReadTime: 0
    };
  }

  const totalBlogs = blogs.length;
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const totalReads = blogs.reduce((sum, blog) => sum + (blog.readCount || 0), 0);
  const totalBookmarks = blogs.reduce((sum, blog) => 
    sum + (blog.interactionMetrics?.bookmarks?.length || 0), 0);
  
  const engagementScores = blogs.map(blog => calculateEngagementScore(blog));
  const averageEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / totalBlogs;
  
  const readTimes = blogs.map(blog => blog.averageReadTime || 0).filter(time => time > 0);
  const averageReadTime = readTimes.length > 0 
    ? readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length 
    : 0;

  return {
    totalBlogs,
    totalViews,
    totalReads,
    averageEngagement: Math.round(averageEngagement),
    totalBookmarks,
    averageReadTime: Math.round(averageReadTime)
  };
};