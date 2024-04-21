const mongoose = require("mongoose");

const CollectionFiltersSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      unique: true,
    },
    Filter: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CollectionFilters", CollectionFiltersSchema);
