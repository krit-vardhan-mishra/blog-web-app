import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { GENRES, READING_LEVELS } from '../constants/enums.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  age: {
    type: Number,
    default: 1,
    min: [13, 'You must be at least 13 years old'],
    max: [120, 'Please enter a valid age']
  },
  about: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isAccountVerified: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  blockExpires: {
    type: Date,
    default: null,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    favoriteGenres: [{
      type: String,
      enum: GENRES,
    }],
    readingHistory: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      },
      timeSpent: Number,
      lastRead: Date
    }],
    topicInterests: [String],
    readingLevel: {
      type: String,
      enum: READING_LEVELS,
      default: 'intermediate'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.loginAttempts;
      delete ret.blockExpires;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

userSchema.index({ email: 1, isEmailVerified: 1 });

userSchema.virtual('blogs', {
  ref: 'Blog',
  localField: '_id',
  foreignField: 'author',
  justOne: false
});

userSchema.methods = {
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  canPostBlog() {
    return this.age >= 13;
  },

  isAccountLocked() {
    return this.blockExpires && this.blockExpires > Date.now();
  }
};

userSchema.statics = {
  async getUsersWithBlogs() {
    return this.find().populate('blogs').exec();
  },

  async getUsersWithoutBlogs() {
    return this.aggregate([
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'author',
          as: 'blogs'
        }
      },
      {
        $match: {
          blogs: { $size: 0 }
        }
      }
    ]);
  }
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  if (this.isModified('loginAttempts')) {
    this.lastLogin = new Date();
  }

  next();
});

const User = mongoose.model('User', userSchema);
export default User;