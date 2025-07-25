import { calculateGenreMatchScore } from './blogUtils.js';

export const calculateBlogScore = (blog, user) => {
  const now = new Date();
  const blogAge = (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);

  const weights = {
    recency: 0.3,
    views: 0.2,
    avgReadTime: 0.2,
    genreMatch: 0.15,
    engagementScore: 0.15
  };

  const recencyScore = Math.exp(-blogAge / 30);
  const viewsScore = Math.min(blog.views / 100, 1);
  const readTimeScore = Math.min(blog.averageReadTime / 300, 1);
  const genreMatchScore = calculateGenreMatchScore(blog, user);

  return (
    recencyScore * weights.recency +
    viewsScore * weights.views +
    readTimeScore * weights.avgReadTime +
    genreMatchScore * weights.genreMatch +
    (blog.engagementScore || 0) * weights.engagementScore
  );
};

export const getRecommendedBlogs = (allBlogs, user, limit = 6) => {
  return allBlogs
    .filter(blog => !blog.isDeleted)
    .map(blog => {
      const score = calculateBlogScore(blog, user);
      return { ...blog, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const calculateUserStats = (userBlogs, lastUpdated) => {
  const userBlogsCount = userBlogs.length;
  const totalViews = userBlogs.reduce((sum, blog) => sum + (Number(blog.views) || 0), 0);
  
  return [
    { title: 'Your Blogs', count: userBlogsCount, subtitle: 'Published posts' },
    { title: 'Total Views', count: totalViews, subtitle: 'Page views' },
    {
      title: 'Last Updated',
      count: lastUpdated || 'Never',
      subtitle: 'Recent activity',
    },
  ];
};