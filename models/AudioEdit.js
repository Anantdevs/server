const mongoose = require("mongoose");

const audioEditSchema = new mongoose.Schema({
  audioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Audio",
    required: true,
  },
  editType: { type: String, required: true }, // e.g., 'crop', 'enhance'
  parameters: { type: Map, of: String }, // stores any parameters related to the edit
  createdAt: { type: Date, default: Date.now },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("AudioEdit", audioEditSchema);
