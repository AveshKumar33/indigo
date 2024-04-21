const mongoose = require("mongoose");

const dotProductImageSchema = new mongoose.Schema({
  dotProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DotProductModel",
  },

  image: {
    type: String,
    // required: true,
  },

  video: {
    type: String,
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
        ref: "SingleProductModel",
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

module.exports = mongoose.model("DotProductImageModel", dotProductImageSchema);
