import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Anonymous'
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

UserSchema.methods = {
  canPostBlog() {
    return this.age >= 13;
  },
  toJSON() {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  }
};

UserSchema.statics = {
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

// Add this pre-save hook
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);

export default User;