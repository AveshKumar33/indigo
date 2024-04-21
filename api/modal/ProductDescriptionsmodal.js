const mongoose = require("mongoose");

const ProductDescriptionsSchema = mongoose.Schema({
  Title: {
    type: String,
    required: true,
  },
  Descriptions: {
    type: String,
    required: true,
  },
  Picture: {
    type: [String],
    // required:true
  },
  Product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SingleProductModel",
    required: true,
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
  "ProductDescriptions",
  ProductDescriptionsSchema
);
