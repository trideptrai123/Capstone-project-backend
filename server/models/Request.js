import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: "University", required: true },
    majorId: { type: mongoose.Schema.Types.ObjectId, ref: "Major", required: true },
    year: { type: Number, required: true },
    status: { type: String, enum: ["pending", "accept", "reject", "cancel"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ teacherId: 1, universityId: 1, majorId: 1, year: 1 }, { unique: true });

const Request = mongoose.models.Request || mongoose.model("Request", requestSchema);

export default Request;




