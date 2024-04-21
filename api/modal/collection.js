const mongoose = require("mongoose");

const collection = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  video: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    required: true,
  },

  CollectionImage: [
    {
      type: String,
      required: true,
    },
  ],

  CollectionVideo: [
    {
      type: String,
      required: true,
    },
  ],

  seoTitle: {
    type: String,
    required: true,
  },

  seoMetaDescription: {
    type: String,
    required: true,
  },

  url: {
    type: String,
    required: true,
    unique: true,
  },

  rootPath: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
    },
  ],

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "collection",
  },

  status: {
    type: Number,
  },
  displaySequence: {
    type: Number,
  },
  mostSellingProduct: {
    type: Number,
  },

  isRoot: {
    type: Boolean,
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

module.exports = mongoose.model("collection", collection);
