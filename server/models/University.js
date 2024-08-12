import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the Subject schema
const SubjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  sector: {
    type: String,
    enum: ['high quality program', 'regular program'],
    required: true,
  },
  entryPoints: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        // Ensure entry points are positive
        return v > 0;
      },
      message: (props) => `${props.value} is not a valid entry point!`,
    },
  },
});
const nationalRankingSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
    min: 1,
    max: 100, // Assuming ranks are between 1 and 100
  },
});
// Define the University schema
const UniversitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: true,
  },
  subjects: [SubjectSchema],
  teachingStandards: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  studentQuality: {
    type: Number,
    required: false,
    min: 0,
    max: 100,
  },
  facilitiesStandards: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  nationalRanking: {
    type: [nationalRankingSchema],
    required: true,
   
  },
  description: { type: String, required: true },
  website: { type: String, required: true },
  admissionCode: {
    type: String,
    required: true,
  },
  establishedYear: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const University =
  mongoose.models.University || mongoose.model('University', UniversitySchema);

export default University;
