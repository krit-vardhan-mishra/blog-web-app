export const getScrollDepth = () => {
  const doc = document.documentElement;
  const winHeight = window.innerHeight;
  const docHeight = doc.scrollHeight;
  const scrollTop = (window.pageYOffset || doc.scrollTop);
  const trackLength = docHeight - winHeight;
  return Math.floor((scrollTop/trackLength) * 100);
};