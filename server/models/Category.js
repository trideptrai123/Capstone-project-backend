import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the CategoryPost schema
const CategoryPostSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields,
  collection: 'categoryPosts'
});

// Define the model and collection name
const CategoryPost =
  mongoose.models.CategoryPost || mongoose.model('CategoryPost', CategoryPostSchema);

export default CategoryPost;