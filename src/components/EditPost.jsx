import { useState, useEffect } from "react";
import EditPostSkeleton from '../skeleton/component/EditPostSkeleton';
import { Button } from '../components/ui/Button';
import { updateBlog } from '../api/blogService';

export const EditPost = ({ onUpdateSuccess, isLoading = false, title: initialTitle = "", content: initialContent = "", blogId, userId, token }) => {

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const postEditedBlog = async (e) => {
    e.preventDefault();

    try {
      const response = await updateBlog(userId, blogId, { title, content }, token);

      if (response && (response.success || response.updated)) {
        onUpdateSuccess("Blog Updated Successfully!");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Update failed:", err);
      onUpdateSuccess("Failed to update blog");
    }
  };

  if (isLoading) {
    return <EditPostSkeleton />
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Update Post</h2>
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
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Update
        </Button>
      </form>
    </div>
  );
};

export default EditPost;
