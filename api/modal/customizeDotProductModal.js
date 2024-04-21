const mongoose = require("mongoose");

const customizeDotProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    default: "",
  },
  displaySequence: {
    type: Number,
    required: true,
  },

  Title: {
    type: String,
    default: "",
  },

  productTags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],

  Tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectionTagModel",
    },
  ],

  Description: {
    type: String,
    default: "",
  },
  TitleSeo: {
    type: String,
    default: "",
  },
  DescriptionSeo: {
    type: String,
    default: "",
  },

  dotProductImageIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomizeDotProductImageModel",
      required: true,
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

  status: {
    type: Number,
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
  "CustomizeDotProductModel",
  customizeDotProductSchema
);
