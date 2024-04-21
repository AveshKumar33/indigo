const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  singleProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SingleProductModel",
  },

  singleProductCombinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SingleProductCombinationModel",
  },

  singleProductCombinations: [
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

  createdAt: {
    type: Date,
    default: new Date().toISOString(),
  },

  updatedAt: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("wishlist", wishlistSchema);
