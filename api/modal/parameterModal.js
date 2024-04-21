const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  attributeCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttributeCategory",
    required: true,
  },
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute",
    required: true,
  },

  displayIndex: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  profileImage: {
    type: String,
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

module.exports = mongoose.model("Parameter", parameterSchema);
