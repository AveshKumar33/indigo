const mongoose = require("mongoose");

const parameterPositionImageSchema = new mongoose.Schema({
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute",
    required: true,
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
    required: true,
  },

  parameterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parameter",
    required: true,
  },

  pngImage: {
    type: String,
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

module.exports = mongoose.model(
  "ParameterPositionImage",
  parameterPositionImageSchema
);
