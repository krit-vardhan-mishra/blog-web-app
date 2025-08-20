import React, { useState } from 'react';
import ShareButton from '../components/ShareButton';
import ShareModal from '../components/ShareModal';
import SharePreview from '../components/SharePreview';
import PostDetails from '../components/PostDetails';
import PostModal from '../components/ui/modals/PostModal';

const ShareDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Sample blog data for testing
  const sampleBlog = {
    _id: 'demo-blog-1',
    title: 'How to Build Amazing React Applications with Modern Tools and Best Practices',
    content: `React has revolutionized the way we build user interfaces. In this comprehensive guide, we'll explore the latest tools and techniques that can help you create stunning applications.

From state management with Context API to building responsive designs with Tailwind CSS, we'll cover everything you need to know to become a React expert.

Whether you're a beginner or an experienced developer, this guide will provide valuable insights into modern React development patterns and best practices.

Join thousands of developers who have already transformed their development workflow with these proven techniques.`,
    author: {
      _id: 'author-1',
      name: 'Alex Johnson'
    },
    views: 1234,
    createdAt: '2024-01-15T10:30:00Z',
    interactionMetrics: {
      bookmarks: ['user1', 'user2', 'user3']
    }
  };

  const handleOpenPostModal = (blog) => {
    setSelectedBlog(blog);
    setShowPostModal(true);
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedBlog(null);
  };

  const mockToggleBookmark = async () => {
    return {
      success: true,
      isBookmarked: !sampleBlog.interactionMetrics.bookmarks.includes('demo-user'),
      bookmarkCount: sampleBlog.interactionMetrics.bookmarks.length
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Blog Share Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Test the sharing functionality for Instagram Stories and Snapchat
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Share Preview */}
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Share Preview
            </h2>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <SharePreview blog={sampleBlog} />
            </div>

            <div className="text-center text-gray-400 text-sm max-w-md">
              This is how your blog post will appear when shared to Instagram Stories or Snapchat. 
              The preview is optimized for mobile story formats.
            </div>
          </div>

          {/* Right side - Share Controls */}
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Share Options
              </h2>

              <div className="space-y-4">
                {/* Quick share button */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Quick Share</h3>
                    <p className="text-gray-400 text-sm">Share with platform options</p>
                  </div>
                  <ShareButton 
                    blog={sampleBlog} 
                    size="large" 
                    variant="primary"
                    showPlatformOptions={true}
                  />
                </div>

                {/* Modal share button */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Share Modal</h3>
                    <p className="text-gray-400 text-sm">Full sharing experience with preview</p>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                  >
                    Open Share Modal
                  </button>
                </div>

                {/* Instagram specific */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Instagram Stories</h3>
                    <p className="text-gray-400 text-sm">Direct share to Instagram</p>
                  </div>
                  <ShareButton 
                    blog={sampleBlog} 
                    size="large" 
                    variant="ghost"
                    showPlatformOptions={false}
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl">
              <h3 className="text-blue-300 font-semibold mb-3">
                📱 How to Test on Android
              </h3>
              <ul className="text-blue-200 text-sm space-y-2">
                <li>• Build your app: <code className="bg-blue-800/50 px-2 py-1 rounded">npm run build</code></li>
                <li>• Sync to Android: <code className="bg-blue-800/50 px-2 py-1 rounded">npx cap sync android</code></li>
                <li>• Open in Android Studio: <code className="bg-blue-800/50 px-2 py-1 rounded">npx cap open android</code></li>
                <li>• Install and test on device</li>
                <li>• Ensure Instagram and Snapchat are installed</li>
              </ul>
            </div>

            {/* Features */}
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl">
              <h3 className="text-green-300 font-semibold mb-3">
                ✨ Features
              </h3>
              <ul className="text-green-200 text-sm space-y-2">
                <li>• Converts React component to image</li>
                <li>• Optimized for story formats (9:16 ratio)</li>
                <li>• Platform-specific sharing</li>
                <li>• Fallback for web browsers</li>
                <li>• Download option available</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample blog post card */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Sample Blog Post Card
          </h2>
          
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">{sampleBlog.title}</h3>
            <p className="text-gray-300 mb-4">{sampleBlog.content.substring(0, 150)}...</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>By {sampleBlog.author.name}</span>
                <span>•</span>
                <span>{sampleBlog.views} views</span>
              </div>
              
              <ShareButton 
                blog={sampleBlog} 
                size="default" 
                variant="ghost"
                showPlatformOptions={true}
              />
            </div>
          </div>
        </div>

        {/* PostDetails Long Press Demo */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Long Press Demo (Mobile)
          </h2>
          
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 text-center">
              <p className="text-blue-300 text-sm">
                📱 On mobile: <strong>Hold for 3 seconds</strong> to open the post modal
              </p>
              <p className="text-gray-400 text-xs mt-2">
                🖱️ On desktop: Just click to navigate to blog details
              </p>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <PostDetails
              blog={sampleBlog}
              userId="demo-user"
              onOpenModal={handleOpenPostModal}
              onEdit={() => console.log('Edit clicked')}
              onDelete={() => console.log('Delete clicked')}
              onToggleBookmark={mockToggleBookmark}
            />
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        blog={sampleBlog}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Post Modal */}
      {showPostModal && selectedBlog && (
        <PostModal
          blog={selectedBlog}
          isOpen={showPostModal}
          onClose={handleClosePostModal}
          onToggleBookmark={mockToggleBookmark}
        />
      )}
    </div>
  );
};

export default ShareDemo;
