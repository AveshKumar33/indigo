const mongoose = require("mongoose");

const customizedComboRectangleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  customizedComboId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customizedCombo",
    required: true,
  },

  top: {
    type: Number,
    required: true,
  },

  left: {
    type: Number,
    required: true,
  },

  height: {
    type: Number,
    required: true,
  },

  width: {
    type: Number,
    required: true,
  },

  addOnProduct: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CustomizedProductModel",
    required: true,
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

module.exports = mongoose.model(
  "customizedComboRectangle",
  customizedComboRectangleSchema
);
