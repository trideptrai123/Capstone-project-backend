import mongoose from "mongoose";

const majorHistorySchema = new mongoose.Schema(
  {
    majorId: { type: mongoose.Schema.Types.ObjectId, ref: "Major", required: true },
    year: { type: Number, required: true },
    studentsGraduated: { type: Number, min: 0 },
    studentsEnrolled: { type: Number, min: 0 },
    courseEvaluations: { type: Number },
    admissionScore: { type: Number, min: 0 },
    teachers: [
      {
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        yearsExperience: { type: Number, min: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

majorHistorySchema.index({ majorId: 1, year: 1 }, { unique: true });

const MajorHistory = mongoose.models.MajorHistory || mongoose.model("MajorHistory", majorHistorySchema);

export default MajorHistory;