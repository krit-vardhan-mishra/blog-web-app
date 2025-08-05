import React from 'react';

const LoadingSpinner = ({ size = 'default', color = 'blue' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
    red: 'border-red-500',
    green: 'border-green-500',
    purple: 'border-purple-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          border-4 border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
    </div>
  );
};

export default LoadingSpinner;