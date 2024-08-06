import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
      
    },
    gender:{
      type: String,
      required: false,
      enum: ["Nam","Nữ",""],
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: false,
      enum: ["Student university", "High school student"],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "staff", "user", "teacher"],
      default: "user",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    likedUniversities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
      },
    ],
    // Fields specific to staff and teacher roles
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: function() {
        return this.role === "teacher" || this.role === "staff";
      },
    },
    yearsExperience: {
      type: Number,
      required: function() {
        return this.role === "teacher";
      },
    },
    certificates: [
      {
        type: String,
        required: function() {
          return this.role === "teacher";
        },
      },
    ],
    rating: {
      type: Number,
      required: function() {
        return this.role === "teacher";
      },
    },
    dateOfBirth: {
      type: Date,
      required: function() {
        return this.role === "teacher";
      },
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
