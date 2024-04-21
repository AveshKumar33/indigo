const mongoose = require("mongoose");

const customizedComboSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },

  Title: {
    type: String,
    default: "",
  },

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

  image: {
    type: String,
    default: "",
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

module.exports = mongoose.model("customizedCombo", customizedComboSchema);
