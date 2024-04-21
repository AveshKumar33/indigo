const mongoose = require("mongoose");

const collectionTagSchema = mongoose.Schema({
  tagName: {
    type: String,
    //   required: true,
    //   unique: true,
  },
  tagDisplaySequence: {
    type: Number,
  },
  collectionFilterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollectionFilterNewModel",
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

  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  updatedAt: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("CollectionTagModel", collectionTagSchema);
