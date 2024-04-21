const mongoose = require("mongoose");

const collectionFilterNewSchema = mongoose.Schema({
  filterName: {
    type: String,
    //   required: true,
    //   unique: true,
  },
  displaySequence: {
    type: Number,
  },

  collectionTagIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectionTagModel",
    },
  ],
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

module.exports = mongoose.model(
  "CollectionFilterNewModel",
  collectionFilterNewSchema
);
