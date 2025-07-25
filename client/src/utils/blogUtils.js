export const calculateGenreMatchScore = (blog, user) => {
  if (!blog || !user?.preferences?.favoriteGenres) {
    return 0;
  }

  // If user hasn't set any preferences, return neutral score
  if (user.preferences.favoriteGenres.length === 0) {
    return 0.5;
  }

  // If the blog's genre is in user's favorites, return 1
  if (user.preferences.favoriteGenres.includes(blog.genre)) {
    return 1;
  }

  // If blog genre is 'All', return moderate score
  if (blog.genre === 'All') {
    return 0.7;
  }

  // Otherwise return low score
  return 0.3;
};