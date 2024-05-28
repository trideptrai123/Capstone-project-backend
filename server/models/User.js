const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student university', 'Student highschool'], // Chỉ chấp nhận hai giá trị này
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
