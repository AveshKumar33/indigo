const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Name is Required"],
  },
  Email: {
    type: String,
    required: [true, "Email is Required"],
  },
  MobNumber: {
    type: Number,
    maxLength: 10,
    required: [true, "Mob. No. is Required"],
  },
  Password: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  status: {
    type: Number,
  },
  userRole: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRole",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  updatedAt: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("User", userSchema);
