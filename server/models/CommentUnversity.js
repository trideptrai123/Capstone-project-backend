import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommentsUniversitySchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  universityId: {
    type: Schema.Types.ObjectId,
    ref: 'University',
    required: true,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'CommentsUniversity',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rating: { 
    type: Number, 
  },
}, {
  timestamps: true,
  collection: 'CommentsUniversity',
  toJSON: { virtuals: true }, // Include virtuals in `toJSON` output
  toObject: { virtuals: true } // Include virtuals in `toObject` output
});
CommentsUniversitySchema.virtual('replies', {
  ref: 'CommentsUniversity',
  localField: '_id',
  foreignField: 'parentComment',
});
const CommentsUniversity = mongoose.models.CommentsUniversity || mongoose.model('CommentsUniversity', CommentsUniversitySchema);
export default CommentsUniversity;