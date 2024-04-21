const mongoose = require("mongoose");

const headerImageSchema = new mongoose.Schema({
  rootPath: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "collection",
  },

  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "collection",
  },

  pngImage: {
    type: String,
  },

  isRoot: {
    type: Boolean,
  },

  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  updatedAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("headerImage", headerImageSchema);
