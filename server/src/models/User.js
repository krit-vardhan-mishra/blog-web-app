import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
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
      enum: [
        'All',
        'Lifestyle',
        'Business',
        'Entertainment',
        'Science',
        'Art',
        'Sports',
        'Technology',
        'Health',
        'Travel',
        'Food',
        'Education',
        'Love & Relationships',
        'Poetry',
        'Cinema',
        'Film Reviews',
        'Music',
        'Theatre',
        'Photography',
        'Dance',
        'Comics & Graphic Novels',
        'Fiction',
        'Non-Fiction',
        'Short Stories',
        'Book Reviews',
        'Writing Tips',
        'Creative Writing',
        'Culture & Traditions',
        'History',
        'Philosophy',
        'Politics',
        'Feminism',
        'Spirituality',
        'Mindfulness',
        'Minimalism',
        'Motivational',
        'Productivity',
        'Life Lessons',
        'Freelancing',
        'Career Advice',
        'Job Search',
        'Workplace Culture',
        'Remote Work',
        'Startup Life',
        'AI & Machine Learning',
        'Coding & Development',
        'Gadgets & Reviews',
        'Cybersecurity',
        'Blockchain & Crypto',
        'Adventure',
        'Backpacking',
        'Digital Nomad Life',
        'Local Guides',
        'Cultural Exchange',
        'Parenting',
        'Mental Health',
        'Self-Improvement',
        'Personal Journals'
      ]
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
      enum: ['beginner', 'intermediate', 'advanced'],
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