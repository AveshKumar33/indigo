const mongoose = require("mongoose");

const singleProductCombinationSchema = new mongoose.Schema({
  singleProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SingleProductModel",
  },
  SKU: {
    type: String,
    // unique: true,
  },
  Barcode: {
    type: String,
  },
  SalePrice: {
    type: Number,
  },
  MRP: {
    type: Number,
  },
  combinations: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
      parameterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parameter",
      },
    },
  ],
  ProductInStockQuantity: {
    type: Number,
    // required: [true, "Product InStock Qunatity Required"],
  },

  isDefault: {
    type: Boolean,
    // default: true,
  },

  image: {
    type: String,
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

module.exports = mongoose.model(
  "SingleProductCombinationModel",
  singleProductCombinationSchema
);
