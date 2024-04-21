//Normal Customized

const mongoose = require("mongoose");

const dotProductModal = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    Title: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
    TitleSeo: {
      type: String,
      default: "",
    },
    DescriptionSeo: {
      type: String,
      default: "",
    },
    ProductImage: {
      type: String,
      required: true,
    },
    Tags: {
      type: Object,
      default: {},
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
      },
    ],

    images: [
      {
        ProductImage: {
          type: String,
          required: true,
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
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("dotProduct", dotProductModal);
