const express = require("express");
const audioController = require("../controllers/audioController");

const router = express.Router();

module.exports = (upload) => {
  // Define the route for file uploads
  router.post("/uploads", upload.single("audio"), audioController.uploadAudio);
  router.post("/crop/:audioId", audioController.cropAudio);
  return router;
};
