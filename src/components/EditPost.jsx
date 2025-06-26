import { useState } from "react";
import EditPostSkeleton from '../skeleton/component/EditPostSkeleton';

export const EditPost = ({ onUpdateSuccess, isLoading = false }) => {
  if (isLoading) {
    return <EditPostSkeleton />
  }

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const postEditedBlog = (e) => {
    e.preventDefault();
    console.log("Attempting to update post with:", { title, content });

    if (onUpdateSuccess) {
      onUpdateSuccess("Blog Updated Successfully!");
    }

    setTitle("");
    setContent("");
  };

  return (
    <div className="text-white">
      <h2 className="text-lg font-bold mb-4">Update Post</h2>
      <form onSubmit={postEditedBlog}>
        <div className="mb-4">
          <label className="block mb-2">Enter updated title</label>
          <input
            type="text"
            className="w-full p-2 bg-[#1C222A] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            placeholder="Enter post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Enter updated content</label>
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
          Update
        </button>
      </form>
    </div>
  );
};

export default EditPost;
