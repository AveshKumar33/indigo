const mongoose = require("mongoose");

const productBundle = new mongoose.Schema(
  {
    BundleName: {
      type: String,
      required: true,
    },
    bundleImage: {
      type: [String],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    url: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductBundle", productBundle);
