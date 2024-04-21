const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
  },
  status: {
    type: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
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

module.exports = mongoose.model("UserRole", userRoleSchema);
