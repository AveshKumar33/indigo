const mongoose = require("mongoose");

const attributeModal = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    UOM: {
      type: String,
      required: true,
    },
    PrintName: {
      type: String,
      required: true,
    },
    Display_Index: {
      type: Number,
      default: 0,
    },
    BurgerSque: {
      type: Number,
      default: 0,
    },
    OptionsValue: [
      {
        Name: {
          type: String,
          required: true,
        },
        DisplayIndex: {
          type: Number,
          default: 1,
        },

        Photo: {
          type: String,
          // required:true,
        },
        PNG: {
          type: String,
          // required:true,
        },
        AttributePrice: {
          type: Number,
        },
        AttributeCategory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttributeCategory",
        },
        PngPositionsImages: [
          {
            Name: {
              type: String,
            },
            Png: {
              type: String,
            },
          },
        ],
      },
    ],
    PositionsImages: [
      {
        Name: {
          type: String,
          required: true,
        },
        PngPositionsImages: [
          {
            OptionsValueId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "attributeModal.OptionsValue",
            },
            OptionsValueName: {
              type: String,
              required: true,
            },
            Png: {
              type: String,
            },
          },
        ],
      },
    ],
    enable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("attributeModal", attributeModal);
