import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blogPostId: {
    type: Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'Comments',
  toJSON: { virtuals: true }, // Include virtuals in `toJSON` output
  toObject: { virtuals: true } // Include virtuals in `toObject` output
});
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
});
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
export default Comment;