const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Name is Required"],
    },
    Phone: {
      type: Number,
      required: [true, "Mob Number is Required"],
    },
    Email: {
      type: String,
      required: [true, "Email is Required"],
    },
    Coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    Amount: {
      type: Number,
      required: [true, "Amount is Required"],
    },
    DiscountAmount: {
      type: Number,
      // required: [true,"Amount is Required"]
    },
    PinCode: {
      type: Number,
      required: [true, "Pincode is Required"],
    },
    City: {
      type: String,
      required: [true, "City is Required"],
    },
    State: {
      type: String,
      required: [true, "State is Required"],
    },
    Remarks: {
      type: String,
    },
    Address: {
      type: String,
      required: [true, "Address is Required"],
    },
    orderItems: {
      type: Array,
      default: [],
    },
    paymentStatus: {
      type: String,
    },
    UserDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is Required"],
    },
    OrderID: {
      type: Number,
      required: true,
    },
    orderFiles: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
