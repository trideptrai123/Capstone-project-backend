import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  universityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'University', 
    required: true 
  },
  year: { 
    type: Number, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: false 
  },
}, {
  timestamps: true,
});

reviewSchema.index({ teacherId: 1, universityId: 1, year: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;