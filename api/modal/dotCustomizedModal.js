const mongoose = require("mongoose");

//  Unused

const dotCustomizedProductModal = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ProductImage: {
      type: String,
      required: true,
    },
    Tags: {
      type: [Object],
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
          ref: "Product",
        },
        Height: {
          type: Number,
        },
        Width: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "dotCustomizedProduct",
  dotCustomizedProductModal
);
