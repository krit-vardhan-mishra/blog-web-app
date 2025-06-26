const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }], // Array of blog IDs
});

module.exports = mongoose.model('User', userSchema);
