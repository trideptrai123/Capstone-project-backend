import mongoose from 'mongoose';

const { Schema } = mongoose;

const universitySchema = new Schema(
  {
    UniversityID: {
      type: String,
      required: true,
      unique: true,
    },
    UniversityName: {
      type: String,
      required: true,
    },
    City: {
      type: String,
      required: true,
    },
    Website: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
      required: true,
    },
    Chancellor: String,
    RegionID: {
      type: String,
      required: true,
    },
    MajorID: {
      type: String,
      required: true,
    },
    EntranceScoreID: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const University = mongoose.model('University', universitySchema);

export default University;
