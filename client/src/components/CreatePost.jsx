import { useEffect, useState } from 'react';
import { CreatePostSkeleton } from '../skeleton/component/CreatePostSkeleton';
import useAuth from '../hooks/useAuth';
import blogService from '../api/blogService';
import GenreSelector from './GenreSelector';

export const CreatePost = ({ onPostSuccess, isLoading = false }) => {
  const { user, token } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('All');
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const postBlog = async (e) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    if (!genre) {
      setError("Please select a genre.");
      setIsCreating(false);
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      setIsCreating(false);
      return;
    }

    try {
      const response = await blogService.create({
        title,
        content,
        genre,
        tags: [],
        readingDifficulty: 'intermediate'
      });

      if (response) {
        if (onPostSuccess) {
          onPostSuccess('Blog Uploaded Successfully!');
        }

        setTitle('');
        setContent('');
        setGenre('All');
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error creating blog:', err.message);
      setError(err.message || 'Failed to create blog. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <CreatePostSkeleton />;
  }

  return (
    <div className="text-white">
      <h2 className="text-lg font-bold mb-4">Create New Post</h2>

      {error && (
        <div
          id="post-error"
          className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-lg mb-4"
        >
          {error}
        </div>
      )}

      <form onSubmit={postBlog}>
        <div className="mb-4">
          <label htmlFor="post-title" className="block mb-2 font-medium">
            Title
          </label>
          <input
            id="post-title"
            name="title"
            type="text"
            className="w-full p-2 bg-[#1C222A] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby={error ? 'post-error' : undefined}
            disabled={isCreating}
          />
        </div>

        {/* Add Genre Selector */}
        <GenreSelector
          selectedGenre={genre}
          onGenreChange={setGenre}
        />

        <div className="mb-4">
          <label htmlFor="post-content" className="block mb-2 font-medium">
            Content
          </label>
          <textarea
            id="post-content"
            name="content"
            rows={4}
            className="w-full p-2 bg-[#1C222A] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-describedby={error ? 'post-error' : undefined}
            disabled={isCreating}
          />
        </div>

        <button
          type="submit"
          disabled={isCreating || !title.trim() || !content.trim()}
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          aria-label="Submit post"
        >
          {isCreating ? 'Creating...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;