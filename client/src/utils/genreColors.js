const getGenreColor = (genre) => {
  const colors = {
    'Adventure': 'green-700',
    'AI & Machine Learning': 'fuchsia-600',
    'All': 'gray-500',
    'Art': 'orange-500',
    'Backpacking': 'amber-600',
    'Blockchain & Crypto': 'yellow-700',
    'Book Reviews': 'lime-500',
    'Business': 'blue-500',
    'Career Advice': 'gray-400',
    'Cinema': 'violet-500',
    'Coding & Development': 'purple-600',
    'Comics & Graphic Novels': 'yellow-600',
    'Creative Writing': 'teal-400',
    'Culture & Traditions': 'orange-400',
    'Cultural Exchange': 'emerald-700',
    'Cybersecurity': 'red-700',
    'Dance': 'red-400',
    'Digital Nomad Life': 'indigo-700',
    'Education': 'teal-500',
    'Entertainment': 'purple-500',
    'Feminism': 'pink-600',
    'Fiction': 'sky-600',
    'Film Reviews': 'purple-400',
    'Food': 'yellow-500',
    'Freelancing': 'blue-300',
    'Gadgets & Reviews': 'orange-600',
    'Health': 'emerald-500',
    'History': 'stone-500',
    'Job Search': 'amber-400',
    'Life Lessons': 'emerald-600',
    'Lifestyle': 'pink-500',
    'Local Guides': 'blue-700',
    'Love & Relationships': 'rose-500',
    'Mental Health': 'rose-400',
    'Mindfulness': 'green-600',
    'Minimalism': 'slate-500',
    'Motivational': 'lime-600',
    'Music': 'pink-400',
    'Non-Fiction': 'blue-600',
    'Parenting': 'pink-300',
    'Personal Journals': 'gray-600',
    'Philosophy': 'neutral-600',
    'Photography': 'amber-500',
    'Poetry': 'fuchsia-500',
    'Politics': 'red-600',
    'Productivity': 'cyan-600',
    'Remote Work': 'cyan-300',
    'Science': 'green-500',
    'Self-Improvement': 'lime-400',
    'Short Stories': 'blue-400',
    'Spirituality': 'indigo-600',
    'Sports': 'red-500',
    'Startup Life': 'teal-300',
    'Technology': 'cyan-500',
    'Theatre': 'indigo-400',
    'Travel': 'indigo-500',
    'Writing Tips': 'green-400',
    'Workplace Culture': 'zinc-500'
  };

  return colors[genre] || 'gray-600';
};

const getColorValue = (tailwindColor) => {
  const colorMap = {
    'green-700': '#15803d',
    'fuchsia-600': '#c026d3',
    'gray-500': '#6b7280',
    'orange-500': '#f97316',
    'amber-600': '#d97706',
    'yellow-700': '#a16207',
    'lime-500': '#84cc16',
    'blue-500': '#3b82f6',
    'gray-400': '#9ca3af',
    'violet-500': '#8b5cf6',
    'purple-600': '#9333ea',
    'yellow-600': '#ca8a04',
    'teal-400': '#2dd4bf',
    'orange-400': '#fb923c',
    'emerald-700': '#047857',
    'red-700': '#b91c1c',
    'red-400': '#f87171',
    'indigo-700': '#4338ca',
    'teal-500': '#14b8a6',
    'purple-500': '#a855f7',
    'pink-600': '#db2777',
    'sky-600': '#0284c7',
    'purple-400': '#c084fc',
    'yellow-500': '#eab308',
    'blue-300': '#93c5fd',
    'orange-600': '#ea580c',
    'emerald-500': '#10b981',
    'stone-500': '#78716c',
    'amber-400': '#fbbf24',
    'emerald-600': '#059669',
    'pink-500': '#ec4899',
    'blue-700': '#1d4ed8',
    'rose-500': '#f43f5e',
    'rose-400': '#fb7185',
    'green-600': '#16a34a',
    'slate-500': '#64748b',
    'lime-600': '#65a30d',
    'pink-400': '#f472b6',
    'blue-600': '#2563eb',
    'pink-300': '#f9a8d4',
    'gray-600': '#4b5563',
    'neutral-600': '#525252',
    'amber-500': '#f59e0b',
    'fuchsia-500': '#d946ef',
    'red-600': '#dc2626',
    'cyan-600': '#0891b2',
    'cyan-300': '#67e8f9',
    'green-500': '#22c55e',
    'lime-400': '#a3e635',
    'blue-400': '#60a5fa',
    'indigo-600': '#4f46e5',
    'red-500': '#ef4444',
    'teal-300': '#5eead4',
    'cyan-500': '#06b6d4',
    'indigo-400': '#818cf8',
    'indigo-500': '#6366f1',
    'green-400': '#4ade80',
    'zinc-500': '#71717a'
  };
  return colorMap[tailwindColor] || '#4b5563';
};

// Calculate luminance to determine if a color is light or dark
const getLuminance = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Get contrast colors based on background
const getContrastColors = (backgroundColor) => {
  const luminance = getLuminance(backgroundColor);
  const isDark = luminance < 0.5;
  
  return {
    text: isDark ? '#ffffff' : '#000000',
    secondaryText: isDark ? '#e5e5e5' : '#333333',
    accent: isDark ? '#ffffff' : '#000000',
    border: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
  };
};

// Truncate text with ellipsis
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export default getGenreColor;
export { getColorValue, getContrastColors, truncateText };