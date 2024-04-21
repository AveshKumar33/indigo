const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  CouponName: {
    type: String,
    unique: true,
    required: true,
  },
  CouponAmount: {
    type: Number,
    // required:true
  },
  CouponType: {
    type: String,
    enum: ["Percentage", "Flat"],
  },
  Description: {
    type: String,
  },
  CouponPercentage: {
    type: Number,
  },
  Min_Order_value_in_Flat: {
    type: Number,
    default: 0,
  },
  MaxDiscount: {
    type: Number,
  },
  ExpireDate: {
    type: "Date",
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

  status: {
    type: Number,
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

module.exports = mongoose.model("Coupon", couponSchema);
