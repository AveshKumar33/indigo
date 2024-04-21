const mongoose = require("mongoose");

const raiseAQuerySchema = mongoose.Schema(
  {
    Name: {
      type: String,
      required: [true, "Name Can't be empty"],
    },
    Email: {
      type: String,
      required: [true, "Email is Required"],
    },
    singleProductId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    customizedProductId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // EnquiryFor: {
    //   type: String,
    //   enum:["Academy","Franchise","Contact Us","Machine"],
    // },
    // EquipmentName: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Product",
    //   required: [true, "Product Name Can't be Empty"]
    // },
    MobNumber: {
      type: Number,
      required: [true, "MobileNumber is Required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}/.test(v);
        },
        message: "{VALUE} is not a valid 10 digit number!",
      },
    },
    Message: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("raiseAQuery", raiseAQuerySchema);
