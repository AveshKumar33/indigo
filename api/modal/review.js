const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Rating: {
    type: Number,
    required: true,
  },
  ReviewTitle: {
    type: String,
    required: true,
  },
  ReviewBody: {
    type: String,
    required: true,
  },
  ReviewPicture: {
    type: [String],
    // required:true
  },
  // Product: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Product',
  //     required: true
  // },

  singleProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SingleProductModel",
  },
  customizedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomizedProductModel",
  },
  dotProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DotProductModel",
  },
  customizeDotProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomizeDotProductModel",
  },
  customizedCombo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customizedCombo",
  },
  UserDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

module.exports = mongoose.model("Review", reviewSchema);
