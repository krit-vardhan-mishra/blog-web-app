// backend/models/models.js

// Define the Blog class
class Blog {
  constructor(id, title, content, author) {
    this.id = id || 0;
    this.title = title || '';
    this.content = content || '';
    this.author = author || '';
    this.userId = null; // Add userId to blog for easier filtering
  }

  getTitle() {
    return this.title;
  }

  setTitle(title) {
    this.title = title;
  }

  updateTitle(newTitle) {
    if (newTitle && newTitle.trim() !== '') {
      this.title = newTitle;
      return true;
    }
    return false;
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }

  updateContent(newContent) {
    if (newContent && newContent.trim() !== '') {
      this.content = newContent;
      return true;
    }
    return false;
  }

  getAuthor() {
    return this.author;
  }

  setAuthor(author) {
    this.author = author;
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      author: this.author,
      userId: this.userId // Include userId in JSON representation
    };
  }
}

// Define the User class
class User {
  constructor(name, age) {
    this.id = null;
    this.name = name || 'Anonymous';
    this.age = age || 0;
    this.blogs = []; // Stores Blog objects
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getAge() {
    return this.age;
  }

  setAge(age) {
    this.age = age;
  }

  getBlogsCount() {
    return this.blogs.length;
  }

  getAllBlogs() {
    return this.blogs;
  }

  getBlogById(id) {
    return this.blogs.find(blog => blog.getId() === id) || null;
  }

  deleteBlogById(id) {
    const index = this.blogs.findIndex(blog => blog.getId() === id);
    if (index !== -1) {
      this.blogs.splice(index, 1);
      return true;
    }
    return false;
  }

  canPostBlog() {
    return this.age >= 13;
  }

  createBlog(title, content, blogId) {
    const newBlog = new Blog(blogId, title, content, this.name);
    newBlog.setUserId(this.id); // Associate blog with user's ID
    this.blogs.push(newBlog);
    return newBlog.getId();
  }

  editBlog(id) {
    return this.getBlogById(id);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      blogs: this.blogs.map(blog => blog.toJSON())
    };
  }
}

// Define the BlogApp class
class BlogApp {
  constructor() {
    this.users = [];
    this.blogIdCounter = 0;
    this.userIdCounter = 0;
  }

  createUser(name, age) {
    const newUser = new User(name, age);
    newUser.id = ++this.userIdCounter;
    this.users.push(newUser);
    return newUser;
  }

  getUserById(userId) {
    return this.users.find(user => user.id === userId) || null;
  }

  getUserByName(name) {
    return this.users.find(user => user.name === name) || null;
  }

  getAllUsers() {
    return this.users;
  }

  createBlogForUser(userId, title, content) {
    const user = this.getUserById(userId);
    if (user && user.canPostBlog()) {
      // Ensure blogIdCounter is always higher than any existing blog ID loaded from JSON
      this.blogIdCounter = Math.max(this.blogIdCounter, ...this.getAllBlogs().map(blog => blog.id || 0), 0);
      return user.createBlog(title, content, ++this.blogIdCounter);
    }
    return null;
  }

  getAllBlogs() {
    const allBlogs = [];
    this.users.forEach(user => {
      allBlogs.push(...user.getAllBlogs());
    });
    return allBlogs;
  }

  getBlogById(blogId) {
    for (const user of this.users) {
      const blog = user.getBlogById(blogId);
      if (blog) return blog;
    }
    return null;
  }

  getUsersWithBlogs() {
    return this.users.filter(user => user.getBlogsCount() > 0);
  }

  getUsersWithoutBlogs() {
    return this.users.filter(user => user.getBlogsCount() === 0);
  }

  // Method to set the current highest IDs after loading from JSON
  setCounters(maxUserId, maxBlogId) {
    this.userIdCounter = maxUserId;
    this.blogIdCounter = maxBlogId;
  }
}

// Export all classes for use in other modules
export {
  Blog,
  User,
  BlogApp
};
