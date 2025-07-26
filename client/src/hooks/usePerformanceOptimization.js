import { useMemo, useCallback } from 'react';

export const usePerformanceOptimizations = ({
  allBlogs = [],
  user,
  lastUpdated,
  searchQuery,
  allUsers = []
}) => {

  const userBlogs = useMemo(() =>
    allBlogs.filter((blog) => blog.author?._id === user?.id),
    [allBlogs, user?.id]
  );

  const stats = useMemo(() => {
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
  }, [userBlogs, lastUpdated]);

  const performSearch = useCallback((query) => {
    if (!query || !query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();

    const matchingBlogs = allBlogs.filter(blog =>
      blog.title.toLowerCase().includes(searchTerm) ||
      blog.content.toLowerCase().includes(searchTerm) ||
      (blog.author?.name || '').toLowerCase().includes(searchTerm)
    );

    const matchingUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm)
    );

    return [
      ...matchingBlogs.map(blog => ({ ...blog, type: 'blog' })),
      ...matchingUsers.map(user => ({ ...user, type: 'user' }))
    ];
  }, [allBlogs, allUsers]);

  const activeBlogs = useMemo(() =>
    allBlogs.filter(blog => !blog.isDeleted),
    [allBlogs]
  );

  const displayedUserName = useMemo(() =>
    user?.name ? user.name.split(' ')[0] + '...' : 'Guest',
    [user?.name]
  );

  const debounceUpdate = useCallback((updateFn, delay = 300) => {
    const timeoutId = setTimeout(updateFn, delay);
    return () => clearTimeout(timeoutId);
  }, []);

  return {
    userBlogs,
    stats,
    performSearch,
    activeBlogs,
    displayedUserName,
    debounceUpdate,
  };
};