const mongoose = require("mongoose");

const attribute = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },

  PrintName: {
    type: String,
    required: true,
  },

  isVisibleInCustomize: {
    type: Boolean,
    default: true,
  },

  BurgerSque: {
    type: Number,
    // default: 0,
  },

  Display_Index: {
    type: Number,
    // default: 0,
  },

  UOMId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UOM",
    // require: true,
  },

  status: {
    type: Number,
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

module.exports = mongoose.model("Attribute", attribute);
