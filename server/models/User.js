const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['university_student', 'high_school_student'],
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving the user model
// userSchema.pre('save', async function (next) {
//   if (this.isModified('password') || this.isNew) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

// // Method to compare password
// userSchema.methods.comparePassword = async function (password) {
//   return bcrypt.compare(password, this.password);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
