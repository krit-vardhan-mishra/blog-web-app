import { useState } from "react";
import { CreatePostSkeleton } from "../skeleton/component/CreatePostSkeleton";
import useAuth from "../hooks/useAuth";

export const CreatePost = ({ onPostSuccess, isLoading = false }) => {
  const { user, token } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  const postBlog = async (e) => {
    e.preventDefault();
    setError(null);
    console.log("User:", user, "Token:", token);
    console.log("Attempting to create post with:", { title, content, authorId: user?.id });

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create blog');
      }

      if (onPostSuccess) {
        onPostSuccess("Blog Uploaded Successfully!");
      }
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error creating blog:", err.message);
      setError(err.message);
    }
  };


  if (isLoading) {
    return <CreatePostSkeleton />
  }

  return (
    <div className="text-white">
      <h2 className="text-lg font-bold mb-4">Create New Post</h2>
      {error && (<p className="text-red-500 mb-4">{error}</p>)}
      <form onSubmit={postBlog}>
        <div className="mb-4">
          <label className="block mb-2">Title</label>
          <input
            type="text"
            className="w-full p-2 bg-[#1C222A] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            placeholder="Enter post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Content</label>
          <textarea
            rows={4}
            className="w-full p-2 bg-[#1C222A] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
            placeholder="Write your content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
