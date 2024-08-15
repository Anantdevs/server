const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const audioRoutes = require("./routes/audioRouter");
const { mkdirp } = require("mkdirp");
require("dotenv").config();

const mongoURI = "mongodb://localhost:27017/AUDIOAPP";
mongoose.connect(mongoURI);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.uploadedBy || "unknown";
    const uploadPath = path.join("uploads", userId);

    mkdirp(uploadPath)
      .then(() => cb(null, uploadPath))
      .catch((err) => cb(err));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File naming
  },
});

const upload = multer({ storage });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//API's CALLING
// Serve static files from the uploads directory
app.use("/uploads", express.static("uploads"));

// Register routes
app.use("/audio", audioRoutes(upload));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
