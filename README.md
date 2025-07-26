# Blog Web App

A full-featured blogging platform for writing, sharing, and discovering blogs across a wide variety of genres and topics. Supports user authentication, content creation, bookmarking, recommendations, and engagement analytics.

---

## Features

- **User Authentication**: Sign up, log in, and manage your profile.
- **Create & Edit Blogs**: Write, edit, and delete your own blog posts.
- **Rich Blog Content**: Blogs support tags, genres, difficulty levels, and more.
- **Discover Blogs**: Search and filter blogs by genre, tags, difficulty, and author.
- **Bookmarking**: Save your favorite blogs for easy access.
- **Recommendations**: Personalized blog recommendations using engagement and recency metrics.
- **Engagement Metrics**: Track views, read time, bookmarks, and overall engagement.
- **Responsive UI**: Optimized for both desktop and mobile devices.
- **Share Blogs**: Share blog posts via native sharing (on supported devices) or copy link.
- **Soft Delete & Restore**: Option to recover deleted blogs.

---

## Technology Stack

- **Frontend**
  - React (with hooks and context)
  - React Router
  - Tailwind CSS for styling
  - SimpleBar for custom scrollbars
  - Framer Motion for animations

- **Backend**
  - Node.js & Express.js
  - MongoDB (Mongoose ODM)
  - RESTful API design

- **Other**
  - JWT for authentication
  - Lucide Icons
  - Emoji parsing utilities

---

## Blog Genres

A sample of supported genres:
- Lifestyle, Business, Entertainment, Science, Art, Sports, Technology, Health, Travel, Food, Education, Love & Relationships, Poetry, Cinema, Film Reviews, Music, Theatre, Photography, Dance, Comics & Graphic Novels, Fiction, Non-Fiction, Short Stories, Book Reviews, Writing Tips, Creative Writing, Culture & Traditions, History, Philosophy, Politics, Feminism, Spirituality, Mindfulness, Minimalism, Motivational, Productivity, Life Lessons, Freelancing, Career Advice, Job Search, Workplace Culture, Remote Work, Startup Life, AI & Machine Learning, Coding & Development, Gadgets & Reviews, Cybersecurity, Blockchain & Crypto, Adventure, Backpacking, Digital Nomad Life, Local Guides, Cultural Exchange, Parenting, Mental Health, Self-Improvement, Personal Journals

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas cluster)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/krit-vardhan-mishra/blog-web-app.git
   cd blog-web-app
   ```

2. **Install dependencies:**
   ```sh
   # For server
   cd server
   npm install

   # For client
   cd ../client
   npm install
   ```

3. **Configure Environment Variables:**

   - Copy `.env.example` to `.env` in both `server/` and `client/` directories and fill in the required values (e.g. MongoDB URI, JWT secret, API URLs).

4. **Run the app:**

   - Start backend server:
     ```sh
     cd server
     npm run dev
     ```

   - Start frontend app:
     ```sh
     cd ../client
     npm run dev
     ```

   - Visit `http://localhost:5173` (or as indicated in the terminal) to use the app.

---

## Usage

- **Sign Up / Log In**: Register a new account or log in using your credentials.
- **Create Blog**: Use the "New Blog" button to compose and publish your writing.
- **Browse & Search**: Explore blogs by genre, tags, or search keywords.
- **Bookmark**: Click the bookmark icon to save favorite blogs.
- **Edit/Delete**: Edit or delete your own blogs from your profile.
- **Share**: Use the share button to copy or share a blog's link.

---

## Contribution Guidelines

1. **Fork the repository** and create your branch:
   ```sh
   git checkout -b feature/your-feature
   ```
2. **Commit and push** your changes.
3. **Open a Pull Request** describing your changes.

Please follow the existing code style and add relevant tests where possible.

---

## 📁 Project Structure
> *Note: For a more detailed structure, please refer to the files and folders in the repository.*

```
blog-web-app/
├── client/
│   ├── public/
│   |   └── notebook-icon.svg 
│   ├── src/
│   │   ├── api/
│   │   │   ├── apiService.js
│   │   │   ├── authService.js
│   │   │   ├── blogService.js
│   │   │   └── userService.js
|   |   |
│   │   ├── components/
|   |   |   ├──ui
|   |   |   |  ├── modals
|   |   |   |  |   └── ...
|   |   |   |  └── ...
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ...
|   |   |
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ...
|   |   |
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── BlogContext.jsx
│   │   │   └── GoogleAuthHandler.jsx
|   |   |
│   │   ├── css/
│   │   │   └── ...
|   |   |
│   │   ├── hooks/
│   │   │   └── ...
|   |   |
│   │   ├── lib/
│   │   │   └── utils.js
|   |   |
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignPage.jsx
│   │   │   └── ...
|   |   |
│   │   ├── routes/
│   │   │   ├── AppRoute.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── PublicRoute.jsx
|   |   |
│   │   ├── skeleton/
│   │   │   └── ...
|   |   |
│   │   ├── utils/
│   │   │   └── ...
|   |   |
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── ...
|   | 
│   ├── index.html
|   | 
│   └──  package.json
|
├── server/
|   ├──src/
|   |    ├── config/
│   │    |     ├── db.js
│   │    |     └── passport.js
|   |    |     
│   |    ├── controllers/
│   │    |   ├── authController.js
│   │    |   ├── blogController.js
│   │    |   ├── otpController.js
│   │    |   └── userController.js
│   │    |   
│   |    ├── middleware/
│   │    |   ├── authenticateToken.js
│   │    |   ├── initMiddleware.js
│   │    |   └── rateLimiter.js
│   │    |   
│   |    ├── models/
│   |    │   ├── Blog.js
│   │    |   ├── OTP.js
│   │    |   └── User.js 
│   │    |   
│   |    ├── routes/
│   |    │   ├── authRoutes.js
│   |    │   ├── blogsRoutes.js
│   |    │   ├── otpRoutes.js
│   |    │   └── usersRoutes.js
│   │    |   
│   |    ├── utils/
│   |    │   ├── engagementUtils.js
│   |    │   └── sendOTPEmail.js
│   |    └── server.js
│   │    
│   ├── .env
│   └── package.json
│   
└──  README.md

```

## License

This project is open-source. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- React, Express, MongoDB, Mongoose, Tailwind CSS, Lucide Icons, and all open-source libraries used.

---

## Contact

For questions or feedback, open an issue or contact [krit-vardhan-mishra](https://github.com/krit-vardhan-mishra).