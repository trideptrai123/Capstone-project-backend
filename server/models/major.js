import mongoose from 'mongoose';

const { Schema } = mongoose;

const majorSchema = new Schema({
    MajorID: {
        type: String,
        required: true,
        unique: true
    },
    MajorName: {
        type: String,
        required: true
    },
    RegularProgram: {
        type: String,
        maxlength: 100
    },
    AdvancedProgram: {
        type: String,
        maxlength: 100
    },
    HighQualityProgram: {
        type: String,
        maxlength: 100
    }
}, { timestamps: true });

const Major = mongoose.model('Major', majorSchema);

export default Major;
