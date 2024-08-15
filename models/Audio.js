const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  filePath: { type: String, required: true },
  duration: { type: Number },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  previousPaths: [String], // Array to store previous paths

  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  isPublished: { type: Boolean, default: false },
});

module.exports = mongoose.model("Audio", audioSchema);
