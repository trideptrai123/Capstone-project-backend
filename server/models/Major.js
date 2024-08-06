import mongoose from "mongoose";

const majorSchema = new mongoose.Schema({
  name: String,
  description: String,
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MajorHistory' }],
});

const Major = mongoose.models.Major || mongoose.model("Major", majorSchema);

export default Major;