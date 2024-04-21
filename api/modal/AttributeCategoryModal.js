const mongoose = require("mongoose");

const AttributeCategory = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },

  status: {
    type: Number,
  },

  displayIndex: {
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

module.exports = mongoose.model("AttributeCategory", AttributeCategory);
