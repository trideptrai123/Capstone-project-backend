import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['request', 'message'],  // Giá trị có thể là "request" hoặc "message"
    required: true,
  },
  rawData: {
    type: String,
    required: false, // Không bắt buộc phải có giá trị
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  receive: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isViewed: { type: Boolean, default: false }
  }],
}, {
  timestamps: true, // Tự động thêm các trường createdAt và updatedAt
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
