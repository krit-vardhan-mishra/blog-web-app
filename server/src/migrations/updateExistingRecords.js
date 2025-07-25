import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import User from '../models/User.js';

const migrateExistingData = async () => {
  try {
    // Update existing blogs
    await Blog.updateMany(
      {}, // Match all documents
      {
        $set: {
          averageReadTime: 0,
          engagementScore: 0,
          readCount: 0,
          interactionMetrics: {
            timeSpent: [],
            bookmarks: []
          },
          tags: [], // Default empty tags
          readingDifficulty: 'intermediate'
        }
      }
    );

    const blogs = await Blog.find({});
    for (const blog of blogs) {
      const creationDate = new Date(blog.createdAt);
      const now = new Date('2025-07-24T05:08:17Z');
      const ageInDays = (now - creationDate) / (1000 * 60 * 60 * 24);
      
      // Initial engagement score based on views and age
      const baseScore = Math.min(blog.views / 100, 1);
      const timeDecay = Math.exp(-ageInDays / 30); // 30-day decay
      const initialEngagementScore = baseScore * timeDecay;

      await Blog.findByIdAndUpdate(blog._id, {
        engagementScore: initialEngagementScore
      });
    }

    // Update existing users
    await User.updateMany(
      {},
      {
        $set: {
          preferences: {
            favoriteGenres: ['All'], // Default to 'All'
            readingHistory: [],
            topicInterests: [],
            readingLevel: 'intermediate'
          }
        }
      }
    );

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};