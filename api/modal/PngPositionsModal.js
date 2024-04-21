const mongoose = require("mongoose");

const PngPositions = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Photo: {
      type: String,
    //   required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PngPositions", PngPositions);
