const Audio = require("../models/Audio");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs"); // Import the fs module
const { mkdirp } = require("mkdirp");

const uploadAudio = async (req, res) => {
  try {
    const { title, description, duration, uploadedBy } = req.body;

    if (!title || !uploadedBy) {
      return res
        .status(400)
        .json({ message: "Title and uploadedBy are required" });
    }

    const audio = new Audio({
      title,
      description,
      filePath: req.file.path, // Path where the file is stored
      duration,
      uploadedBy,
    });

    await audio.save();
    res.status(201).json({ message: "File uploaded successfully", audio });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error });
  }
};

const cropAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    const { start, end } = req.body;

    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Start and end times are required" });
    }

    const audio = await Audio.findById(audioId);
    if (!audio) {
      return res.status(404).json({ message: "Audio not found" });
    }

    const inputPath = path.resolve(audio.filePath);
    const userId = req.body.uploadedBy || "unknown";

    const outputDir = path.resolve("uploads", userId, "cropped");
    const outputFileName =
      "cropped_" + Date.now() + path.extname(audio.filePath);
    const outputPath = path.join(outputDir, outputFileName);

    await mkdirp(outputDir);

    ffmpeg(inputPath)
      .setStartTime(start) // Start time in seconds
      .setDuration(end - start) // Duration in seconds
      .output(outputPath)
      .on("end", async () => {
        // Convert the absolute paths to relative paths
        const relativeInputPath = path.relative(process.cwd(), inputPath);
        const relativeOutputPath = path.relative(process.cwd(), outputPath);

        // Update the audio document
        const updatedAudio = await Audio.findByIdAndUpdate(
          audioId,
          {
            $push: { previousPaths: relativeInputPath }, // Add the relative input path to previousPaths
            filePath: relativeOutputPath, // Update the file path with the new cropped file path
            duration: end - start, // Update the duration
          },
          { new: true } // Return the updated document
        );

        // Remove the oldest path if there are more than 4 paths
        if (updatedAudio.previousPaths.length > 4) {
          const oldestPath = updatedAudio.previousPaths.shift();
          const absoluteOldestPath = path.resolve(process.cwd(), oldestPath);
          fs.unlink(absoluteOldestPath, (err) => {
            if (err) {
              console.error("Error deleting old file:", err);
            }
          });

          //after deleting the topmost element moving one folder above the top most element

          //   const topPath = audio.previousPaths[audio.previousPaths.length - 1];
          //   if (topPath.includes("cropped")) {

          //     const topPathDir = path.dirname(topPath);
          //     const newPathDir = path.join("uploads", userId);
          //     const newPath = path.join(newPathDir, path.basename(oldestPath));
          //     await mkdirp(newPathDir);
          //     fs.rename(topPath, newPath, (err) => {
          //       if (err) console.error("Error moving file:", err);
          //     });
          //   }

          await Audio.findByIdAndUpdate(audioId, {
            $set: { previousPaths: updatedAudio.previousPaths },
          });
        }

        res.status(200).json({
          message: "Audio cropped successfully",
          audio: await Audio.findById(audioId),
        });
      })
      .on("error", (err) => {
        console.log(err);
        res
          .status(500)
          .json({ message: "Error cropping audio", error: err.message });
      })
      .run();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing request", error });
  }
};
module.exports = {
  uploadAudio,
  cropAudio,
};
