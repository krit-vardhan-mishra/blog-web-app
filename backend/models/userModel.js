import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String },
  age: { type: Number },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog' }], // Array of blog IDs
});

export default model('User', userSchema);
