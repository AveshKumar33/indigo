const mongoose = require("mongoose");

const customizeDotProductImageSchema = new mongoose.Schema({
  dotProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomizeDotProductModel",
  },

  image: {
    type: String,
    // required: true,
  },
  video: {
    type: String,
    // required: true,
  },

  dots: [
    {
      positionX: {
        type: Number,
      },
      positionY: {
        type: Number,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomizedProductModel",
      },
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
  "CustomizeDotProductImageModel",
  customizeDotProductImageSchema
);
