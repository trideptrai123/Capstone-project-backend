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

// Define the University schema
const UniversitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  subjects: [SubjectSchema],
  teachingStandards: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  studentQuality: {
    type: Number,
    required: true,
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
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

// Create the model from the schema
const University =
  mongoose.models.University || mongoose.model('University', UniversitySchema);

export default University;
