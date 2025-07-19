export function parseEmojisEnhanced(text) {
  if (typeof window !== 'undefined' && window.twemoji) {
    return window.twemoji.parse(text, {
      folder: 'svg',
      ext: '.svg',
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/',
      className: 'twemoji-enhanced',
      attributes: () => ({
        style: 'height: 1.2em; width: 1.2em; margin: 0 0.05em 0 0.1em; vertical-align: -0.1em; display: inline-block;'
      })
    });
  }
  return text;
}