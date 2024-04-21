const mongoose = require("mongoose");

const projectCategorySchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Product Category Name is Required"],
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("projectCategory", projectCategorySchema);
