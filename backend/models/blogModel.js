import { Schema, model } from 'mongoose';

const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String }, // Will store the user's name
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }, // Add a timestamp
});

export default model('Blog', blogSchema);
