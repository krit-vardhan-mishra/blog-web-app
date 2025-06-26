// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Required for __dirname with ES Modules

// Import controllers and models
import { setApp, getAllUsers, getUserById, createUser, app as userControllerAppInstance } from './controllers/userController.js'; // Add .js extension
import { getAllBlogs, getBlogById, createBlog, deleteBlog } from './controllers/blogController.js'; // Add .js extension
import { BlogApp, User, Blog } from './models/models.js'; // Add .js extension

// __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies

/**
 * Initializes the BlogApp instance by loading data from JSON files.
 * This populates the in-memory database of the application.
 */
const initializeBlogApp = () => {
    // Determine the data directory path
    const dataDirPath = path.join(__dirname, 'data');
    const usersPath = path.join(dataDirPath, 'users.json');
    const blogsPath = path.join(dataDirPath, 'blogs.json');

    // Ensure data directory exists
    if (!fs.existsSync(dataDirPath)) {
        fs.mkdirSync(dataDirPath);
    }
    // Create empty JSON files if they don't exist
    if (!fs.existsSync(usersPath)) {
        fs.writeFileSync(usersPath, '[]', 'utf8');
    }
    if (!fs.existsSync(blogsPath)) {
        fs.writeFileSync(blogsPath, '[]', 'utf8');
    }

    // Read users data and blogs data from JSON files
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const blogsData = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));

    // Create a new BlogApp instance
    const blogAppInstance = new BlogApp();

    let maxUserId = 0;
    // Populate users into the BlogApp
    usersData.forEach(userData => {
        const user = blogAppInstance.createUser(userData.name, userData.age);
        user.id = userData.id; // Assign existing ID to maintain consistency
        if (userData.id > maxUserId) {
            maxUserId = userData.id;
        }
    });
    blogAppInstance.userIdCounter = maxUserId; // Set the counter to the max existing ID

    let maxBlogId = 0;
    // Populate blogs into the corresponding users in BlogApp
    blogsData.forEach(blogData => {
        const user = blogAppInstance.getUserById(blogData.userId);
        if (user) {
            // Manually create blog object and add to user's blogs to preserve original ID and data
            const newBlog = new Blog(blogData.id, blogData.title, blogData.content, blogData.author);
            newBlog.setUserId(blogData.userId); // Ensure userId is set
            user.blogs.push(newBlog);
            if (blogData.id > maxBlogId) {
                maxBlogId = blogData.id;
            }
        } else {
            console.warn(`Blog ID ${blogData.id} has no matching user (ID: ${blogData.userId}). Skipping.`);
        }
    });
    blogAppInstance.blogIdCounter = maxBlogId; // Set the counter to the max existing ID

    // Set the initialized BlogApp instance in the userController
    // This allows both userController and blogController to use the same, populated instance.
    setApp(blogAppInstance);

    console.log("BlogApp initialized with data.");
    console.log(`Loaded ${blogAppInstance.getAllUsers().length} users and ${blogAppInstance.getAllBlogs().length} blogs.`);
};

// Call the initialization function when the server starts
initializeBlogApp();


// --- API Routes ---

// User routes
// GET all users
app.get('/api/users', (req, res) => {
    res.json(getAllUsers().map(user => user.toJSON()));
});

// GET user by ID
app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const result = getUserById(userId);
    if (result.success) {
        res.json(result.user.toJSON());
    } else {
        res.status(404).json({ message: result.message });
    }
});

// POST (Create) a new user
app.post('/api/users', (req, res) => {
    const result = createUser(req.body);
    if (result.success) {
        res.status(201).json(result.user.toJSON());
    } else {
        res.status(400).json({ message: result.message });
    }
});


// Blog routes
// GET all blogs
app.get('/api/blogs', (req, res) => {
    res.json(getAllBlogs().map(blog => blog.toJSON()));
});

// GET blog by ID
app.get('/api/blogs/:id', (req, res) => {
    const blogId = parseInt(req.params.id);
    const result = getBlogById(blogId);
    if (result.success) {
        res.json(result.blog.toJSON());
    } else {
        res.status(404).json({ message: result.message });
    }
});

// POST (Create) a new blog
app.post('/api/blogs', (req, res) => {
    const result = createBlog(req.body);
    if (result.success) {
        res.status(201).json({ message: "Blog created successfully", blogId: result.blogId });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// DELETE a blog
// Requires both userId (to find the user who owns it) and blogId
app.delete('/api/blogs/:userId/:blogId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const blogId = parseInt(req.params.blogId);
    const result = deleteBlog(userId, blogId);
    if (result.success) {
        res.json({ message: result.message });
    } else {
        res.status(400).json({ message: result.message });
    }
});

// PUT (Update) a blog
// Requires userId (to find the user and their blog) and blogId
app.put('/api/blogs/:userId/:blogId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const blogId = parseInt(req.params.blogId);
    const { title, content } = req.body; // Data to update

    const user = userControllerAppInstance.getUserById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    const blog = user.getBlogById(blogId);
    if (!blog) {
        return res.status(404).json({ message: "Blog not found." });
    }

    let updated = false;
    if (title !== undefined && title !== null) { // Check for explicit undefined/null to allow empty string updates
        updated = blog.updateTitle(title) || updated;
    }
    if (content !== undefined && content !== null) { // Check for explicit undefined/null
        updated = blog.updateContent(content) || updated;
    }

    if (updated) {
        res.json({ message: "Blog updated successfully", blog: blog.toJSON() });
    } else {
        res.status(400).json({ message: "No valid data provided for update or update failed." });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
