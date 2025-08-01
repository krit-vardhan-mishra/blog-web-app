export const getInitialRecommendations = (allBlogs, user) => {
  const now = new Date('2025-07-24T05:08:17Z');
  
  return allBlogs
    .filter(blog => !blog.isDeleted)
    .map(blog => {
      const ageInDays = (now - new Date(blog.createdAt)) / (1000 * 60 * 60 * 24);
      const viewsWeight = 0.4;
      const recencyWeight = 0.6;

      const viewsScore = Math.min(blog.views / 100, 1);
      const recencyScore = Math.exp(-ageInDays / 30);

      const score = (viewsScore * viewsWeight) + (recencyScore * recencyWeight);

      return { ...blog, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};