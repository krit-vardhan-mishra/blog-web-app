import Blog from '../models/Blog.js';
import User from '../models/User.js';

export async function getBlogByIdWithAuthor(blogId) {
  return await Blog.findOne({ _id: blogId }).populate('author');
}

export async function getDeletedBlogsByUser(userId) {
  const blogs = await Blog.find({ author: userId, isDeleted: true }).populate('author');
  return blogs;
}

export async function createBlog(reqBody) {
  const { userId, title, content } = reqBody;

  if (!userId || !title || !content) {
    return { success: false, message: "User ID, title, and content are required." };
  }

  const blogId = User.createBlogForUser(userId, title, content);

  if (!blogId) {
    return { success: false, message: "Blog could not be created. User may not exist or is not eligible." };
  }

  return { success: true, blogId };
}

export async function getAllBlogs() {
  return app.getAllBlogs();
}

export async function getBlogById(blogId) {
  const blog = User.getBlogById(blogId);
  if (!blog) {
    return { success: false, message: "Blog not found." };
  }
  return { success: true, blog };
}

export async function deleteBlog(userId, blogId) {
  const user = app.getUserById(userId);
  if (!user) return { success: false, message: "User not found." };

  const success = user.deleteBlogById(blogId);
  if (!success) return { success: false, message: "Blog not found or could not be deleted." };

  return { success: true, message: "Blog deleted successfully." };
}

export async function updateBlog(blogId, newTitle, newContent) {
  const blog = app.getBlogById(blogId);
  if (!blog) {
    return { success: false, message: "Blog not found." };
  }

  let updated = false;
  if (newTitle) {
    updated = blog.updateTitle(newTitle) || updated;
  }
  if (newContent) {
    updated = blog.updateContent(newContent) || updated;
  }

  if (updated) {
    return { success: true, message: "Blog updated successfully.", blog };
  } else {
    return { success: false, message: "No changes provided or update failed." };
  }
}

export async function getNonDeletedBlogs(req, res) {
  try {
    const blogs = await Blog.find({ isDeleted: false }).populate('author', 'name').sort({ createdAt: -1 });
    res.status(200).json({ blogs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export async function getAllDeletedBlogsByUser(req, res) {
  try {
    const userId = req.user.id;
    const deletedBlogs = await getDeletedBlogsByUser(userId);
    res.status(200).json({ blogs: deletedBlogs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export async function safeDeleteBlog(req, res) {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await getBlogById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Call softDeleteBlog instead of permanently deleting
    const success = await softDeleteBlog(blogId);
    if (success) {
      res.json({ message: "Blog moved to trash successfully" });
    } else {
      res.status(404).json({ message: "Blog not found or could not be moved to trash" });
    }
  } catch (error) {
    console.error("Soft delete blog error:", error);
    res.status(500).json({ message: error.message });
  }
};

export async function permanentlyDeleteBlog(req, res) {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await getBlogById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const success = await permanentlyDeleteBlog(blogId);
    if (success) {
      res.json({ message: "Blog permanently deleted successfully" });
    } else {
      res.status(404).json({ message: "Blog not found or could not be permanently deleted" });
    }
  } catch (error) {
    console.error("Permanent delete blog error:", error);
    res.status(500).json({ message: error.message });
  }
};

export async function restoreDeletedBlog(req, res) {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await getBlogById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const success = await restoreBlog(blogId);
    if (success) {
      res.json({ message: "Blog restored successfully" });
    } else {
      res.status(404).json({ message: "Blog not found or could not be restored" });
    }
  } catch (error) {
    console.error("Restore blog error:", error);
    res.status(500).json({ message: error.message });
  }
};

export async function incrementBlogView(req, res) {
  try {
    const { id } = req.params;
    const blog = await BlogService.incrementBlogView(id); // Call the service method
    res.status(200).json({ message: 'View incremented successfully', blog });
  } catch (error) {
    console.error("Error incrementing blog view:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};