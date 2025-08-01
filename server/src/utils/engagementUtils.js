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