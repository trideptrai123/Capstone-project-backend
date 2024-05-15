import mongoose from 'mongoose';

const { Schema } = mongoose;

const newsSchema = new Schema({
    NewsID: {
        type: String,
        required: true,
        unique: true
    },
    UniversityID: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        enum: ['News', 'Event'],
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    Content: {
        type: String,
        required: true
    },
    Description: String,
    Time: {
        type: Date,
        required: true
    },
    Category: {
        type: String,
        enum: ['Scholarship', 'Soft Skills', 'Experience'],
        required: true
    },
    DatePosted: {
        type: Date,
        required: true
    },
    Location: String
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);

export default News;
