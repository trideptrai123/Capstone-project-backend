import mongoose from 'mongoose';
const { Schema } = mongoose;

const BlogPostSchema = new Schema({
  headerImage: {
    type: String, 
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, 
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'CategoryPost', 
    required: true,
  },
  university: {
    type: Schema.Types.ObjectId,
    ref: 'University', 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, 
});

const BlogPost =
  mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
  

export default BlogPost;