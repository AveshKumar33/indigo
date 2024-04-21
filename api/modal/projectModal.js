const mongoose = require("mongoose");

const newprojectSchema = new mongoose.Schema(
  {
    ProjectName: {
      type: String,
      required: [true, "Product Name is Required"],
    },
    ProjectDescription: {
      type: String,
      required: [true, "Product Description is Required"],
    },
    ProjectImage: {
      type: [String],
    },
    ProjectCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projectCategory",
      required: true,
    },
    singleProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SingleProductModel",
      },
    ],
    dotSingleProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DotProductModel",
      },
    ],
    customizedProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomizedProductModel",
      },
    ],
    customizeDotProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomizeDotProductModel",
      },
    ],

    video: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", newprojectSchema);
