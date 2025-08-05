import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const mediaQuery = window.matchMedia(query);
  const [matches, setMatches] = useState(mediaQuery.matches);

  useEffect(() => {
    const handler = () => setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};
