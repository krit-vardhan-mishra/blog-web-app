import { useState, useEffect } from "react";
import EditPostSkeleton from '../skeleton/component/EditPostSkeleton';
import { Button } from '../components/ui/Button';
import blogService from '../api/blogService';

export const EditPost = ({ onUpdateSuccess, isLoading = false, title: initialTitle = "", content: initialContent = "", blogId, userId, token }) => {

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);

  console.log("EditPost props - userId:", userId);
  console.log("EditPost props - blogId:", blogId);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);

    const checkOwnership = async () => {
      if (!blogId || !userId || !token) {
        console.log("Missing required props:", { blogId, userId: !!userId, token: !!token });
        setIsCheckingOwnership(false);
        return;
      }

      try {
        setIsCheckingOwnership(true);
        const blog = await blogService.fetchById(blogId);
        console.log("EditPost - Blog data:", blog);
        console.log("EditPost - Blog author:", blog.author);
        console.log("EditPost - Current user ID:", userId);
        
        let authorId;
        if (typeof blog.author === 'object' && blog.author._id) {
          authorId = blog.author._id;
        } else if (typeof blog.author === 'string') {
          authorId = blog.author;
        } else {
          console.error("Invalid author format:", blog.author);
          onUpdateSuccess("Error: Invalid blog author data");
          return;
        }

        console.log("EditPost - Final comparison:", {
          authorId: authorId.toString(),
          userId: userId.toString(),
          match: authorId.toString() === userId.toString()
        });
        
        // Compare as strings to ensure proper comparison
        if (authorId.toString() === userId.toString()) {
          console.log("EditPost - User is authorized to edit");
          setIsAuthor(true);
        } else {
          console.log("EditPost - User is NOT authorized to edit");
          setIsAuthor(false);
          onUpdateSuccess("You can only edit your own blogs");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        onUpdateSuccess("Error checking blog ownership");
      } finally {
        setIsCheckingOwnership(false);
      }
    };
    
    checkOwnership();
  }, [initialTitle, initialContent, blogId, userId, token, onUpdateSuccess]);

  const postEditedBlog = async (e) => {
    e.preventDefault();

    if (!isAuthor) {
      onUpdateSuccess("You are not authorized to edit this blog");
      return;
    }

    console.log("EditPost - Submitting update:", { blogId, userId, token: !!token });
    if (!blogId) {
      console.error("blogId is undefined");
      onUpdateSuccess("Failed to update blog: Blog ID is missing");
      return;
    }

    if (!title.trim() || !content.trim()) {
      onUpdateSuccess("Title and content are required");
      return;
    }

    try {
      const response = await blogService.update(blogId, { title: title.trim(), content: content.trim() });

      console.log("EditPost - Update response:", response);
      console.log("EditPost - Response type:", typeof response);
      console.log("EditPost - Response keys:", response ? Object.keys(response) : 'null');

      if (response) {
        if (response.success === true || 
            response.updated === true || 
            response.status === 'success' ||
            response.message?.toLowerCase().includes('success') ||
            response.message?.toLowerCase().includes('updated') ||
            (response.status >= 200 && response.status < 300) ||
            (response.title && response.content)) {
          onUpdateSuccess("Blog Updated Successfully!");
        } else {
          console.warn("EditPost - Unexpected response format:", response);
          onUpdateSuccess("Blog Updated Successfully!"); 
        }
      } else {
        throw new Error("No response received from server");
      }
    } catch (err) {
      console.error("Update failed:", err);
      console.error("Error details:", {
        message: err.message,
        statusCode: err.statusCode,
        status: err.status,
        response: err.response
      });
      
      if (err.statusCode === 403 || err.status === 403) {
        onUpdateSuccess("You are not authorized to edit this blog");
      } else if (err.statusCode === 401 || err.status === 401) {
        onUpdateSuccess("Your session has expired. Please log in again.");
      } else if (err.statusCode === 404 || err.status === 404) {
        onUpdateSuccess("Blog not found");
      } else if (err.statusCode === 400 || err.status === 400) {
        onUpdateSuccess("Invalid blog data provided");
      } else {
        onUpdateSuccess(err.message || "Update may have failed - please refresh to check");
      }
    }
  };

  if (isLoading || isCheckingOwnership) {
    return <EditPostSkeleton />
  }

  if (!isAuthor) {
    return (
      <div className="text-white text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
        <p className="text-gray-300">You can only edit your own blog posts.</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>Debug Info:</p>
          <p>User ID: {userId}</p>
          <p>Blog ID: {blogId}</p>
        </div>
      </div>
    );
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
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Enter updated content</label>
          <textarea
            rows={4}
            className="w-full p-2 bg-[#1C222A] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          disabled={!title.trim() || !content.trim()}
        >
          Update
        </Button>
      </form>
    </div>
  );
};

export default EditPost;