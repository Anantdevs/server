const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  audioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Audio",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Like", likeSchema);
