import mongoose from 'mongoose';
import { GENRES, READING_LEVELS } from '../constants/enums.js';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    genre: {
      type: String,
      enum: GENRES,
      default: 'All',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    averageReadTime: {
      type: Number,
      default: 0,
    },
    engagementScore: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    interactionMetrics: {
      timeSpent: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: false
        },
        duration: Number,
        lastRead: Date
      }],
      bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    tags: [String],
    readingDifficulty: {
      type: String,
      enum: READING_LEVELS,
      default: 'intermediate'
    }
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

BlogSchema.methods = {
  updateTitle(newTitle) {
    if (newTitle && newTitle.trim() !== '') {
      this.title = newTitle;
      return this.save();
    }
    return false;
  },

  updateContent(newContent) {
    if (newContent && newContent.trim() !== '') {
      this.content = newContent;
      return this.save();
    }
    return false;
  },

  updateGenre(newGenre) {
    if (newGenre && GENRES.includes(newGenre)) {
      this.genre = newGenre;
      return this.save();
    }
    return false;
  },

  softDelete() {
    this.isDeleted = true;
    return this.save();
  },

  restore() {
    this.isDeleted = false;
    return this.save();
  },

  toJSON() {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
};

BlogSchema.plugin(mongooseAggregatePaginate);
const Blog = mongoose.model('Blog', BlogSchema);

export default Blog;