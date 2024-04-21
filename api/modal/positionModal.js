const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute",
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

module.exports = mongoose.model("Position", positionSchema);
