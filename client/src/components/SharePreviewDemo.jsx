import React from 'react';
import SharePreview from './SharePreview';

const SharePreviewDemo = () => {
  const sampleBlog = {
    title: "10 Essential Tips for Remote Work Success",
    content: "Working remotely has become the new normal for many professionals. Here are some proven strategies to maintain productivity, work-life balance, and career growth while working from home. These tips will help you create an effective home office setup and establish routines that promote success in a remote work environment."
  };

  const sampleAuthor = {
    name: "Sarah Johnson"
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-8">SharePreview Demo - Social Media Formats</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Default Format */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">Default Format</h2>
          <SharePreview 
            blog={sampleBlog}
            author={sampleAuthor}
            genre="Remote Work"
            size="default"
          />
        </div>

        {/* Instagram/WhatsApp Story Format */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">Story Format (9:16)</h2>
          <SharePreview 
            blog={sampleBlog}
            author={sampleAuthor}
            genre="Lifestyle"
            size="story"
          />
        </div>

        {/* Instagram/Facebook Post Format */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">Post Format (1:1)</h2>
          <SharePreview 
            blog={sampleBlog}
            author={sampleAuthor}
            genre="Business"
            size="post"
          />
        </div>

        {/* Different Genres */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">Dark Theme Example</h2>
          <SharePreview 
            blog={sampleBlog}
            author={sampleAuthor}
            genre="Technology"
            size="default"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">Light Theme Example</h2>
          <SharePreview 
            blog={sampleBlog}
            author={sampleAuthor}
            genre="Art"
            size="default"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">Bright Theme Example</h2>
          <SharePreview 
            blog={sampleBlog}
            author={sampleAuthor}
            genre="Travel"
            size="default"
          />
        </div>
      </div>

      <div className="mt-8 text-gray-400">
        <h3 className="text-lg font-semibold mb-4">Features:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>✅ Improved text contrast with shadows and overlays</li>
          <li>✅ Multiple format sizes for different social platforms</li>
          <li>✅ Auto-adjusting colors based on background brightness</li>
          <li>✅ Backdrop blur effects for better readability</li>
          <li>✅ Responsive text truncation based on format size</li>
        </ul>
      </div>
    </div>
  );
};

export default SharePreviewDemo;
