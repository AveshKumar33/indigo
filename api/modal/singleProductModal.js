const mongoose = require("mongoose");

const singleProductSchema = new mongoose.Schema({
  ProductName: {
    type: String,
    required: [true, "Product Name is Required"],
  },
  ProductDescription: {
    type: String,
    // required: [true, "Product Description is Required"],
  },
  video: {
    type: String,
    default: "",
  },
  SeoProductTitle: {
    type: String,
  },
  SeoMetaDesc: {
    type: String,
  },

  ProductImage: {
    type: [String],
  },

  FeaturedProduct: {
    type: Boolean,
    default: false,
  },

  Installment: [
    {
      Name: {
        type: String,
      },
      Amount: {
        type: Number,
        default: 0,
      },
    },
  ],
  // OriginalPrice: {
  //   type: Number,
  //   required: [true, "Price Is Required"],
  // },

  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true,
    },
  ],

  Collection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "collection",
      required: true,
    },
  ],

  attribute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attribute",
    },
  ],

  GSTIN: {
    type: Number,
    default: 0,
  },
  displaySequence: {
    type: Number,
  },

  Urlhandle: {
    type: String,
    required: [true, "Product Url Handle Required"],
    unique: true,
  },

  ProductStatus: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  // SalePrice: {
  //   type: Number,
  // },
  SellingType: {
    type: String,
    enum: ["Normal", "Installment"],
    default: "Normal",
  },

  RequestForPrice: {
    type: Boolean,
    required: true,
  },

  // CollectionChild: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "collection",
  //   },
  // ],
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

module.exports = mongoose.model("SingleProductModel", singleProductSchema);
